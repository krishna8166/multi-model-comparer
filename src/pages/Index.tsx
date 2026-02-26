import { useState } from "react";
import { Search, Zap } from "lucide-react";
import AIResponseCard from "@/components/AIResponseCard";
import { supabase } from "@/integrations/supabase/client";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    setHasSearched(true);
    setResponses([]);

    try {
      const { data, error } = await supabase.functions.invoke("compare-ai", {
        body: { topic: topic.trim() },
      });

      if (error) throw error;
      setResponses(data.responses || []);
    } catch (err) {
      console.error("Error fetching AI responses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getResponse = (id: string) => responses.find((r) => r.id === id);

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:py-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border border-border bg-secondary">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="font-mono text-xs text-muted-foreground">AI Research Comparator</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-3">
            Compare AI Responses
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Enter a research topic and see how four leading AI models respond — side by side.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-12">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Quantum computing applications in drug discovery"
                className="w-full h-12 pl-10 pr-4 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="h-12 px-6 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-40 transition-all font-mono"
            >
              {isLoading ? "Comparing…" : "Compare"}
            </button>
          </div>
        </form>

        {/* Response Grid */}
        {hasSearched && (
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
        )}
      </div>
    </div>
  );
};

export default Index;
