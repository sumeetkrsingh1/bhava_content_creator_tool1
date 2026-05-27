import { NextResponse } from "next/server";
import { generateCompletion, parseJSON } from "@/lib/openrouter";
import { CreatorStyle } from "@/types";

export async function POST(req: Request) {
  try {
    const body: { linkedinUrl: string; businessContext?: { businessName?: string; industryNiche?: string } } = await req.json();
    const { linkedinUrl, businessContext } = body;

    if (!linkedinUrl || !linkedinUrl.trim()) {
      return NextResponse.json({ error: "LinkedIn URL is required" }, { status: 400 });
    }

    // Extract profile handle/name from URL
    const url = linkedinUrl.trim().replace(/\/$/, "");
    const parts = url.split("/");
    const handle = parts[parts.length - 1] || "unknown";

    const systemPrompt = `You are a LinkedIn style analyst. Given a LinkedIn profile URL (or handle), create a writing style profile for this LinkedIn content creator.

You must infer the creator's likely writing style, content themes, tone, and typical post structure based on the handle/name and any business context provided.

Return ONLY valid JSON - no markdown, no explanation. Return a single object with these fields:
{
  "name": "The creator's full name (best guess from the handle)",
  "description": "A 1-2 sentence description of what this creator typically posts about and their content niche",
  "styleTags": ["3-5 style tags describing their writing approach, e.g. 'storytelling', 'data-driven', 'conversational', 'thought leadership', etc."],
  "sampleSnippet": "A short 2-3 sentence sample post in the creator's likely voice on a relevant LinkedIn topic, matching the business context if provided"
}`;

    const userPrompt = `LinkedIn Profile: ${linkedinUrl.trim()}
Handle: ${handle}${businessContext?.businessName ? `\nBusiness Context: ${businessContext.businessName}` : ""}${businessContext?.industryNiche ? `\nIndustry: ${businessContext.industryNiche}` : ""}

Analyze this profile and generate a creator style profile. Focus on the likely writing style, content approach, and tone.`;

    const result = await generateCompletion(systemPrompt, userPrompt, {
      label: "LinkedIn profile analysis",
      temperature: 0.7,
      maxTokens: 800,
    });

    const data = parseJSON<{
      name: string;
      description: string;
      styleTags: string[];
      sampleSnippet: string;
    }>(result);

    const customStyle: CreatorStyle = {
      id: `custom-style-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: data.name || handle.replace(/[_-]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      handle: `@${handle}`,
      avatar: data.name?.charAt(0)?.toUpperCase() || handle.charAt(0).toUpperCase(),
      description: data.description || `LinkedIn creator style imported from ${linkedinUrl}`,
      styleTags: Array.isArray(data.styleTags) ? data.styleTags.slice(0, 5) : ["thought leadership"],
      sampleSnippet: data.sampleSnippet || "Shares valuable insights and industry perspectives.",
      imported: true,
      saved: false,
    };

    return NextResponse.json({ style: customStyle });
  } catch (error) {
    console.error("LinkedIn profile analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze LinkedIn profile" },
      { status: 500 }
    );
  }
}
