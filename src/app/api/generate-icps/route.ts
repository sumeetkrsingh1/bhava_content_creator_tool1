import { NextResponse } from "next/server";
import { generateCompletion, parseJSON } from "@/lib/openrouter";
import { BusinessData, ICP } from "@/types";

export async function POST(req: Request) {
  try {
    const body: BusinessData = await req.json();

    const systemPrompt = `You are an expert marketing strategist specializing in B2B and LinkedIn marketing.
Based on the business information provided, generate exactly 3 distinct Ideal Customer Profiles (ICPs) for LinkedIn content targeting.

Return ONLY valid JSON - no markdown, no explanation. Return a JSON array with 3 objects, each containing:
- name: A descriptive persona name (e.g., "The Growth-Focused CMO")
- title: Their job title (e.g., "VP of Marketing at a mid-size SaaS company")
- demographics: A brief demographic description as a single STRING (e.g., "30-45 years old, MBA educated, 10+ years experience")
- painPoints: Array of 3-4 specific pain points
- goals: Array of 3-4 professional goals
- onlinePlatforms: Array of 3-4 platforms/communities where they spend time

Each ICP should represent a meaningfully different segment of the target market.`;

    const userPrompt = `Business Name: ${body.businessName}
Industry/Niche: ${body.industryNiche}
Target Market: ${body.targetMarket}
Product/Service: ${body.productService}
Business Goals: ${body.businessGoals}
Unique Selling Points: ${body.uniqueSellingPoints}`;

    const result = await generateCompletion(systemPrompt, userPrompt);
    const icps = parseJSON<Omit<ICP, "id">[]>(result);

    const icpsWithIds: ICP[] = icps.map((icp, i) => ({
      ...icp,
      id: `icp-${i + 1}`,
    }));

    return NextResponse.json({ icps: icpsWithIds });
  } catch (error) {
    console.error("ICP generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate ICPs" },
      { status: 500 }
    );
  }
}
