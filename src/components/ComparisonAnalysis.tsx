import ReactMarkdown from "react-markdown";
import { Loader2, BookOpen, Download, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ComparisonAnalysisProps {
  analysis: string | null;
  isLoading: boolean;
  onGenerate: () => void;
  canGenerate: boolean;
  topic: string;
  responses: { label: string; content: string }[];
}

const ComparisonAnalysis = ({ analysis, isLoading, onGenerate, canGenerate, topic, responses }: ComparisonAnalysisProps) => {
  const [copied, setCopied] = useState(false);

  if (!canGenerate && !analysis) return null;

  const handleCopy = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    toast.success("Analysis copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    let md = `# AI Compare: ${topic}\n\n`;
    responses.forEach((r) => {
      md += `## ${r.label}\n\n${r.content}\n\n`;
    });
    if (analysis) md += `## Comparative Analysis\n\n${analysis}\n`;

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-compare-${topic.slice(0, 30).replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as Markdown");
  };

  return (
    <div className="mt-8">
      {!analysis && !isLoading && (
        <div className="flex justify-center gap-3">
          <button
            onClick={onGenerate}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-all"
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
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Comparative Analysis</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleExport}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="prose prose-sm max-w-none text-card-foreground dark:prose-invert prose-headings:font-bold prose-headings:text-foreground prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3 prose-ul:my-2 prose-li:my-0.5 prose-p:leading-relaxed">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonAnalysis;
