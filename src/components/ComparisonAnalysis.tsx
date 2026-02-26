import ReactMarkdown from "react-markdown";
import { Loader2, BookOpen } from "lucide-react";

interface ComparisonAnalysisProps {
  analysis: string | null;
  isLoading: boolean;
  onGenerate: () => void;
  canGenerate: boolean;
}

const ComparisonAnalysis = ({ analysis, isLoading, onGenerate, canGenerate }: ComparisonAnalysisProps) => {
  if (!canGenerate && !analysis) return null;

  return (
    <div className="mt-8">
      {!analysis && !isLoading && (
        <div className="flex justify-center">
          <button
            onClick={onGenerate}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-40 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            Generate Comparison Analysis
          </button>
        </div>
      )}

      {isLoading && (
        <div className="analysis-panel flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-mono">Analyzing responses…</p>
        </div>
      )}

      {analysis && !isLoading && (
        <div className="analysis-panel">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border">
            <BookOpen className="w-4 h-4 text-primary" />
            <h2 className="text-xl font-serif font-semibold text-foreground">Comparative Analysis</h2>
          </div>
          <div className="prose prose-sm max-w-none text-card-foreground prose-headings:font-serif prose-headings:text-foreground prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3 prose-ul:my-2 prose-li:my-0.5 prose-p:leading-relaxed">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonAnalysis;
