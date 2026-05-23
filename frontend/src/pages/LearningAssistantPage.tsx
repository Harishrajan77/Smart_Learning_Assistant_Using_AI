import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Loader2, Send, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { FormattedContent } from "@/components/FormattedContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { api } from "@/services/api";
import { UploadedFile } from "@/types";

export function LearningAssistantPage() {
  const [recentFiles, setRecentFiles] = useState<UploadedFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(Number(localStorage.getItem("sla-selected-file")) || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [asking, setAsking] = useState(false);
  const [question, setQuestion] = useState("");
  const [summary, setSummary] = useState("");
  const [bulletNotes, setBulletNotes] = useState("");
  const [conceptExplanation, setConceptExplanation] = useState("");
  const [answer, setAnswer] = useState("");

  const selectedFile = recentFiles.find((file) => file.id === selectedFileId) || null;

  const fetchFiles = async () => {
    try {
      const response = await api.getRecentFiles();
      setRecentFiles(response.files);
      if (!selectedFileId && response.files.length) {
        setSelectedFileId(response.files[0].id);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to fetch files.");
    }
  };

  useEffect(() => {
    void fetchFiles();
  }, []);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setUploadProgress(18);
    try {
      const progressTicks = [34, 57, 81, 100];
      progressTicks.forEach((value, index) => {
        setTimeout(() => setUploadProgress(value), 250 * (index + 1));
      });
      const response = await api.uploadPdf(formData);
      toast.success(response.message);
      setSelectedFileId(response.file.id);
      localStorage.setItem("sla-selected-file", String(response.file.id));
      await fetchFiles();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const handleSummarize = async () => {
    if (!selectedFileId) {
      toast.error("Select a file first.");
      return;
    }
    setSummarizing(true);
    try {
      const response = await api.summarizeFile(selectedFileId);
      setSummary(response.summary);
      setBulletNotes(response.bullet_notes);
      setConceptExplanation(response.difficult_concept);
      toast.success("Summary generated successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Summary failed.");
    } finally {
      setSummarizing(false);
    }
  };

  const handleAsk = async () => {
    if (!selectedFileId || !question.trim()) {
      toast.error("Select a file and enter a question.");
      return;
    }
    setAsking(true);
    try {
      const response = await api.askFile(selectedFileId, question);
      setAnswer(response.answer);
      toast.success("Answer generated from your document knowledge base.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Question answering failed.");
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Card className="rounded-[2rem]">
        <CardHeader>
          <CardTitle>Learning Assistant</CardTitle>
          <CardDescription>Upload notes, summarize them, turn them into revision bullets, and ask RAG-powered questions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <motion.div
              {...getRootProps()}
              whileHover={{ y: -4 }}
              className={`cursor-pointer rounded-[1.75rem] border border-dashed p-8 text-center transition ${
                isDragActive ? "border-cyan-400 bg-cyan-400/10" : "border-white/15 bg-white/5 hover:border-cyan-400/30"
              }`}
            >
              <input {...getInputProps()} />
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-400/10 text-cyan-200">
                <UploadCloud className="h-8 w-8" />
              </div>
              <p className="font-display text-2xl font-bold text-white">Drop your PDF here</p>
              <p className="mt-2 text-sm text-slate-400">Drag and drop notes or click to upload a document into your AI study workspace.</p>
            </motion.div>

            {uploading ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
                  <span>Processing upload and building FAISS index</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            ) : null}

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-semibold text-white">Recent Files</p>
                <p className="text-xs text-slate-500">Reusable after restart</p>
              </div>
              <div className="grid gap-3">
                {recentFiles.length ? (
                  recentFiles.map((file) => (
                    <button
                      key={file.id}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        selectedFileId === file.id
                          ? "border-cyan-400/40 bg-cyan-400/10 text-white"
                          : "border-white/10 bg-slate-900/50 text-slate-400 hover:text-white"
                      }`}
                      onClick={() => {
                        setSelectedFileId(file.id);
                        localStorage.setItem("sla-selected-file", String(file.id));
                      }}
                    >
                      <p className="font-medium">{file.filename}</p>
                      <p className="mt-1 text-xs">{new Date(file.upload_time).toLocaleString()}</p>
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-slate-400">
                    Upload your first PDF to activate the RAG workflow.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSummarize} disabled={summarizing || !selectedFile}>
                {summarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Summarize Selected PDF
              </Button>
              <Button variant="secondary" onClick={() => setQuestion("Explain the most important concepts in this document.")}>
                Explain Difficult Concepts
              </Button>
            </div>

            <Card className="rounded-[1.75rem] bg-white/4">
              <CardHeader>
                <CardTitle className="text-base">Ask Doubts from PDF</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row">
                  <Input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a concept, formula, definition, or explanation..." />
                  <Button onClick={handleAsk} disabled={asking}>
                    {asking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Ask
                  </Button>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-sm leading-7 text-slate-300">
                  <FormattedContent text={answer} emptyMessage="Your RAG-based answer will appear here after you ask a question from the selected file." />
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card className="rounded-[1.75rem]">
                <CardHeader>
                  <CardTitle className="text-base">Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormattedContent text={summary} emptyMessage="Generate a concise summary of the selected PDF to start your revision faster." />
                </CardContent>
              </Card>

              <Card className="rounded-[1.75rem]">
                <CardHeader>
                  <CardTitle className="text-base">Bullet Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormattedContent text={bulletNotes} emptyMessage="The assistant will create quick bullet notes that are ideal for exam-time recall." />
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <CardTitle className="text-base">Difficult Concept Explanation</CardTitle>
              </CardHeader>
              <CardContent>
                <FormattedContent text={conceptExplanation} emptyMessage="A simplified explanation of the toughest concept from your PDF will appear here." />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
