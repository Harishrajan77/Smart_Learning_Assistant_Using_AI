import { useMemo, useState } from "react";
import { FileText, Loader2, Sparkles, Target, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { FormattedContent } from "@/components/FormattedContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/services/api";

export function ResumeAssistantPage() {
  const [resumeText, setResumeText] = useState("");
  const [requestText, setRequestText] = useState("Review my resume for AI/DS internships and fresher roles.");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<"file" | "text">("file");
  const [result, setResult] = useState<null | {
    filename?: string;
    ats_score: number;
    summary: string;
    strengths: string;
    gaps: string;
    keywords: string;
    tips: string;
    improved_lines: string;
    full_review: string;
  }>(null);

  const scoreTone = useMemo(() => {
    const score = result?.ats_score ?? 0;
    if (score >= 80) return "text-emerald-300";
    if (score >= 65) return "text-amber-300";
    return "text-rose-300";
  }, [result]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      if (uploadMode === "file") {
        if (!selectedFile) {
          toast.error("Please upload a resume PDF or TXT file first.");
          return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("request", requestText);
        const response = await api.resumeUploadAssist(formData);
        setResult(response);
        toast.success("ATS review generated from uploaded resume.");
      } else {
        if (resumeText.trim().length < 20) {
          toast.error("Please paste enough resume or profile content first.");
          return;
        }

        const response = await api.resumeAssist(resumeText, requestText);
        setResult(response);
        toast.success("Resume guidance generated.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Resume assistant failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="rounded-[2rem]">
        <CardHeader>
          <CardTitle>Resume Assistant</CardTitle>
          <CardDescription>Upload your resume and get an ATS-style score, keyword gaps, stronger wording, and improvement tips.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <button
              className={`rounded-2xl border px-4 py-3 text-sm transition ${
                uploadMode === "file" ? "border-cyan-400/40 bg-cyan-400/10 text-white" : "border-white/10 bg-white/5 text-slate-400"
              }`}
              onClick={() => setUploadMode("file")}
            >
              Upload Resume
            </button>
            <button
              className={`rounded-2xl border px-4 py-3 text-sm transition ${
                uploadMode === "text" ? "border-cyan-400/40 bg-cyan-400/10 text-white" : "border-white/10 bg-white/5 text-slate-400"
              }`}
              onClick={() => setUploadMode("text")}
            >
              Paste Text
            </button>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Request</label>
            <Input value={requestText} onChange={(event) => setRequestText(event.target.value)} />
          </div>

          {uploadMode === "file" ? (
            <label className="block cursor-pointer rounded-[1.75rem] border border-dashed border-white/15 bg-white/5 p-8 text-center transition hover:border-cyan-400/30">
              <input
                type="file"
                accept=".pdf,.txt"
                className="hidden"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-400/10 text-cyan-200">
                <UploadCloud className="h-8 w-8" />
              </div>
              <p className="font-display text-2xl font-bold text-white">Upload Resume File</p>
              <p className="mt-2 text-sm text-slate-400">Supported formats: PDF and TXT. We extract the content and score it for ATS readiness.</p>
              {selectedFile ? (
                <div className="mx-auto mt-5 flex max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-left">
                  <div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-200">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ) : null}
            </label>
          ) : (
            <div>
              <label className="mb-2 block text-sm text-slate-300">Resume / Profile Text</label>
              <Textarea
                value={resumeText}
                onChange={(event) => setResumeText(event.target.value)}
                placeholder="Paste your resume content, academic profile, projects, skills, internships, and achievements..."
                className="min-h-[420px]"
              />
            </div>
          )}

          <Button className="w-full" size="lg" onClick={handleGenerate} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Analyze Resume for ATS
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem]">
        <CardHeader>
          <CardTitle>ATS Result</CardTitle>
          <CardDescription>Structured feedback tailored for AI and Data Science students applying to fresher roles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">ATS Score</p>
                <p className={`mt-2 text-4xl font-bold ${scoreTone}`}>{result?.ats_score ?? "--"}/100</p>
              </div>
              <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-200">
                <Target className="h-5 w-5" />
              </div>
            </div>
            <Progress value={result?.ats_score ?? 0} />
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {result?.summary || "Upload a resume to see a quick ATS-style summary of where your profile stands."}
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5">
              <p className="mb-3 font-semibold text-white">Strengths</p>
              <FormattedContent text={result?.strengths} emptyMessage="Your resume strengths will appear here." />
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5">
              <p className="mb-3 font-semibold text-white">Gaps</p>
              <FormattedContent text={result?.gaps} emptyMessage="Missing or weak areas will appear here." />
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5">
              <p className="mb-3 font-semibold text-white">Missing Keywords</p>
              <FormattedContent text={result?.keywords} emptyMessage="Suggested ATS keywords will appear here." />
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5">
              <p className="mb-3 font-semibold text-white">Tips</p>
              <FormattedContent text={result?.tips} emptyMessage="Actionable ATS and resume writing tips will appear here." />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6">
            <p className="mb-3 font-semibold text-white">Improved Resume Lines</p>
            <FormattedContent text={result?.improved_lines} emptyMessage="Stronger rewritten resume lines will appear here." />
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6">
            <p className="mb-3 font-semibold text-white">Full Review</p>
            <div className="min-h-[160px]">
              <FormattedContent text={result?.full_review} emptyMessage="The full ATS review will appear here after analysis." />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
