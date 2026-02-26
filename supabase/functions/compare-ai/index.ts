import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_MODELS = [
  { id: "openai", label: "OpenAI", model: "openai/gpt-5-mini" },
  { id: "claude", label: "Claude", model: "google/gemini-2.5-pro" },
  { id: "gemini", label: "Gemini", model: "google/gemini-3-flash-preview" },
  { id: "perplexity", label: "Perplexity", model: "google/gemini-2.5-flash" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic } = await req.json();
    if (!topic) {
      return new Response(JSON.stringify({ error: "Topic is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a knowledgeable research assistant. Provide a comprehensive, well-structured response about the given research topic. Use clear paragraphs and be informative yet concise. Aim for around 200-300 words.`;

    const results = await Promise.allSettled(
      AI_MODELS.map(async (ai) => {
        const response = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: ai.model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Research topic: ${topic}` },
              ],
            }),
          }
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`${ai.label} error [${response.status}]: ${text}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "No response";
        const wordCount = content.split(/\s+/).filter(Boolean).length;

        return { id: ai.id, label: ai.label, content, wordCount };
      })
    );

    const responses = results.map((r, i) => {
      if (r.status === "fulfilled") return r.value;
      console.error(`Error for ${AI_MODELS[i].label}:`, r.reason);
      return {
        id: AI_MODELS[i].id,
        label: AI_MODELS[i].label,
        content: `Error: ${r.reason?.message || "Failed to get response"}`,
        wordCount: 0,
      };
    });

    return new Response(JSON.stringify({ responses }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("compare-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
