import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateCompletion, parseJSON } from "@/lib/openrouter";
import {
  BusinessData,
  ICP,
  ContentPillar,
  CustomizationAnswers,
  CreatorStyle,
  GeneratedContent,
} from "@/types";

interface ContentRequest {
  businessData: BusinessData;
  selectedICP: ICP;
  pillars: ContentPillar[];
  customizationAnswers: CustomizationAnswers | null;
  selectedStyles: CreatorStyle[];
}

export async function POST(req: Request) {
  try {
    const body: ContentRequest = await req.json();
    const { businessData, selectedICP, pillars, customizationAnswers, selectedStyles } = body;

    let businessId: string | undefined;

    if (selectedICP.dbId) {
      const { data: icpRow, error: icpLookupError } = await supabase
        .from("icps")
        .select("business_id")
        .eq("id", selectedICP.dbId)
        .maybeSingle();
      if (icpLookupError) {
        console.error("Business style ICP lookup error:", icpLookupError);
      }
      businessId = icpRow?.business_id;
    }

    if (!businessId) {
      const { data: businessRow, error: businessLookupError } = await supabase
        .from("businesses")
        .select("id")
        .eq("business_name", businessData.businessName)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (businessLookupError) {
        console.error("Business style business lookup error:", businessLookupError);
      }
      businessId = businessRow?.id;
    }

    if (businessId) {
      const { error: deleteStyleError } = await supabase
        .from("business_styles")
        .delete()
        .eq("business_id", businessId);
      if (deleteStyleError) {
        console.error("Business styles clear error:", deleteStyleError);
      }

      if (selectedStyles.length > 0) {
        const styleRows = selectedStyles.map((style) => ({
          business_id: businessId,
          style_id: style.id,
        }));

        const { error: saveStyleError } = await supabase.from("business_styles").insert(styleRows);
        if (saveStyleError) {
          console.error("Business styles insert error:", saveStyleError);
        }
      }
    } else {
      console.error("Skipping business_styles save: business id not found.");
    }

    const styleGuide = selectedStyles
      .map(
        (s) =>
          `- ${s.name}: ${s.description}. Style characteristics: ${s.styleTags.join(", ")}`
      )
      .join("\n");

    const toneSection = customizationAnswers
      ? `
Brand Voice & Tone:
- Brand Personality: ${customizationAnswers.brandPersonality}
- Target Emotion: ${customizationAnswers.audienceEmotion}
- Communication Style: ${customizationAnswers.communicationStyle}
- Unique Perspective: ${customizationAnswers.uniquePerspective}`
      : "Use a professional yet approachable tone.";

    const pillarTopics = pillars
      .flatMap((p) => p.topics.map((t) => `${p.name}: ${t.title}`))
      .join("\n- ");

    const systemPrompt = `You are a world-class LinkedIn content writer. Generate exactly 3 LinkedIn post variations.

Writing Style Guide (blend these styles):
${styleGuide}

${toneSection}

Rules:
- Each post should be 150-250 words
- Use line breaks for readability (LinkedIn-style formatting)
- Start with a compelling hook (first 1-2 lines that grab attention)
- End with a clear call-to-action
- Do NOT use hashtags
- Make the content specific and valuable, not generic

Return ONLY valid JSON - no markdown, no explanation. Return a JSON array with 3 objects, each containing:
- hook: The opening 1-2 lines (the scroll-stopping hook)
- body: The main content (multiple paragraphs with line breaks)
- cta: The closing call-to-action (1-2 lines)

Each variation should take a different angle or topic from the content pillars.`;

    const userPrompt = `Business: ${businessData.businessName} (${businessData.industryNiche})
Product/Service: ${businessData.productService}
USPs: ${businessData.uniqueSellingPoints}

Target Audience: ${selectedICP.name} - ${selectedICP.title}
Their Pain Points: ${selectedICP.painPoints.join(", ")}
Their Goals: ${selectedICP.goals.join(", ")}

Content Pillar Topics to draw from:
- ${pillarTopics}

Generate 3 LinkedIn posts, each covering a different topic from the pillars above.`;

    const result = await generateCompletion(systemPrompt, userPrompt, {
      temperature: 0.9,
      maxTokens: 3000,
    });

    const content = parseJSON<Omit<GeneratedContent, "id">[]>(result);

    const contentWithIds: GeneratedContent[] = content.map((c, i) => ({
      ...c,
      id: `content-${i + 1}`,
    }));

    if (businessId) {
      const creatorStyleId = selectedStyles.length === 1 ? selectedStyles[0].id : null;
      const contentRows = contentWithIds.map((item, index) => ({
        business_id: businessId,
        version: index + 1,
        hook: item.hook,
        body: item.body,
        cta: item.cta,
        creator_style_id: creatorStyleId,
      }));

      const { error: contentSaveError } = await supabase
        .from("generated_contents")
        .insert(contentRows);

      if (contentSaveError) {
        console.error("Generated contents insert error:", contentSaveError);
      }
    } else {
      console.error("Skipping generated_contents save: business id not found.");
    }

    return NextResponse.json({ content: contentWithIds });
  } catch (error) {
    console.error("Content generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
