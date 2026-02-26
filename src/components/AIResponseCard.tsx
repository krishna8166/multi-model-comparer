import { Loader2, Copy, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface AIResponseCardProps {
  id: string;
  label: string;
  content: string | null;
  wordCount: number | null;
  isLoading: boolean;
  highlightedSentences?: Set<string>;
  scrollRef?: React.RefObject<HTMLDivElement>;
  onScroll?: (scrollTop: number) => void;
}

const AIResponseCard = ({
  id,
  label,
  content,
  wordCount,
  isLoading,
  highlightedSentences,
  scrollRef,
  onScroll,
}: AIResponseCardProps) => {
  const [copied, setCopied] = useState(false);
  const internalRef = useRef<HTMLDivElement>(null);
  const ref = scrollRef || internalRef;

  useEffect(() => {
    const el = ref.current;
    if (!el || !onScroll) return;
    const handler = () => onScroll(el.scrollTop);
    el.addEventListener("scroll", handler);
    return () => el.removeEventListener("scroll", handler);
  }, [ref, onScroll]);

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success(`${label} response copied`);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = () => {
    if (!content || !highlightedSentences || highlightedSentences.size === 0) {
      return content;
    }

    const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
    return sentences.map((sentence, i) => {
      const trimmed = sentence.trim().toLowerCase();
      const isHighlighted = Array.from(highlightedSentences).some(
        (hs) => trimmed.includes(hs.toLowerCase()) || hs.toLowerCase().includes(trimmed)
      );
      return (
        <span key={i} className={isHighlighted ? "highlight-similar" : ""}>
          {sentence}
        </span>
      );
    });
  };

  return (
    <div className={`ai-card ai-card-${id} flex flex-col h-full`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: `hsl(var(--${id}))` }}
          />
          <h3 className="font-mono text-xs font-medium tracking-wider uppercase text-muted-foreground">
            {label}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {wordCount !== null && !isLoading && (
            <span className="font-mono text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
              {wordCount}w
            </span>
          )}
          {content && !isLoading && (
            <button
              onClick={handleCopy}
              className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
              aria-label="Copy response"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: `hsl(var(--${id}))` }} />
          <p className="text-xs text-muted-foreground font-mono">Generating…</p>
        </div>
      ) : content ? (
        <div ref={ref as any} className="flex-1 overflow-y-auto max-h-80 pr-1 custom-scrollbar">
          <p className="text-sm leading-relaxed text-card-foreground whitespace-pre-wrap">
            {renderContent()}
          </p>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground italic">Awaiting query…</p>
        </div>
      )}
    </div>
  );
};

export default AIResponseCard;
