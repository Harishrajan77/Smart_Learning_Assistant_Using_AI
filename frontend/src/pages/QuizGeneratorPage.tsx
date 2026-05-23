import { useEffect, useState } from "react";
import { Loader2, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { FormattedContent } from "@/components/FormattedContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { UploadedFile } from "@/types";

const quizTypes = ["MCQs", "Viva questions", "Important questions", "Short answer questions"];

export function QuizGeneratorPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(Number(localStorage.getItem("sla-selected-file")) || null);
  const [quizType, setQuizType] = useState("MCQs");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.getRecentFiles();
        setFiles(response.files);
        if (!selectedFileId && response.files.length) {
          setSelectedFileId(response.files[0].id);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load recent files.");
      }
    };
    void load();
  }, []);

  const handleGenerate = async () => {
    if (!selectedFileId) {
      toast.error("Please select a PDF first.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.generateQuiz(selectedFileId, quizType, numberOfQuestions);
      setQuiz(response.quiz);
      toast.success(`${response.quiz_type} generated successfully.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Quiz generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="rounded-[2rem]">
        <CardHeader>
          <CardTitle>Quiz Generator</CardTitle>
          <CardDescription>Create MCQs, viva questions, important questions, or short-answer practice from uploaded PDFs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Select PDF</label>
            <div className="grid gap-3">
              {files.map((file) => (
                <button
                  key={file.id}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    selectedFileId === file.id
                      ? "border-cyan-400/40 bg-cyan-400/10 text-white"
                      : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                  }`}
                  onClick={() => {
                    setSelectedFileId(file.id);
                    localStorage.setItem("sla-selected-file", String(file.id));
                  }}
                >
                  <p className="font-medium">{file.filename}</p>
                  <p className="mt-1 text-xs">{new Date(file.upload_time).toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Quiz Type</label>
            <div className="grid grid-cols-2 gap-3">
              {quizTypes.map((item) => (
                <button
                  key={item}
                  className={`rounded-2xl border px-4 py-3 text-sm transition ${
                    quizType === item
                      ? "border-cyan-400/40 bg-cyan-400/10 text-white"
                      : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                  }`}
                  onClick={() => setQuizType(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Number of Questions</label>
            <Input type="number" min={3} max={15} value={numberOfQuestions} onChange={(event) => setNumberOfQuestions(Number(event.target.value))} />
          </div>

          <Button className="w-full" size="lg" onClick={handleGenerate} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WandSparkles className="mr-2 h-4 w-4" />}
            Generate Quiz
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem]">
        <CardHeader>
          <CardTitle>Generated Output</CardTitle>
          <CardDescription>Use this for rapid revision, viva practice, or exam-oriented preparation.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[620px] rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6">
            <FormattedContent text={quiz} emptyMessage="Your AI-generated quiz will appear here after selecting a file and quiz type." />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
