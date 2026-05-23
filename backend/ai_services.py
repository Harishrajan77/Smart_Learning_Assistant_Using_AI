import os
import re
from pathlib import Path

import google.generativeai as genai
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

MODEL_NAME = "gemini-2.5-flash"


def get_gemini_model():
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise ValueError("GEMINI_API_KEY is missing. Add it to your environment before running the backend.")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(MODEL_NAME)


def generate_text(prompt: str) -> str:
    model = get_gemini_model()
    response = model.generate_content(prompt)
    text = getattr(response, "text", "") or ""
    if not text.strip():
        raise ValueError("Gemini returned an empty response.")
    return text.strip()


def generate_summary(document_text: str) -> dict[str, str]:
    limited_text = document_text[:18000]
    summary_prompt = f"""
    You are a smart academic learning assistant for university students.
    Study the following learning material and produce:
    1. A concise academic summary
    2. Bullet-point revision notes
    3. A simple explanation of the toughest concept

    Return your response in this exact format:
    SUMMARY:
    <summary>

    BULLET_NOTES:
    <bullet notes>

    DIFFICULT_CONCEPT:
    <concept explanation>

    Learning Material:
    {limited_text}
    """
    output = generate_text(summary_prompt)

    sections = {"summary": output, "bullet_notes": output, "difficult_concept": output}
    if "BULLET_NOTES:" in output and "DIFFICULT_CONCEPT:" in output:
        summary_part, rest = output.split("BULLET_NOTES:", 1)
        bullet_part, concept_part = rest.split("DIFFICULT_CONCEPT:", 1)
        sections = {
            "summary": summary_part.replace("SUMMARY:", "").strip(),
            "bullet_notes": bullet_part.strip(),
            "difficult_concept": concept_part.strip(),
        }

    return sections


def answer_from_context(question: str, context_chunks: list[str]) -> str:
    context = "\n\n".join(context_chunks)
    prompt = f"""
    You are an expert tutor helping a final-year student.
    Use only the provided context to answer the question.
    If the answer is not available in the context, say that clearly and suggest what to review.

    Context:
    {context}

    Question:
    {question}

    Return the answer using this structure:
    TITLE:
    <short answer title>

    EXPLANATION:
    <clear explanation in short paragraphs>

    KEY_POINTS:
    <bullet points>

    QUICK_TAKEAWAY:
    <one short closing line>
    """
    return generate_text(prompt)


def generate_quiz(document_text: str, quiz_type: str, number_of_questions: int) -> str:
    prompt = f"""
    Create {number_of_questions} {quiz_type} based on the study material below.
    Keep the questions relevant for final-year students.
    For MCQs include four options and the correct answer.
    For viva, short answer, and important questions include model answers.
    Use consistent spacing and clear numbering.
    Put each question on its own block with visible spacing.

    Study Material:
    {document_text[:16000]}
    """
    return generate_text(prompt)


def _parse_resume_feedback(output: str) -> dict[str, str | int]:
    score_match = re.search(r"ATS[_ ]?SCORE\s*:\s*(\d{1,3})", output, re.IGNORECASE)
    ats_score = int(score_match.group(1)) if score_match else 72
    ats_score = max(0, min(100, ats_score))

    def section(name: str, fallback: str = "") -> str:
        pattern = rf"{name}\s*:\s*(.*?)(?=\n[A-Z_ ]+\s*:|\Z)"
        match = re.search(pattern, output, re.IGNORECASE | re.DOTALL)
        return match.group(1).strip() if match else fallback

    return {
        "ats_score": ats_score,
        "summary": section("SUMMARY", output),
        "strengths": section("STRENGTHS", output),
        "gaps": section("GAPS", output),
        "keywords": section("MISSING_KEYWORDS", output),
        "tips": section("TIPS", output),
        "improved_lines": section("IMPROVED_LINES", output),
        "full_review": output.strip(),
    }


def generate_resume_help(resume_text: str, request: str) -> dict[str, str | int]:
    prompt = f"""
    You are a resume mentor for an AI and Data Science student.
    Student request: {request}

    Resume / profile text:
    {resume_text}

    Evaluate the resume like an ATS-focused mentor for fresher AI/DS roles.
    Return your response in this exact structure:

    ATS_SCORE: <number out of 100>
    SUMMARY:
    <2-4 lines overall review>

    STRENGTHS:
    <bullet points>

    GAPS:
    <bullet points>

    MISSING_KEYWORDS:
    <bullet points>

    TIPS:
    <bullet points>

    IMPROVED_LINES:
    <rewrite weak resume lines into stronger versions>
    """
    output = generate_text(prompt)
    return _parse_resume_feedback(output)


def generate_interview_help(role: str, focus: str) -> str:
    prompt = f"""
    You are an interview coach for fresh graduates.
    Target role: {role}
    Focus area: {focus}

    Provide a structured response with headings:
    HR QUESTIONS:
    TECHNICAL QUESTIONS:
    MOCK INTERVIEW:
    FRESHER GUIDANCE:
    COMMUNICATION TIPS:
    """
    return generate_text(prompt)


def generate_career_guidance(track: str, profile: str) -> str:
    prompt = f"""
    You are a career roadmap advisor for students.
    Target path: {track}
    Student profile: {profile}

    Provide a structured response with headings:
    ROADMAP PHASES:
    SKILLS TO LEARN:
    PROJECT IDEAS:
    CERTIFICATIONS_OR_HIGHER_STUDIES:
    JOB_READINESS:
    """
    return generate_text(prompt)


def _parse_debug_feedback(output: str) -> dict[str, str]:
    def section(name: str, fallback: str = "") -> str:
        pattern = rf"{name}\s*:\s*(.*?)(?=\n[A-Z_ ]+\s*:|\Z)"
        match = re.search(pattern, output, re.IGNORECASE | re.DOTALL)
        return match.group(1).strip() if match else fallback

    return {
        "summary": section("SUMMARY", output),
        "issues": section("ISSUES", output),
        "root_cause": section("ROOT_CAUSE", output),
        "fix": section("FIX", output),
        "optimized_solution": section("OPTIMIZED_SOLUTION", output),
        "best_practices": section("BEST_PRACTICES", output),
        "full_review": output.strip(),
    }


def generate_code_debug_help(code_text: str, language: str, request: str) -> dict[str, str]:
    prompt = f"""
    You are a senior full-stack debugging assistant.
    Analyze the code carefully, identify the main bug or risk, explain the likely root cause, and recommend a cleaner or more optimal solution only if it adds clear value.
    Keep the response concise and high-signal.

    User request:
    {request}

    Language or stack:
    {language}

    Code:
    {code_text[:18000]}

    Return your answer in this exact structure:

    SUMMARY:
    <2-3 short lines only>

    ISSUES:
    <at most 4 short bullet points of the most important bugs or risks>

    ROOT_CAUSE:
    <2-4 short lines>

    FIX:
    <3-5 short action bullets only>

    OPTIMIZED_SOLUTION:
    <only include if truly needed, keep it to 2-4 short lines>

    BEST_PRACTICES:
    <at most 3 short bullet points>
    """
    output = generate_text(prompt)
    return _parse_debug_feedback(output)
