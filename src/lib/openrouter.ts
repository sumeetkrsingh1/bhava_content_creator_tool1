import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export function parseJSON<T>(text: string): T {
  let cleaned = text.trim();
  // Strip markdown code fences
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  return JSON.parse(cleaned);
}

export async function generateCompletion(
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; maxTokens?: number; label?: string }
): Promise<string> {
  console.log("\n" + "=".repeat(80));
  if (options?.label) {
    console.log("[OpenRouter Prompt] step:", options.label);
  }
  console.log("[OpenRouter Prompt] systemPrompt:\n", systemPrompt);
  console.log("[OpenRouter Prompt] userPrompt:\n", userPrompt);
  console.log("=".repeat(80) + "\n");

  const response = await client.chat.completions.create({
    model: process.env.OPENROUTER_MODEL || "openai/gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: options?.temperature ?? 0.8,
    max_tokens: options?.maxTokens ?? 2000,
  });
  return response.choices[0].message.content || "";
}