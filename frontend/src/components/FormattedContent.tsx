import { cn } from "@/lib/utils";

function normalize(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/#{1,6}\s*/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .trim();
}

function splitSections(text: string) {
  const cleaned = normalize(text);
  const lines = cleaned.split("\n").map((line) => line.trim()).filter(Boolean);
  const sections: Array<{ title?: string; body: string[] }> = [];
  let current: { title?: string; body: string[] } = { body: [] };

  for (const line of lines) {
    if (/^[A-Z][A-Z0-9\s/_-]{2,}:$/.test(line) || (/^[A-Z][^:]{2,40}:$/.test(line) && line === line.toUpperCase())) {
      if (current.title || current.body.length) {
        sections.push(current);
      }
      current = { title: line.replace(":", ""), body: [] };
      continue;
    }

    current.body.push(line);
  }

  if (current.title || current.body.length) {
    sections.push(current);
  }

  return sections.length ? sections : [{ body: cleaned.split("\n").filter(Boolean) }];
}

export function FormattedContent({
  text,
  className,
  emptyMessage,
}: {
  text?: string;
  className?: string;
  emptyMessage: string;
}) {
  if (!text?.trim()) {
    return <div className={cn("text-sm leading-7 text-slate-400", className)}>{emptyMessage}</div>;
  }

  const sections = splitSections(text);

  return (
    <div className={cn("space-y-5", className)}>
      {sections.map((section, index) => (
        <div key={`${section.title ?? "section"}-${index}`} className="space-y-3">
          {section.title ? <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200/90">{section.title}</h4> : null}
          <div className="space-y-3">
            {section.body.map((line, lineIndex) => {
              const cleanedLine = line.replace(/^[-*]\s*/, "").replace(/^\d+\.\s*/, "").trim();
              const isBullet = /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line);
              return isBullet ? (
                <div key={lineIndex} className="flex items-start gap-3 rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300" />
                  <p className="text-sm leading-7 text-slate-200">{cleanedLine}</p>
                </div>
              ) : (
                <p key={lineIndex} className="text-sm leading-7 text-slate-200">
                  {cleanedLine}
                </p>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
