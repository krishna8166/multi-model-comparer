import { Loader2 } from "lucide-react";

interface AIResponseCardProps {
  id: string;
  label: string;
  content: string | null;
  wordCount: number | null;
  isLoading: boolean;
}

const AIResponseCard = ({ id, label, content, wordCount, isLoading }: AIResponseCardProps) => {
  return (
    <div className={`ai-card ai-card-${id} flex flex-col h-full`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`pulse-dot bg-${id}`} />
          <h3 className="font-mono text-xs font-medium tracking-wider uppercase text-muted-foreground">
            {label}
          </h3>
        </div>
        {wordCount !== null && !isLoading && (
          <span className="font-mono text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {wordCount} words
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10">
          <Loader2 className={`w-5 h-5 animate-spin text-${id}`} />
          <p className="text-xs text-muted-foreground font-mono">Generating…</p>
        </div>
      ) : content ? (
        <div className="flex-1 overflow-y-auto">
          <p className="text-sm leading-relaxed text-card-foreground whitespace-pre-wrap">
            {content}
          </p>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center py-10">
          <p className="text-sm text-muted-foreground italic font-serif">Awaiting query…</p>
        </div>
      )}
    </div>
  );
};

export default AIResponseCard;
