export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface UploadedFile {
  id: number;
  filename: string;
  filepath: string;
  file_size: number;
  upload_time: string;
}

export interface ActivityItem {
  module: string;
  question: string;
  created_at: string;
}

export interface DashboardStats {
  total_files_uploaded: number;
  questions_asked: number;
  total_interactions: number;
  last_uploaded_files: UploadedFile[];
  recent_activity: ActivityItem[];
  upload_activity: { label: string; count: number }[];
}
