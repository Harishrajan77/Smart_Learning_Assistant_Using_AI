import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Activity, Brain, Bug, Files, History, Rocket, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { FileCard } from "@/components/FileCard";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeDate } from "@/lib/utils";
import { api } from "@/services/api";
import { DashboardStats } from "@/types";
import { useNavigate } from "react-router-dom";

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.getDashboardStats();
        setStats(response);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <div className="grid gap-6">
      <section className="glass-panel rounded-[2rem] p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Badge>Product Dashboard</Badge>
            <h2 className="mt-4 font-display text-4xl font-bold text-white">Your AI-powered academic command center</h2>
            <p className="mt-3 text-slate-400">
              Keep your notes, revision, quiz practice, resume polishing, interview prep, and career planning moving from one premium workspace.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Button size="lg" onClick={() => navigate("/learning")}>
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload & Learn
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate("/quiz")}>
              <Rocket className="mr-2 h-4 w-4" />
              Generate Quiz
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate("/code-debugger")}>
              <Bug className="mr-2 h-4 w-4" />
              Debug Code
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Files Uploaded" value={loading ? "..." : stats?.total_files_uploaded ?? 0} icon={Files} accent="bg-cyan-400/10 text-cyan-200" />
        <StatCard label="Questions Asked" value={loading ? "..." : stats?.questions_asked ?? 0} icon={Brain} accent="bg-violet-400/10 text-violet-200" />
        <StatCard label="AI Interactions" value={loading ? "..." : stats?.total_interactions ?? 0} icon={Activity} accent="bg-emerald-400/10 text-emerald-200" />
        <StatCard label="Recent Uploads" value={loading ? "..." : stats?.last_uploaded_files.length ?? 0} icon={History} accent="bg-amber-400/10 text-amber-200" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="rounded-[2rem]">
          <CardHeader>
            <CardTitle>Upload Momentum</CardTitle>
            <CardDescription>Visual activity of the latest uploaded notes and study files.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.upload_activity ?? []}>
                <defs>
                  <linearGradient id="uploadGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#64748b" />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 16 }} />
                <Area type="monotone" dataKey="count" stroke="#22d3ee" fill="url(#uploadGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem]">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest learner actions captured from the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.recent_activity.length ? (
              stats.recent_activity.map((item, index) => (
                <div key={`${item.created_at}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold capitalize text-white">{item.module.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.question}</p>
                  <p className="mt-2 text-xs text-slate-500">{formatRelativeDate(item.created_at)}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">
                No activity yet. Upload your first PDF to start building your learning history.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[2rem]">
          <CardHeader>
            <CardTitle>Last 3 Uploaded Files</CardTitle>
            <CardDescription>Reopen, summarize again, ask questions again, or generate a quiz instantly.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {stats?.last_uploaded_files.length ? (
              stats.last_uploaded_files.map((file) => <FileCard key={file.id} file={file} />)
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-white/10 p-10 text-center text-slate-400">
                Your latest uploads will appear here after the first document is processed.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem]">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump into the most valuable workflows students use every day.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              { label: "Upload a PDF and build a knowledge base", path: "/learning" },
              { label: "Generate viva questions from recent notes", path: "/quiz" },
              { label: "Debug code and get an optimal solution recommendation", path: "/code-debugger" },
              { label: "Refine an AI/DS resume for ATS", path: "/resume" },
              { label: "Prepare for technical + HR interviews", path: "/interview" },
              { label: "Plan a career roadmap for your target role", path: "/career" },
            ].map((item) => (
              <button
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left text-sm text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white"
                onClick={() => {
                  navigate(item.path);
                  toast.success(`Opened ${item.label}`);
                }}
              >
                {item.label}
              </button>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
