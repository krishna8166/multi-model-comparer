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
      <div className="flex items-center gap-2 mb-4">
        <div className={`pulse-dot bg-${id}`} />
        <h3 className="font-mono text-sm font-semibold tracking-wide uppercase text-foreground">
          {label}
        </h3>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12">
          <Loader2 className={`w-6 h-6 animate-spin text-${id}`} />
          <p className="text-xs text-muted-foreground font-mono">Generating response…</p>
        </div>
      ) : content ? (
        <>
          <div className="flex-1 overflow-y-auto mb-4">
            <p className="text-sm leading-relaxed text-secondary-foreground whitespace-pre-wrap">
              {content}
            </p>
          </div>
          <div className="pt-3 border-t border-border">
            <span className="font-mono text-xs text-muted-foreground">
              {wordCount} words
            </span>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">Waiting for prompt…</p>
        </div>
      )}
    </div>
  );
};

export default AIResponseCard;
