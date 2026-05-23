import { useMemo, useState } from "react";
import { Bug, Code2, FileCode2, Loader2, UploadCloud, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { FormattedContent } from "@/components/FormattedContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/services/api";

type DebugResult = {
  filename?: string;
  summary: string;
  issues: string;
  root_cause: string;
  fix: string;
  optimized_solution: string;
  best_practices: string;
  full_review: string;
};

const languageOptions = [
  "Auto-detect",
  "Python",
  "JavaScript",
  "TypeScript",
  "Java",
  "C++",
  "C",
  "C#",
  "Go",
  "PHP",
  "SQL",
  "HTML/CSS",
];

export function CodeDebuggerPage() {
  const [inputMode, setInputMode] = useState<"file" | "text">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [codeText, setCodeText] = useState("");
  const [language, setLanguage] = useState("Auto-detect");
  const [requestText, setRequestText] = useState("Debug this code and recommend an optimal solution if needed.");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DebugResult | null>(null);

  const inputLabel = useMemo(() => {
    if (inputMode === "file") {
      return selectedFile ? selectedFile.name : "Upload a code file to analyze bugs and improvements.";
    }
    return "Paste code directly and ask for debugging help or an optimized approach.";
  }, [inputMode, selectedFile]);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      if (inputMode === "file") {
        if (!selectedFile) {
          toast.error("Upload a code file first.");
          return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("language", language);
        formData.append("request", requestText);
        const response = await api.codeDebugUploadAssist(formData);
        setResult(response);
        toast.success("Code analysis completed from uploaded file.");
      } else {
        if (codeText.trim().length < 10) {
          toast.error("Paste enough code for analysis.");
          return;
        }

        const response = await api.codeDebugAssist(codeText, language, requestText);
        setResult(response);
        toast.success("Code debugging analysis generated.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Code debugging failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="rounded-[2rem]">
        <CardHeader>
          <CardTitle>Code Debugger</CardTitle>
          <CardDescription>Upload a source file or paste code to find bugs, understand the root cause, and get a cleaner solution.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <button
              className={`rounded-2xl border px-4 py-3 text-sm transition ${
                inputMode === "file" ? "border-cyan-400/40 bg-cyan-400/10 text-white" : "border-white/10 bg-white/5 text-slate-400"
              }`}
              onClick={() => setInputMode("file")}
            >
              Upload File
            </button>
            <button
              className={`rounded-2xl border px-4 py-3 text-sm transition ${
                inputMode === "text" ? "border-cyan-400/40 bg-cyan-400/10 text-white" : "border-white/10 bg-white/5 text-slate-400"
              }`}
              onClick={() => setInputMode("text")}
            >
              Paste Code
            </button>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Language / Stack</label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {languageOptions.map((item) => (
                <button
                  key={item}
                  className={`rounded-2xl border px-3 py-3 text-xs transition ${
                    language === item ? "border-cyan-400/40 bg-cyan-400/10 text-white" : "border-white/10 bg-white/5 text-slate-400"
                  }`}
                  onClick={() => setLanguage(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Request</label>
            <Input value={requestText} onChange={(event) => setRequestText(event.target.value)} />
          </div>

          {inputMode === "file" ? (
            <label className="block cursor-pointer rounded-[1.75rem] border border-dashed border-white/15 bg-white/5 p-8 text-center transition hover:border-cyan-400/30">
              <input
                type="file"
                accept=".py,.js,.ts,.tsx,.jsx,.java,.cpp,.c,.cs,.php,.go,.rb,.swift,.kt,.sql,.html,.css,.json,.txt,.md"
                className="hidden"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-400/10 text-cyan-200">
                <UploadCloud className="h-8 w-8" />
              </div>
              <p className="font-display text-2xl font-bold text-white">Upload Source Code</p>
              <p className="mt-2 text-sm text-slate-400">{inputLabel}</p>
              {selectedFile ? (
                <div className="mx-auto mt-5 flex max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-left">
                  <div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-200">
                    <FileCode2 className="h-4 w-4" />
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
              <label className="mb-2 block text-sm text-slate-300">Paste Code</label>
              <Textarea
                value={codeText}
                onChange={(event) => setCodeText(event.target.value)}
                placeholder="Paste your code here and ask for debugging, bug explanation, or a more optimal implementation..."
                className="min-h-[420px] font-mono text-xs"
              />
            </div>
          )}

          <Button className="w-full" size="lg" onClick={handleAnalyze} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WandSparkles className="mr-2 h-4 w-4" />}
            Debug Code
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem]">
        <CardHeader>
          <CardTitle>Debug Report</CardTitle>
          <CardDescription>Get a product-style diagnosis with bug findings, likely root cause, fixes, and an optimized solution path.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Analysis Summary</p>
                <p className="mt-2 text-lg font-semibold text-white">{result?.filename || language}</p>
              </div>
              <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-200">
                <Bug className="h-5 w-5" />
              </div>
            </div>
            <FormattedContent text={result?.summary} emptyMessage="Upload a code file or paste code to receive a detailed debugging diagnosis." />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5">
              <p className="mb-3 font-semibold text-white">Issues Found</p>
              <FormattedContent text={result?.issues} emptyMessage="Detected issues and code smells will appear here." />
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5">
              <p className="mb-3 font-semibold text-white">Root Cause</p>
              <FormattedContent text={result?.root_cause} emptyMessage="The likely reason behind the bug will appear here." />
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5">
              <p className="mb-3 font-semibold text-white">Fix Guidance</p>
              <FormattedContent text={result?.fix} emptyMessage="Step-by-step fix guidance will appear here." />
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5">
              <p className="mb-3 font-semibold text-white">Best Practices</p>
              <FormattedContent text={result?.best_practices} emptyMessage="Preventive recommendations and quality tips will appear here." />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6">
            <div className="mb-3 flex items-center gap-2">
              <Code2 className="h-4 w-4 text-cyan-200" />
              <p className="font-semibold text-white">Optimized Solution</p>
            </div>
            <div className="text-sm leading-7 text-slate-300 whitespace-pre-wrap">
              <FormattedContent text={result?.optimized_solution} emptyMessage="A cleaner or more optimal solution will appear here when improvement is recommended." />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6">
            <p className="mb-3 font-semibold text-white">Full Review</p>
            <div className="min-h-[160px]">
              <FormattedContent text={result?.full_review} emptyMessage="The complete debugging report will appear here after analysis." />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
