import { useState, useRef, useCallback, useMemo } from "react";
import { Search, Zap } from "lucide-react";
import AIResponseCard from "@/components/AIResponseCard";
import ComparisonAnalysis from "@/components/ComparisonAnalysis";
import SimilarityBadge from "@/components/SimilarityBadge";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { computeSimilarity, findCommonSentences } from "@/lib/similarity";

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

  const scrollRefs = useRef(AI_PROVIDERS.map(() => ({ current: null as HTMLDivElement | null })));

  const handleSyncScroll = useCallback((scrollTop: number, sourceIndex: number) => {
    scrollRefs.current.forEach((ref, i) => {
      if (i !== sourceIndex && ref.current) {
        ref.current.scrollTop = scrollTop;
      }
    });
  }, []);

  const similarities = useMemo(() => {
    if (responses.length < 2) return [];
    const pairs: { labelA: string; labelB: string; percentage: number }[] = [];
    for (let i = 0; i < responses.length; i++) {
      for (let j = i + 1; j < responses.length; j++) {
        pairs.push({
          labelA: responses[i].label,
          labelB: responses[j].label,
          percentage: computeSimilarity(responses[i].content, responses[j].content),
        });
      }
    }
    return pairs;
  }, [responses]);

  const highlightedSentences = useMemo(() => {
    if (responses.length < 2) return new Set<string>();
    return findCommonSentences(responses.map((r) => r.content));
  }, [responses]);

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
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-10 md:py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-4">
            <Zap className="w-3 h-3" />
            AI-powered research comparison
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-3">
            Compare AI Models,{" "}
            <span className="text-primary">Side by Side</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Submit a topic. Get responses from 4 leading AI models. Analyze similarities,
            differences, and generate a comparative report—all in one place.
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
                placeholder="e.g. Impact of AI on healthcare diagnostics"
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-all shadow-sm"
            >
              {isLoading ? "Querying…" : "Compare"}
            </button>
          </div>
        </form>

        {/* Similarity badges */}
        {similarities.length > 0 && !isLoading && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {similarities.map((s, i) => (
              <SimilarityBadge key={i} {...s} />
            ))}
          </div>
        )}

        {/* Response Grid */}
        {hasSearched && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {AI_PROVIDERS.map((provider, idx) => {
                const resp = getResponse(provider.id);
                return (
                  <AIResponseCard
                    key={provider.id}
                    id={provider.id}
                    label={provider.label}
                    content={resp?.content || null}
                    wordCount={resp?.wordCount || null}
                    isLoading={isLoading}
                    highlightedSentences={highlightedSentences}
                    scrollRef={scrollRefs.current[idx]}
                    onScroll={(top) => handleSyncScroll(top, idx)}
                  />
                );
              })}
            </div>

            <ComparisonAnalysis
              analysis={analysis}
              isLoading={isAnalyzing}
              onGenerate={handleAnalyze}
              canGenerate={responses.length > 0 && !isLoading}
              topic={topic}
              responses={responses}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
