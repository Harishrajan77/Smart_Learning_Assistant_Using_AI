import { Bell, Search, UserCircle2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";

export function Topbar({ user }: { user: User | null }) {
  return (
    <div className="glass-panel flex flex-col gap-4 rounded-3xl p-5 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Badge>AI + RAG Workspace</Badge>
          <Badge className="bg-emerald-400/10 text-emerald-200 border-emerald-400/20">Live Learning Stack</Badge>
        </div>
        <h1 className="font-display text-[2rem] font-bold leading-tight text-white">Welcome back, {user?.name ?? "Student"}</h1>
        <p className="text-[15px] leading-7 text-slate-300">Upload, learn, prepare, and plan your next career move from one dashboard.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden w-72 md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input className="pl-10" placeholder="Search modules, files, or prompts..." />
        </div>
        <button className="glass-panel rounded-2xl p-3 text-slate-300 transition hover:text-white">
          <Bell className="h-4 w-4" />
        </button>
        <NavLink to="/profile" className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-2 transition hover:bg-white/10">
          <div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-200">
            <UserCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{user?.email}</p>
            <p className="text-[13px] text-slate-400">Profile & Account</p>
          </div>
        </NavLink>
      </div>
    </div>
  );
}
