import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { User } from "@/types";

export function Layout({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <div className="page-shell flex min-h-screen">
      <Sidebar user={user} onLogout={handleLogout} />
      <main className="relative z-10 flex-1 px-3 py-4 md:px-4 md:py-5 xl:px-5">
        <div className="mr-auto flex w-full max-w-[1380px] flex-col gap-5">
          <Topbar user={user} />
          <Outlet />
          <footer className="px-2 pb-2 text-center text-xs text-slate-500">
            Smart Learning Assistant • Final Year Project • RAG + Gemini + FastAPI + React
          </footer>
        </div>
      </main>
    </div>
  );
}
