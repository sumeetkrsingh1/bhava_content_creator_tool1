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
  selectedPillarId: string | null;
  customizationAnswers: CustomizationAnswers | null;
  selectedStyles: CreatorStyle[];
  userId: string;
}

export async function POST(req: Request) {
  try {
    const body: ContentRequest = await req.json();

    const {
      businessData,
      selectedICP,
      pillars,
      selectedPillarId,
      customizationAnswers,
      selectedStyles,
      userId,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    let businessId: string | undefined;

    // Get business ID from ICP
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

    // Fallback business lookup
    if (!businessId) {
      const { data: businessRow, error: businessLookupError } =
        await supabase
          .from("businesses")
          .select("id")
          .eq("business_name", businessData.businessName)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

      if (businessLookupError) {
        console.error(
          "Business style business lookup error:",
          businessLookupError
        );
      }

      businessId = businessRow?.id;
    }

    // Save selected creator styles
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

        const { error: saveStyleError } = await supabase
          .from("business_styles")
          .insert(styleRows);

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
          `- ${s.name}: ${s.description}. Style characteristics: ${s.styleTags.join(
            ", "
          )}`
      )
      .join("\n");

    const toneSection = customizationAnswers
      ? `
Brand Voice & Tone:
- Brand Personality: ${customizationAnswers.brandPersonality}
- Target Emotion: ${customizationAnswers.audienceEmotion}
- Communication Style: ${customizationAnswers.communicationStyle}
- Unique Perspective: ${customizationAnswers.uniquePerspective}${customizationAnswers.targetAgeRange ? `\n- Target Audience Age Range: ${customizationAnswers.targetAgeRange}` : ""}`
      : "Use a professional yet approachable tone.";

    // Use the selectedPillarId to pick the single chosen pillar
    const selectedPillar = selectedPillarId
      ? pillars.find((p) => p.id === selectedPillarId) || null
      : pillars && pillars.length > 0
        ? pillars[0]
        : null;
    const pillarSection = selectedPillar
      ? `Pillar: ${selectedPillar.name}
  Description: ${selectedPillar.description}
  Topics:
${selectedPillar.topics.map((t) => `    - ${t.title}: ${t.description}`).join("\n")}`
      : "No pillar selected — generate general content about the business.";

    const systemPrompt = `You are a world-class LinkedIn content writer. Generate exactly 3 LinkedIn post variations.

Writing Style Guide (blend these styles):
${styleGuide}

${toneSection}

Rules:
- Each post should be 150-250 words
- Use line breaks for readability (LinkedIn-style formatting)
- Start with a compelling hook
- End with a clear call-to-action
- Do NOT use hashtags
- Make the content specific and valuable

Return ONLY valid JSON array with:
- hook
- body
- cta`;

    const userPrompt = `Business: ${businessData.businessName} (${businessData.industryNiche})

Product/Service:
${businessData.productService}

USPs:
${businessData.uniqueSellingPoints}

Reason for Creating Content:
${businessData.reason || "Not specified"}

Target Audience:
${selectedICP.name} - ${selectedICP.title}

Pain Points:
${selectedICP.painPoints.join(", ")}

Goals:
${selectedICP.goals.join(", ")}

Content Pillar:
${pillarSection}`;

    const result = await generateCompletion(systemPrompt, userPrompt, {
      temperature: 0.9,
      maxTokens: 3000,
      label: "Content generation",
    });

    const content = parseJSON<Omit<GeneratedContent, "id">[]>(result);

    const contentWithIds: GeneratedContent[] = content.map((c, i) => ({
      ...c,
      id: `content-${i + 1}`,
    }));

    // Save generated contents
    if (businessId) {
      const creatorStyleId =
        selectedStyles.length === 1 ? selectedStyles[0].id : null;

      // Determine the next generation_group for this business
      const { data: maxGroupData, error: maxGroupError } = await supabase
        .from("generated_contents")
        .select("generation_group")
        .eq("business_id", businessId)
        .order("generation_group", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (maxGroupError) {
        console.error("Max generation_group query error:", maxGroupError);
      }

      const nextGroup = (maxGroupData?.generation_group ?? 0) + 1;

      const contentRows = contentWithIds.map((item, index) => ({
        business_id: businessId,
        version: index + 1,
        hook: item.hook,
        body: item.body,
        cta: item.cta,
        creator_style_id: creatorStyleId,
        generation_group: nextGroup,
      }));

      const { error: contentSaveError } = await supabase
        .from("generated_contents")
        .insert(contentRows);

      if (contentSaveError) {
        console.error(
          "Generated contents insert error:",
          contentSaveError
        );
      }
    } else {
      console.error(
        "Skipping generated_contents save: business id not found."
      );
    }

    // Generation session — reuse existing session for this business, or create one.
    // This ensures one session per business, with multiple generations tracked by generation_group.
    if (userId && businessId) {
      // Check if a session already exists for this user + business
      // Use limit(1) instead of maybeSingle() because existing duplicate sessions
      // would cause maybeSingle() to error, making us insert yet another duplicate.
      const { data: existingSessions } = await supabase
        .from("generation_sessions")
        .select("id")
        .eq("user_id", userId)
        .eq("business_id", businessId)
        .limit(1);

      if (!existingSessions || existingSessions.length === 0) {
        const { error: sessionError } = await supabase
          .from("generation_sessions")
          .insert({
            user_id: userId,
            business_id: businessId,
            title: businessData.businessName,
          })
          .select();

        if (sessionError) {
          console.error(
            "Generation session insert error:",
            sessionError
          );

          throw new Error("Failed to record generation session");
        }
      }
    } else {
      console.error(
        "Cannot create generation session: missing user or business ID"
      );
    }

    return NextResponse.json({
      content: contentWithIds,
    });

  } catch (error) {
    console.error("Content generation error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate content",
      },
      {
        status: 500,
      }
    );
  }
}
