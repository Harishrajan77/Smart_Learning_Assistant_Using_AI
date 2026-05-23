import { useNavigate } from "react-router-dom";
import { BrainCircuit, Eye, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatBytes, formatRelativeDate } from "@/lib/utils";
import { UploadedFile } from "@/types";

export function FileCard({ file }: { file: UploadedFile }) {
  const navigate = useNavigate();

  const openFor = (path: string) => {
    localStorage.setItem("sla-selected-file", String(file.id));
    navigate(path);
  };

  return (
    <Card className="transition hover:-translate-y-1 hover:bg-white/10">
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="line-clamp-1 font-semibold text-white">{file.filename}</p>
            <p className="mt-1 text-xs text-slate-500">{formatBytes(file.file_size)} • {formatRelativeDate(file.upload_time)}</p>
          </div>
          <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-200">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="secondary" onClick={() => openFor("/learning")}>
            <Eye className="mr-2 h-4 w-4" />
            Reopen
          </Button>
          <Button size="sm" variant="secondary" onClick={() => openFor("/learning")}>
            <BrainCircuit className="mr-2 h-4 w-4" />
            Summarize
          </Button>
          <Button size="sm" variant="secondary" onClick={() => openFor("/learning")}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Ask Again
          </Button>
          <Button size="sm" variant="outline" onClick={() => openFor("/quiz")}>
            Generate Quiz
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
