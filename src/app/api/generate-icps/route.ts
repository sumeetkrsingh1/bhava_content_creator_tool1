export const runtime = 'edge';
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { BusinessData, ICP } from "@/types";
import { generateCompletion, parseJSON } from "@/lib/openrouter";

export async function POST(req: Request) {
  try {
    const body: BusinessData = await req.json();

    const { data: businessData, error: businessError } = await supabase
      .from("businesses")
      .insert({
        business_name: body.businessName,
        industry_niche: body.industryNiche,
        target_market: body.targetMarket,
        product_service: body.productService,
        business_goals: body.businessGoals,
        unique_selling_points: body.uniqueSellingPoints,
      })
      .select("id")
      .single();
    if (businessError) {
      console.error("Business insert error:", businessError);
    }
    const businessId = businessData?.id;

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

    const result = await generateCompletion(systemPrompt, userPrompt, {
      label: "ICP generation",
    });
    const icps = parseJSON<Omit<ICP, "id">[]>(result);

    const icpsWithIds: ICP[] = icps.map((icp, i) => ({
      ...icp,
      id: `icp-${i + 1}`,
    }));

    // Persist generated ICPs when business row is created.
    if (businessId) {
      const icpRows = icpsWithIds.map((icp) => ({
        business_id: businessId,
        name: icp.name,
        title: icp.title,
        demographics:
          typeof icp.demographics === "string"
            ? icp.demographics
            : JSON.stringify(icp.demographics),
        pain_points: icp.painPoints,
        goals: icp.goals,
        online_platforms: icp.onlinePlatforms,
      }));

      const { data: insertedIcps, error: icpError } = await supabase
        .from("icps")
        .insert(icpRows)
        .select("id");
      if (icpError) {
        console.error("ICP insert error:", icpError);
      } else if (insertedIcps?.length) {
        insertedIcps.forEach((row, index) => {
          if (icpsWithIds[index]) {
            icpsWithIds[index].dbId = row.id;
          }
        });
      }
    }

    const responseBody = { icps: icpsWithIds, businessId };
    return NextResponse.json(responseBody);
  } catch (error) {
    console.error("ICP generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate ICPs" },
      { status: 500 }
    );
  }
}
