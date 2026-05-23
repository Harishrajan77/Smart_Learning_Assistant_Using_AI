import { DashboardStats, UploadedFile, User } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const AUTH_KEY = "sla-auth-session";

function getAuthToken() {
  const saved = localStorage.getItem(AUTH_KEY);
  if (!saved) return null;

  try {
    const session = JSON.parse(saved) as { token?: string };
    return session.token ?? null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...(options?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed." }));
    throw new Error(error.detail || "Request failed.");
  }

  return response.json();
}

export const api = {
  register: (name: string, email: string, password: string) =>
    request<{ message: string; user: User; token: string }>("/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ message: string; user: User; token: string }>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  uploadPdf: (formData: FormData) =>
    request<{ message: string; file: UploadedFile }>("/upload", {
      method: "POST",
      body: formData,
    }),

  getRecentFiles: () => request<{ files: UploadedFile[] }>("/files/recent?limit=6"),

  getDashboardStats: () => request<DashboardStats>("/dashboard/stats"),

  summarizeFile: (fileId: number) =>
    request<{ summary: string; bullet_notes: string; difficult_concept: string }>(`/summarize/${fileId}`, {
      method: "POST",
    }),

  askFile: (fileId: number, question: string) =>
    request<{ answer: string; context_chunks: string[] }>(`/ask/${fileId}`, {
      method: "POST",
      body: JSON.stringify({ question }),
    }),

  generateQuiz: (fileId: number, quizType: string, numberOfQuestions: number) =>
    request<{ quiz: string; quiz_type: string }>(`/quiz/${fileId}`, {
      method: "POST",
      body: JSON.stringify({ quiz_type: quizType, number_of_questions: numberOfQuestions }),
    }),

  resumeAssist: (resumeText: string, requestText: string) =>
    request<{
      ats_score: number;
      summary: string;
      strengths: string;
      gaps: string;
      keywords: string;
      tips: string;
      improved_lines: string;
      full_review: string;
    }>("/resume", {
      method: "POST",
      body: JSON.stringify({ resume_text: resumeText, request: requestText }),
    }),

  resumeUploadAssist: (formData: FormData) =>
    request<{
      filename: string;
      extracted_characters: number;
      ats_score: number;
      summary: string;
      strengths: string;
      gaps: string;
      keywords: string;
      tips: string;
      improved_lines: string;
      full_review: string;
    }>("/resume/upload", {
      method: "POST",
      body: formData,
    }),

  interviewAssist: (role: string, focus: string) =>
    request<{ answer: string }>("/interview", {
      method: "POST",
      body: JSON.stringify({ role, focus }),
    }),

  careerAssist: (track: string, profile: string) =>
    request<{ answer: string }>("/career", {
      method: "POST",
      body: JSON.stringify({ track, profile }),
    }),

  codeDebugAssist: (codeText: string, language: string, requestText: string) =>
    request<{
      summary: string;
      issues: string;
      root_cause: string;
      fix: string;
      optimized_solution: string;
      best_practices: string;
      full_review: string;
    }>("/code-debug", {
      method: "POST",
      body: JSON.stringify({ code_text: codeText, language, request: requestText }),
    }),

  codeDebugUploadAssist: (formData: FormData) =>
    request<{
      filename: string;
      extracted_characters: number;
      summary: string;
      issues: string;
      root_cause: string;
      fix: string;
      optimized_solution: string;
      best_practices: string;
      full_review: string;
    }>("/code-debug/upload", {
      method: "POST",
      body: formData,
    }),
};
