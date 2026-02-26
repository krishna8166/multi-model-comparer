import { useState } from "react";
import { Search, GraduationCap } from "lucide-react";
import AIResponseCard from "@/components/AIResponseCard";
import ComparisonAnalysis from "@/components/ComparisonAnalysis";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIResponse {
  id: string;
  label: string;
  content: string;
  wordCount: number;
}

const AI_PROVIDERS = [
  { id: "openai", label: "OpenAI" },
  { id: "claude", label: "Claude" },
  { id: "gemini", label: "Gemini" },
  { id: "perplexity", label: "Perplexity" },
];

const Index = () => {
  const [topic, setTopic] = useState("");
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    setHasSearched(true);
    setResponses([]);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke("compare-ai", {
        body: { topic: topic.trim() },
      });

      if (error) throw error;
      setResponses(data.responses || []);
    } catch (err) {
      console.error("Error fetching AI responses:", err);
      toast.error("Failed to fetch AI responses. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (responses.length === 0 || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-comparison", {
        body: { topic: topic.trim(), responses },
      });

      if (error) throw error;
      setAnalysis(data.analysis || null);
    } catch (err) {
      console.error("Error generating analysis:", err);
      toast.error("Failed to generate analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getResponse = (id: string) => responses.find((r) => r.id === id);

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:py-14">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <GraduationCap className="w-5 h-5 text-primary" />
            <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
              Research Comparator
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-foreground mb-3">
            Multi-Model Analysis
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Submit a research topic to query four AI models simultaneously. Compare their responses
            and generate a structured comparative analysis.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-12">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Impact of large language models on scientific peer review"
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="h-11 px-5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-40 transition-all"
            >
              {isLoading ? "Querying…" : "Submit"}
            </button>
          </div>
        </form>

        {/* Response Grid */}
        {hasSearched && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {AI_PROVIDERS.map((provider) => {
                const resp = getResponse(provider.id);
                return (
                  <AIResponseCard
                    key={provider.id}
                    id={provider.id}
                    label={provider.label}
                    content={resp?.content || null}
                    wordCount={resp?.wordCount || null}
                    isLoading={isLoading}
                  />
                );
              })}
            </div>

            <ComparisonAnalysis
              analysis={analysis}
              isLoading={isAnalyzing}
              onGenerate={handleAnalyze}
              canGenerate={responses.length > 0 && !isLoading}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
