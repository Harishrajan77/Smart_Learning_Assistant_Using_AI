import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from pypdf import PdfReader

from auth import create_access_token, decode_access_token, verify_password
from ai_services import (
    generate_career_guidance,
    generate_code_debug_help,
    generate_interview_help,
    generate_quiz,
    generate_resume_help,
    generate_summary,
    answer_from_context,
)
from database import (
    create_chat_history,
    create_uploaded_file,
    create_user,
    get_dashboard_stats,
    get_uploaded_file,
    get_user_by_id,
    get_user_by_email,
    init_db,
    list_recent_files,
)
from rag import build_and_store_index, get_document_text, retrieve_context


BASE_DIR = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"
INDEX_DIR = BASE_DIR / "faiss_indexes"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class AskRequest(BaseModel):
    question: str = Field(min_length=3)


class QuizRequest(BaseModel):
    quiz_type: str = Field(default="MCQs")
    number_of_questions: int = Field(default=5, ge=3, le=15)


class ResumeRequest(BaseModel):
    resume_text: str = Field(min_length=20)
    request: str = Field(default="Review my resume for AI/DS roles.")


class InterviewRequest(BaseModel):
    role: str = Field(default="AI Engineer")
    focus: str = Field(default="Technical and HR preparation")


class CareerRequest(BaseModel):
    track: str = Field(default="AI Engineer roadmap")
    profile: str = Field(default="Final-year AI and Data Science student")


class CodeDebugRequest(BaseModel):
    code_text: str = Field(min_length=10)
    language: str = Field(default="Auto-detect")
    request: str = Field(default="Debug this code and recommend an optimal solution if needed.")


app = FastAPI(title="Smart Learning Assistant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event() -> None:
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    INDEX_DIR.mkdir(parents=True, exist_ok=True)
    init_db()


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Smart Learning Assistant API is running."}


def sanitize_user(user: dict) -> dict:
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
    }


def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required.")

    token = authorization.replace("Bearer ", "", 1).strip()
    try:
        payload = decode_access_token(token)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc

    user = get_user_by_id(int(payload["user_id"]))
    if not user:
        raise HTTPException(status_code=401, detail="User not found.")
    return user


@app.post("/register")
def register(payload: RegisterRequest) -> dict:
    existing_user = get_user_by_email(payload.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    user = create_user(payload.email, payload.name, payload.password)
    token = create_access_token(user["id"], user["email"])
    return {"message": "Account created successfully", "user": sanitize_user(user), "token": token}


@app.post("/login")
def login(payload: LoginRequest) -> dict:
    user = get_user_by_email(payload.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if not user.get("password_hash") or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token(user["id"], user["email"])

    return {
        "message": "Login successful",
        "user": sanitize_user(user),
        "token": token,
    }


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)) -> dict:
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    safe_name = f"{uuid4().hex}_{Path(file.filename).name}"
    destination = UPLOADS_DIR / safe_name
    with destination.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_record = create_uploaded_file(file.filename, str(destination), destination.stat().st_size)

    try:
        indexing_result = build_and_store_index(file_record["id"], file_record["filename"], file_record["filepath"])
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {exc}") from exc

    return {
        "message": "PDF uploaded and indexed successfully.",
        "file": file_record,
        "indexing": indexing_result,
    }


@app.get("/files/recent")
def recent_files(limit: int = 6, current_user: dict = Depends(get_current_user)) -> dict:
    return {"files": list_recent_files(limit)}


@app.get("/dashboard/stats")
def dashboard_stats(current_user: dict = Depends(get_current_user)) -> dict:
    return get_dashboard_stats()


def extract_resume_text(upload: UploadFile) -> str:
    suffix = Path(upload.filename or "").suffix.lower()

    if suffix == ".pdf":
        reader = PdfReader(upload.file)
        text = "\n".join((page.extract_text() or "") for page in reader.pages).strip()
    elif suffix == ".txt":
        text = upload.file.read().decode("utf-8", errors="ignore").strip()
    else:
        raise HTTPException(status_code=400, detail="Resume upload supports only PDF and TXT files.")

    if not text:
        raise HTTPException(status_code=400, detail="Could not extract readable text from the resume file.")

    return text


def extract_code_text(upload: UploadFile) -> str:
    suffix = Path(upload.filename or "").suffix.lower()
    allowed_suffixes = {
        ".py",
        ".js",
        ".ts",
        ".tsx",
        ".jsx",
        ".java",
        ".cpp",
        ".c",
        ".cs",
        ".php",
        ".go",
        ".rb",
        ".swift",
        ".kt",
        ".sql",
        ".html",
        ".css",
        ".json",
        ".txt",
        ".md",
    }

    if suffix not in allowed_suffixes:
        raise HTTPException(status_code=400, detail="Unsupported code file type. Upload a common source-code or text file.")

    text = upload.file.read().decode("utf-8", errors="ignore").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract readable code from the uploaded file.")

    return text


@app.post("/summarize/{file_id}")
def summarize_file(file_id: int, current_user: dict = Depends(get_current_user)) -> dict:
    file_record = get_uploaded_file(file_id)
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found.")

    try:
        document_text = get_document_text(file_id)
        summary = generate_summary(document_text)
        create_chat_history("summarization", f"Summarize {file_record['filename']}", summary["summary"])
        return {"file": file_record, **summary}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/ask/{file_id}")
def ask_from_file(file_id: int, payload: AskRequest, current_user: dict = Depends(get_current_user)) -> dict:
    file_record = get_uploaded_file(file_id)
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found.")

    try:
        context_chunks = retrieve_context(file_id, payload.question)
        answer = answer_from_context(payload.question, context_chunks)
        create_chat_history("learning_qa", payload.question, answer)
        return {"file": file_record, "context_chunks": context_chunks, "answer": answer}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/quiz/{file_id}")
def quiz_from_file(file_id: int, payload: QuizRequest, current_user: dict = Depends(get_current_user)) -> dict:
    file_record = get_uploaded_file(file_id)
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found.")

    try:
        document_text = get_document_text(file_id)
        quiz = generate_quiz(document_text, payload.quiz_type, payload.number_of_questions)
        create_chat_history("quiz_generator", f"{payload.quiz_type} for {file_record['filename']}", quiz)
        return {"file": file_record, "quiz_type": payload.quiz_type, "quiz": quiz}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/resume")
def resume_assistant(payload: ResumeRequest, current_user: dict = Depends(get_current_user)) -> dict:
    try:
        response = generate_resume_help(payload.resume_text, payload.request)
        create_chat_history("resume_assistant", payload.request, str(response["full_review"]))
        return response
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/resume/upload")
async def resume_upload_assistant(
    file: UploadFile = File(...),
    request: str = Form("Review my resume for AI/DS internships and fresher roles."),
    current_user: dict = Depends(get_current_user),
) -> dict:
    try:
        resume_text = extract_resume_text(file)
        response = generate_resume_help(resume_text, request)
        create_chat_history("resume_assistant", f"{request} | {file.filename}", str(response["full_review"]))
        return {
            "filename": file.filename,
            "extracted_characters": len(resume_text),
            **response,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/interview")
def interview_assistant(payload: InterviewRequest, current_user: dict = Depends(get_current_user)) -> dict:
    try:
        response = generate_interview_help(payload.role, payload.focus)
        create_chat_history("interview_preparation", f"{payload.role} | {payload.focus}", response)
        return {"answer": response}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/career")
def career_assistant(payload: CareerRequest, current_user: dict = Depends(get_current_user)) -> dict:
    try:
        response = generate_career_guidance(payload.track, payload.profile)
        create_chat_history("career_guidance", f"{payload.track} | {payload.profile}", response)
        return {"answer": response}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/code-debug")
def code_debug_assistant(payload: CodeDebugRequest, current_user: dict = Depends(get_current_user)) -> dict:
    try:
        response = generate_code_debug_help(payload.code_text, payload.language, payload.request)
        create_chat_history("code_debugger", f"{payload.language} | {payload.request}", str(response["full_review"]))
        return response
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/code-debug/upload")
async def code_debug_upload_assistant(
    file: UploadFile = File(...),
    request: str = Form("Debug this code and recommend an optimal solution if needed."),
    language: str = Form("Auto-detect"),
    current_user: dict = Depends(get_current_user),
) -> dict:
    try:
        code_text = extract_code_text(file)
        response = generate_code_debug_help(code_text, language, request)
        create_chat_history("code_debugger", f"{language} | {file.filename}", str(response["full_review"]))
        return {
            "filename": file.filename,
            "extracted_characters": len(code_text),
            **response,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
