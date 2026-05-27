export const runtime = 'edge';
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateCompletion, parseJSON } from "@/lib/openrouter";
import { BusinessData, ICP, ContentPillar } from "@/types";

type PillarRow = {
  id: string;
  name: string;
  description: string;
};

type TopicRow = {
  id: string;
  pillar_id: string;
  title: string;
  description: string;
};

async function fetchSavedCustomPillars({
  businessId,
  icpDbId,
}: {
  businessId?: string | null;
  icpDbId?: string | null;
}): Promise<ContentPillar[]> {
  if (!businessId && !icpDbId) return [];

  let pillarQuery = supabase
    .from("pillars")
    .select("id, name, description")
    .eq("custom", true)
    .order("position", { ascending: true, nullsFirst: false })
    .order("pillar_order", { ascending: true, nullsFirst: false });

  if (businessId) {
    pillarQuery = pillarQuery.eq("business_id", businessId);
  } else if (icpDbId) {
    pillarQuery = pillarQuery.eq("icp_id", icpDbId);
  }

  const { data: pillarRows, error: pillarsError } = await pillarQuery;

  if (pillarsError) {
    console.error("Saved custom pillars fetch error in generate-pillars:", pillarsError);
    return [];
  }

  const rows = (pillarRows || []) as PillarRow[];
  const pillarIds = rows.map((pillar) => pillar.id);

  if (pillarIds.length === 0) return [];

  const { data: topicRows, error: topicsError } = await supabase
    .from("pillar_topics")
    .select("id, pillar_id, title, description")
    .in("pillar_id", pillarIds);

  if (topicsError) {
    console.error("Saved custom pillar topics fetch error in generate-pillars:", topicsError);
    return [];
  }

  const topicsByPillar = ((topicRows || []) as TopicRow[]).reduce((map, topic) => {
    const existing = map.get(topic.pillar_id) || [];
    existing.push(topic);
    map.set(topic.pillar_id, existing);
    return map;
  }, new Map<string, TopicRow[]>());

  return rows.map((pillar) => ({
    id: pillar.id,
    name: pillar.name,
    description: pillar.description,
    custom: true,
    saved: true,
    topics: (topicsByPillar.get(pillar.id) || []).map((topic) => ({
      id: topic.id,
      title: topic.title,
      description: topic.description,
    })),
  }));
}

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
Reason for Creating Content: ${businessData.reason || "Not specified"}

Target ICP: ${selectedICP.name} - ${selectedICP.title}
ICP Pain Points: ${selectedICP.painPoints.join(", ")}
ICP Goals: ${selectedICP.goals.join(", ")}`;

    const result = await generateCompletion(systemPrompt, userPrompt, {
      label: "Pillars generation",
    });
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

    // Persist generated pillars and topics to DB for this selected ICP.
    let icpDbId = selectedICP.dbId;
    let businessId: string | undefined;

    if (icpDbId) {
      const { data: icpById, error: icpByIdError } = await supabase
        .from("icps")
        .select("id, business_id")
        .eq("id", icpDbId)
        .maybeSingle();

      if (icpByIdError) {
        console.error("ICP fetch by id error while saving pillars:", icpByIdError);
      }

      icpDbId = icpById?.id;
      businessId = icpById?.business_id;
    }

    if (!icpDbId) {
      const { data: icpRow, error: icpLookupError } = await supabase
        .from("icps")
        .select("id, business_id")
        .eq("name", selectedICP.name)
        .eq("title", selectedICP.title)
        .limit(1)
        .maybeSingle();

      if (icpLookupError) {
        console.error("ICP lookup error while saving pillars:", icpLookupError);
      }
      icpDbId = icpRow?.id;
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
        console.error("Business lookup error while saving pillars:", businessLookupError);
      }
      businessId = businessRow?.id;
    }

    if (icpDbId) {
      const pillarRows = pillarsWithIds.map((pillar, index) => ({
        icp_id: icpDbId,
        business_id: businessId ?? null,
        pillar_order: index + 1,
        position: index + 1,
        name: pillar.name,
        description: pillar.description,
        custom: false,
      }));

      const { data: insertedPillars, error: pillarsError } = await supabase
        .from("pillars")
        .insert(pillarRows)
        .select("id");

      if (pillarsError) {
        console.error("Pillars insert error:", pillarsError);
      } else if (insertedPillars?.length) {
        const topicRows = insertedPillars.flatMap((insertedPillar, index) =>
          pillarsWithIds[index].topics.map((topic) => ({
            pillar_id: insertedPillar.id,
            title: topic.title,
            description: topic.description,
          }))
        );

        if (topicRows.length > 0) {
          const { error: topicsError } = await supabase.from("pillar_topics").insert(topicRows);
          if (topicsError) {
            console.error("Pillar topics insert error:", topicsError);
          }
        }
      }
    } else {
      console.error("Skipping pillar save: selected ICP database id not found.");
    }

    const savedCustomPillars = await fetchSavedCustomPillars({ businessId, icpDbId });

    return NextResponse.json({ pillars: [...pillarsWithIds, ...savedCustomPillars] });
  } catch (error) {
    console.error("Pillar generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content pillars" },
      { status: 500 }
    );
  }
}
