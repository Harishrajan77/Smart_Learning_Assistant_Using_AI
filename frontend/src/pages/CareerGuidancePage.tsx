import { useState } from "react";
import { Loader2, Route } from "lucide-react";
import { toast } from "sonner";
import { FormattedContent } from "@/components/FormattedContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/services/api";

export function CareerGuidancePage() {
  const [track, setTrack] = useState("AI Engineer roadmap");
  const [profile, setProfile] = useState("I am a final-year AI and Data Science student with Python, ML, and web basics. Suggest a roadmap.");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await api.careerAssist(track, profile);
      setAnswer(response.answer);
      toast.success("Career roadmap generated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Career guidance failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="rounded-[2rem]">
        <CardHeader>
          <CardTitle>Career Guidance</CardTitle>
          <CardDescription>Explore roadmaps for Data Analyst, AI Engineer, Web Developer, Freelancing, and higher studies pathways.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Career Track</label>
            <Input value={track} onChange={(event) => setTrack(event.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Student Profile</label>
            <Textarea value={profile} onChange={(event) => setProfile(event.target.value)} className="min-h-[280px]" />
          </div>
          <Button className="w-full" size="lg" onClick={handleGenerate} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Route className="mr-2 h-4 w-4" />}
            Generate Career Roadmap
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem]">
        <CardHeader>
          <CardTitle>Roadmap Output</CardTitle>
          <CardDescription>Turn vague plans into a practical path with projects, skills, and milestones.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[560px] rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6">
            <FormattedContent text={answer} emptyMessage="Your roadmap with phases, skill priorities, project ideas, higher-study options, and job-readiness advice will appear here." />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
