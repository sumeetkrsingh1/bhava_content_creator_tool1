import { NextResponse } from "next/server";
import { generateCompletion, parseJSON } from "@/lib/openrouter";
import { BusinessData, ICP, ContentPillar } from "@/types";

export async function POST(req: Request) {
  try {
    const body: { businessData: BusinessData; selectedICP: ICP } = await req.json();
    const { businessData, selectedICP } = body;

    const systemPrompt = `You are a LinkedIn content strategist who creates high-performing content strategies.
Based on the business information and selected Ideal Customer Profile, generate 4-5 content pillars.

Return ONLY valid JSON - no markdown, no explanation. Return a JSON array with 4-5 objects, each containing:
- name: The pillar name (e.g., "Industry Insights & Trends")
- description: A one-sentence description of what this pillar covers
- topics: Array of exactly 2 objects, each with:
  - title: A specific content topic title
  - description: A brief description of what this topic post would cover

The pillars should directly address the ICP's pain points and goals while showcasing the business's expertise.`;

    const userPrompt = `Business: ${businessData.businessName} (${businessData.industryNiche})
Product/Service: ${businessData.productService}
USPs: ${businessData.uniqueSellingPoints}

Target ICP: ${selectedICP.name} - ${selectedICP.title}
ICP Pain Points: ${selectedICP.painPoints.join(", ")}
ICP Goals: ${selectedICP.goals.join(", ")}`;

    const result = await generateCompletion(systemPrompt, userPrompt);
    const pillars = parseJSON<Omit<ContentPillar, "id" | "topics">[]>(result);

    const pillarsWithIds: ContentPillar[] = pillars.map((pillar, i) => ({
      ...pillar,
      id: `pillar-${i + 1}`,
      topics: (pillar as unknown as { topics: { title: string; description: string }[] }).topics.map(
        (t: { title: string; description: string }, j: number) => ({
          ...t,
          id: `topic-${i + 1}-${j + 1}`,
        })
      ),
    }));

    return NextResponse.json({ pillars: pillarsWithIds });
  } catch (error) {
    console.error("Pillar generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content pillars" },
      { status: 500 }
    );
  }
}
