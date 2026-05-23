import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LockKeyhole, Mail, Sparkles, UserRound, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { AuthSession } from "@/types";

export function LoginPage({ onLogin }: { onLogin: (session: AuthSession) => void }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (nextMode: "login" | "register") => {
    setMode(nextMode);
    setName("");
    setEmail(nextMode === "login" ? "admin@student.com" : "");
    setPassword(nextMode === "login" ? "admin123" : "");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = mode === "login" ? await api.login(email, password) : await api.register(name, email, password);
      onLogin({ user: response.user, token: response.token });
      toast.success(mode === "login" ? "Welcome back to Smart Learning Assistant." : "Account created successfully.");
      if (mode === "register") {
        toast.success(`Signed in as ${response.user.name}`);
      }
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4 py-10">
      <div className="relative z-10 grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} className="glass-panel rounded-[2rem] p-8 md:p-12">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-200">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-white">Smart Learning Assistant</p>
              <p className="text-sm text-slate-400">Premium study companion powered by RAG and Gemini.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="font-display text-5xl font-bold leading-tight text-white">
                Learn faster, revise smarter, and prepare for your career with one AI platform.
              </p>
              <p className="mt-4 max-w-xl text-slate-400">
                Upload PDFs, ask concept doubts, generate quizzes, optimize your resume, and build a roadmap for AI/DS success.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                "RAG-based doubt solving from uploaded notes",
                "Quiz generation for revision and viva prep",
                "Resume, interview, and roadmap guidance",
                "Modern SaaS dashboard built for final-year showcase",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="rounded-[2rem]">
            <CardContent className="p-8 md:p-10">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="font-display text-3xl font-bold text-white">{mode === "login" ? "Secure Login" : "Create Account"}</p>
                  <p className="mt-2 text-sm text-slate-400">Use real backend authentication with saved user accounts.</p>
                </div>
                <div className="rounded-2xl bg-emerald-400/10 p-3 text-emerald-200">
                  <Zap className="h-5 w-5" />
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className={`rounded-2xl border px-4 py-3 text-sm transition ${mode === "login" ? "border-cyan-400/40 bg-cyan-400/10 text-white" : "border-white/10 bg-white/5 text-slate-400"}`}
                    onClick={() => switchMode("login")}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    className={`rounded-2xl border px-4 py-3 text-sm transition ${mode === "register" ? "border-cyan-400/40 bg-cyan-400/10 text-white" : "border-white/10 bg-white/5 text-slate-400"}`}
                    onClick={() => switchMode("register")}
                  >
                    Register
                  </button>
                </div>

                {mode === "register" ? (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Full Name</label>
                    <div className="relative">
                      <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input className="pl-10" value={name} onChange={(event) => setName(event.target.value)} />
                    </div>
                  </div>
                ) : null}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input className="pl-10" value={email} onChange={(event) => setEmail(event.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input className="pl-10" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                  </div>
                </div>

                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">
                  {mode === "login" ? (
                    <>
                      Seeded account: <span className="font-semibold">admin@student.com</span> / <span className="font-semibold">admin123</span>
                    </>
                  ) : (
                    <>Register using a new email address so a separate account is created.</>
                  )}
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? "Please wait..." : mode === "login" ? "Enter Dashboard" : "Create Account"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
