import { useState } from "react";
import { Loader2, MessageSquareCode } from "lucide-react";
import { toast } from "sonner";
import { FormattedContent } from "@/components/FormattedContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";

export function InterviewPrepPage() {
  const [role, setRole] = useState("AI Engineer");
  const [focus, setFocus] = useState("HR questions, technical interview questions, mock interview, fresher guidance, communication tips");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await api.interviewAssist(role, focus);
      setAnswer(response.answer);
      toast.success("Interview preparation plan generated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Interview module failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="rounded-[2rem]">
        <CardHeader>
          <CardTitle>Interview Preparation</CardTitle>
          <CardDescription>Practice HR, technical, and mock interview questions with focused guidance for freshers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Target Role</label>
            <Input value={role} onChange={(event) => setRole(event.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Focus Area</label>
            <Input value={focus} onChange={(event) => setFocus(event.target.value)} />
          </div>
          <Button className="w-full" size="lg" onClick={handleGenerate} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquareCode className="mr-2 h-4 w-4" />}
            Generate Interview Prep
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem]">
        <CardHeader>
          <CardTitle>Preparation Output</CardTitle>
          <CardDescription>Use this to structure your practice sessions and build confidence before interviews.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[520px] rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6">
            <FormattedContent text={answer} emptyMessage="Your HR questions, technical questions, mock prompts, fresher advice, and communication tips will appear here." />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
