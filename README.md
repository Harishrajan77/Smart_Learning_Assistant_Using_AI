# Smart Learning Assistant using RAG and Generative AI

Smart Learning Assistant is a final-year AI and Data Science project built as a polished full-stack product. It combines React, FastAPI, SQLite, FAISS, SentenceTransformers, pypdf, and Google Gemini to help students learn from uploaded PDFs, generate summaries, ask questions with RAG, create quizzes, improve resumes, prepare for interviews, and explore career roadmaps.

## Features

- Premium dark-mode SaaS-style dashboard
- Demo login with localStorage-based session handling
- PDF upload and persistence in `uploads/`
- Automatic FAISS index creation in `faiss_indexes/`
- PDF summarization with bullet notes and difficult-concept explanations
- RAG-based question answering from uploaded study material
- Quiz generation from PDF content
- Resume review and ATS optimization guidance
- Interview preparation for HR, technical, and mock rounds
- Career roadmap generation for multiple paths
- SQLite-backed dashboard stats, recent activity, and last 3 files
- Toast notifications, animated cards, progress indicators, and responsive layout

## Project Structure

```text
smart_learning_assistant/
│── frontend/
│── backend/
│── uploads/
│── faiss_indexes/
│── .env.example
│── README.md
```

## Environment Variables

Create a `.env` file in the project root or export the variable before running the backend:

```env
GEMINI_API_KEY=your_key_here
VITE_API_URL=http://127.0.0.1:8000
APP_SECRET_KEY=change_this_to_a_long_random_secret
```

## Backend Setup

1. Open a terminal in `smart_learning_assistant/backend`
2. Create and activate a virtual environment
3. Install dependencies
4. Start FastAPI

```bash
cd smart_learning_assistant/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend will run on [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Frontend Setup

1. Open another terminal in `smart_learning_assistant/frontend`
2. Install packages
3. Start Vite

```bash
cd smart_learning_assistant/frontend
npm install
npm run dev
```

Frontend will run on [http://127.0.0.1:5173](http://127.0.0.1:5173).

## Authentication

- Register a new account from the login screen, or use the seeded account:
- Email: `admin@student.com`
- Password: `admin123`
- Backend sessions use a signed token stored in the browser session state

## API Endpoints

- `POST /login`
- `POST /register`
- `POST /upload`
- `GET /files/recent`
- `GET /dashboard/stats`
- `POST /summarize/{file_id}`
- `POST /ask/{file_id}`
- `POST /quiz/{file_id}`
- `POST /resume`
- `POST /interview`
- `POST /career`

## How RAG Works

1. User uploads a PDF
2. Text is extracted using `pypdf`
3. Content is split into overlapping chunks
4. SentenceTransformers generates embeddings
5. FAISS stores the vector index on disk
6. User asks a question for a selected file
7. Relevant chunks are retrieved
8. Gemini generates the final answer grounded in those chunks

## Database Tables

### `uploaded_files`
- `id`
- `filename`
- `filepath`
- `file_size`
- `upload_time`

### `chat_history`
- `id`
- `module`
- `question`
- `answer`
- `created_at`

### `users`
- `id`
- `email`
- `name`

## Future Scope

- Multi-user authentication with JWT
- OCR support for scanned PDFs
- Subject-wise folders and tagging
- Semantic search across multiple uploaded files
- Export summaries and quizzes as PDF or DOCX
- Voice-based doubt solving and mock interviews
- Admin analytics and usage dashboards
