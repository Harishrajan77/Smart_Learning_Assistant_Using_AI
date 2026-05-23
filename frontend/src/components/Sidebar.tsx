import { BarChart3, BrainCircuit, Briefcase, Bug, FileQuestion, LayoutDashboard, LogOut, Sparkles, UserCircle2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User } from "@/types";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/learning", label: "Learning Assistant", icon: BrainCircuit },
  { to: "/code-debugger", label: "Code Debugger", icon: Bug },
  { to: "/quiz", label: "Quiz Generator", icon: FileQuestion },
  { to: "/resume", label: "Resume Assistant", icon: Sparkles },
  { to: "/interview", label: "Interview Prep", icon: Briefcase },
  { to: "/career", label: "Career Guidance", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: UserCircle2 },
];

export function Sidebar({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  return (
    <aside className="glass-panel hidden w-[280px] shrink-0 flex-col rounded-r-3xl border-l-0 border-t-0 border-b-0 px-5 py-6 lg:flex">
      <div className="mb-6">
        <p className="font-display text-[2rem] font-bold leading-none text-white">Smart Learning</p>
        <p className="mt-3 text-[15px] leading-7 text-slate-300">Generative AI workspace for ambitious students.</p>
      </div>

      <nav className="flex flex-col gap-2.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-[15px] font-medium transition hover:bg-white/10 hover:text-white",
                isActive ? "bg-cyan-400/10 text-cyan-200" : "text-slate-300",
              )
            }
          >
            <item.icon className="h-[17px] w-[17px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
          <p className="text-[13px] uppercase tracking-[0.18em] text-cyan-200/80">Signed In</p>
          <p className="mt-2 text-base font-semibold text-white">{user?.name ?? "Student"}</p>
          <p className="mt-1 text-sm text-slate-400">{user?.email}</p>
        </div>
        <div className="grid gap-2">
          <NavLink
            to="/profile"
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            <UserCircle2 className="h-4 w-4" />
            Profile
          </NavLink>
          <Button variant="secondary" className="justify-center py-3 text-[15px]" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
