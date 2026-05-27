import { NextResponse } from "next/server";
import { generateCompletion, parseJSON } from "@/lib/openrouter";
import { BusinessData, ContentPillar } from "@/types";

export async function POST(req: Request) {
  try {
    const body: {
      pillarName: string;
      businessData?: BusinessData | null;
      businessName?: string;
      industryNiche?: string;
      productService?: string;
    } = await req.json();
    const { pillarName, businessData } = body;
    const businessName = businessData?.businessName ?? body.businessName;
    const industryNiche = businessData?.industryNiche ?? body.industryNiche;
    const productService = businessData?.productService ?? body.productService;
    const reason = businessData?.reason;

    if (!pillarName || !pillarName.trim()) {
      return NextResponse.json({ error: "Pillar name is required" }, { status: 400 });
    }

    const systemPrompt = `You are a LinkedIn content strategist. Given a content pillar name and business context, generate:
- description: A one-sentence description of what this pillar covers (matching the context)
- topics: Exactly 2 sub-topics (each with a title and description) that explain specific content ideas within this pillar

Return ONLY valid JSON - no markdown, no explanation. Return a single object:
{
  "description": "sentence describing the pillar",
  "topics": [
    { "title": "topic title", "description": "what this post covers" },
    { "title": "topic title", "description": "what this post covers" }
  ]
}`;

    const userPrompt = `Pillar Name: ${pillarName.trim()}${businessName ? `\nBusiness: ${businessName}` : ""}${industryNiche ? `\nIndustry: ${industryNiche}` : ""}${productService ? `\nProduct/Service: ${productService}` : ""}${reason ? `\nReason for Creating Content: ${reason}` : ""}

Generate an appropriate description and 2 relevant sub-topics for this pillar.`;

    const result = await generateCompletion(systemPrompt, userPrompt, {
      label: "Single pillar generation",
      temperature: 0.7,
      maxTokens: 800,
    });

    const data = parseJSON<{ description: string; topics: { title: string; description: string }[] }>(result);

    const pillar: ContentPillar = {
      id: `custom-pillar-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: pillarName.trim(),
      description: data.description || `Content about ${pillarName.trim()}`,
      topics: (data.topics || []).map((t, i) => ({
        id: `custom-topic-${Date.now()}-${i + 1}`,
        title: t.title,
        description: t.description,
      })),
      custom: true,
      saved: false,
    };

    return NextResponse.json({ pillar });
  } catch (error) {
    console.error("Single pillar generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate pillar details" },
      { status: 500 }
    );
  }
}
