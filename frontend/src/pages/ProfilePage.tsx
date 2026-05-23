import { Mail, ShieldCheck, UserCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/types";

export function ProfilePage({ user }: { user: User | null }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Card className="rounded-[2rem]">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>View your current account information and learning workspace identity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <div className="rounded-3xl bg-cyan-400/10 p-4 text-cyan-200">
              <UserCircle2 className="h-10 w-10" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{user?.name ?? "Student"}</p>
              <p className="mt-1 text-[15px] text-slate-300">Smart Learning Assistant account</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <p className="text-[13px] uppercase tracking-[0.18em] text-slate-400">Full Name</p>
              <p className="mt-2 text-lg font-semibold text-white">{user?.name ?? "Student"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <p className="text-[13px] uppercase tracking-[0.18em] text-slate-400">Email Address</p>
              <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                <Mail className="h-4 w-4 text-cyan-200" />
                {user?.email ?? "Not available"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem]">
        <CardHeader>
          <CardTitle>Workspace Status</CardTitle>
          <CardDescription>A simple overview of your current access inside the platform.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-400/10 p-3 text-emerald-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="text-lg font-semibold text-white">Authentication</p>
            </div>
            <p className="text-[15px] leading-7 text-slate-300">You are signed in with backend-protected access and a stored session token.</p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-200">
                <UserCircle2 className="h-5 w-5" />
              </div>
              <p className="text-lg font-semibold text-white">Account Type</p>
            </div>
            <p className="text-[15px] leading-7 text-slate-300">Standard student workspace with access to RAG, quizzes, resume review, debugging, and career guidance.</p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 md:col-span-2">
            <p className="text-[13px] uppercase tracking-[0.18em] text-slate-400">Profile Note</p>
            <p className="mt-3 text-[15px] leading-8 text-slate-200">
              This profile page is intentionally simple for now. It gives you a clean place to view account details, and it can later be extended with editable profile fields, password updates, avatar upload, and personal learning history.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
