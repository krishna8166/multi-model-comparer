import ReactMarkdown from "react-markdown";
import { Loader2, BookOpen, Download, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import jsPDF from "jspdf";

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
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    const addText = (text: string, fontSize: number, bold = false) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, maxWidth);
      for (const line of lines) {
        if (y > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += fontSize * 0.5;
      }
      y += 4;
    };

    addText(`AI Compare: ${topic}`, 18, true);
    y += 4;

    responses.forEach((r) => {
      addText(r.label, 14, true);
      addText(r.content, 10);
      y += 2;
    });

    if (analysis) {
      addText("Comparative Analysis", 14, true);
      addText(analysis, 10);
    }

    doc.save(`ai-compare-${topic.slice(0, 30).replace(/\s+/g, "-")}.pdf`);
    toast.success("Exported as PDF");
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
