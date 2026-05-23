import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { CareerGuidancePage } from "@/pages/CareerGuidancePage";
import { CodeDebuggerPage } from "@/pages/CodeDebuggerPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { InterviewPrepPage } from "@/pages/InterviewPrepPage";
import { LearningAssistantPage } from "@/pages/LearningAssistantPage";
import { LoginPage } from "@/pages/LoginPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { QuizGeneratorPage } from "@/pages/QuizGeneratorPage";
import { ResumeAssistantPage } from "@/pages/ResumeAssistantPage";

function ProtectedLayout({ isAuthenticated, user, onLogout }: { isAuthenticated: boolean; user: ReturnType<typeof useAuth>["user"]; onLogout: () => void }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout user={user} onLogout={onLogout} />;
}

export default function App() {
  const auth = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={auth.isAuthenticated ? <Navigate to="/" replace /> : <LoginPage onLogin={auth.login} />}
      />

      <Route
        path="/"
        element={<ProtectedLayout isAuthenticated={auth.isAuthenticated} user={auth.user} onLogout={auth.logout} />}
      >
        <Route index element={<DashboardPage />} />
        <Route path="learning" element={<LearningAssistantPage />} />
        <Route path="code-debugger" element={<CodeDebuggerPage />} />
        <Route path="quiz" element={<QuizGeneratorPage />} />
        <Route path="resume" element={<ResumeAssistantPage />} />
        <Route path="interview" element={<InterviewPrepPage />} />
        <Route path="career" element={<CareerGuidancePage />} />
        <Route path="profile" element={<ProfilePage user={auth.user} />} />
      </Route>

      <Route path="*" element={<Navigate to={auth.isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
}
