import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { BusinessData, ICP, CustomizationAnswers } from "@/types";

interface SaveCustomizationRequest {
  businessData: BusinessData | null;
  selectedICP: ICP | null;
  answers: CustomizationAnswers;
}

export async function POST(req: Request) {
  try {
    const body: SaveCustomizationRequest = await req.json();
    const { businessData, selectedICP, answers } = body;

    let businessId: string | undefined;

    if (selectedICP?.dbId) {
      const { data: icpRow, error: icpError } = await supabase
        .from("icps")
        .select("business_id")
        .eq("id", selectedICP.dbId)
        .maybeSingle();

      if (icpError) {
        console.error("Customization save ICP lookup error:", icpError);
      }
      businessId = icpRow?.business_id;
    }

    if (!businessId && businessData?.businessName) {
      const { data: businessRow, error: businessError } = await supabase
        .from("businesses")
        .select("id")
        .eq("business_name", businessData.businessName)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (businessError) {
        console.error("Customization save business lookup error:", businessError);
      }
      businessId = businessRow?.id;
    }

    const { error: saveError } = await supabase.from("customisation_answers").insert({
      business_id: businessId ?? null,
      brand_personality: answers.brandPersonality,
      audience_emotion: answers.audienceEmotion,
      communication_style: answers.communicationStyle,
      unique_perspective: answers.uniquePerspective,
      target_age_range: answers.targetAgeRange || null,
    });

    if (saveError) {
      console.error("Customization save insert error:", saveError);
      return NextResponse.json({ error: "Failed to save customization answers" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save customization API error:", error);
    return NextResponse.json({ error: "Failed to save customization answers" }, { status: 500 });
  }
}
