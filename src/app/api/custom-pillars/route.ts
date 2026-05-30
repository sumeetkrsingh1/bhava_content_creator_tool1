export const runtime = 'edge';
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { BusinessData, ContentPillar, ICP } from "@/types";

type PillarRow = {
  id: string;
  name: string;
  description: string;
  position: number | null;
  pillar_order: number | null;
};

type TopicRow = {
  id: string;
  pillar_id: string;
  title: string;
  description: string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  // Custom pillars should be scoped to the current user.
  // If userId is missing, return empty set rather than leaking other users' data.
  if (!userId) {
    return NextResponse.json({ pillars: [] });
  }

  // Only filter by user_id and custom=true — no businessId/icpId required.
  // This fetches ALL custom pillars for this user regardless of which business/ICP they belong to.
  let pillarQuery = supabase
    .from("pillars")
    .select("id, name, description, position, pillar_order")
    .eq("custom", true)
    .eq("user_id", userId)
    .order("position", { ascending: true, nullsFirst: false })
    .order("pillar_order", { ascending: true, nullsFirst: false });
  const { data: pillarRows, error: pillarsError } = await pillarQuery;

  if (pillarsError) {
    console.error("Custom pillars fetch error:", pillarsError);
    return NextResponse.json({ error: "Failed to fetch custom pillars" }, { status: 500 });
  }

  const rows = (pillarRows || []) as PillarRow[];
  const pillarIds = rows.map((pillar) => pillar.id);

  if (pillarIds.length === 0) {
    return NextResponse.json({ pillars: [] });
  }

  const { data: topicRows, error: topicsError } = await supabase
    .from("pillar_topics")
    .select("id, pillar_id, title, description")
    .in("pillar_id", pillarIds);

  if (topicsError) {
    console.error("Custom pillar topics fetch error:", topicsError);
    return NextResponse.json({ error: "Failed to fetch custom pillar topics" }, { status: 500 });
  }

  const topicsByPillar = ((topicRows || []) as TopicRow[]).reduce((map, topic) => {
    const existing = map.get(topic.pillar_id) || [];
    existing.push(topic);
    map.set(topic.pillar_id, existing);
    return map;
  }, new Map<string, TopicRow[]>());
  const pillars: ContentPillar[] = rows.map((pillar) => ({
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

  return NextResponse.json({ pillars });
}

export async function POST(req: Request) {
  try {
    const body: {
      pillar: ContentPillar;
      businessId?: string | null;
      businessData?: BusinessData | null;
      selectedICP?: ICP | null;
      userId?: string | null;
    } = await req.json();
    const { pillar, businessData, selectedICP, userId } = body;
    let businessId = body.businessId ?? null;

    if (!userId) {
      return NextResponse.json({ error: "Authentication required to save custom pillars" }, { status: 401 });
    }

    if (!pillar?.name?.trim()) {
      return NextResponse.json({ error: "Pillar is required" }, { status: 400 });
    }

    let icpDbId = selectedICP?.dbId;

    if (icpDbId) {
      const { data: icpById, error: icpByIdError } = await supabase
        .from("icps")
        .select("id, business_id")
        .eq("id", icpDbId)
        .maybeSingle();

      if (icpByIdError) {
        console.error("ICP fetch by id error while saving custom pillar:", icpByIdError);
      }

      icpDbId = icpById?.id;
      businessId = businessId ?? icpById?.business_id ?? null;
    }

    if (!icpDbId && selectedICP) {
      let icpQuery = supabase
        .from("icps")
        .select("id, business_id")
        .eq("name", selectedICP.name)
        .eq("title", selectedICP.title)
        .limit(1);

      if (businessId) {
        icpQuery = icpQuery.eq("business_id", businessId);
      }

      const { data: icpRow, error: icpLookupError } = await icpQuery.maybeSingle();

      if (icpLookupError) {
        console.error("ICP lookup error while saving custom pillar:", icpLookupError);
      }

      icpDbId = icpRow?.id;
      businessId = businessId ?? icpRow?.business_id ?? null;
    }

    if (!businessId && businessData?.businessName) {
      const { data: businessRow, error: businessLookupError } = await supabase
        .from("businesses")
        .select("id")
        .eq("business_name", businessData.businessName)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (businessLookupError) {
        console.error("Business lookup error while saving custom pillar:", businessLookupError);
      }

      businessId = businessRow?.id ?? null;
    }

    if (!icpDbId) {
      return NextResponse.json({ error: "Selected ICP database id not found" }, { status: 400 });
    }

    const { data: lastPillar, error: orderError } = await supabase
      .from("pillars")
      .select("position, pillar_order")
      .eq("icp_id", icpDbId)
      .order("position", { ascending: false, nullsFirst: false })
      .order("pillar_order", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    if (orderError) {
      console.error("Pillar order lookup error while saving custom pillar:", orderError);
    }

    const nextPosition = Math.max(lastPillar?.position ?? 0, lastPillar?.pillar_order ?? 0) + 1;
    const { data: insertedPillar, error: pillarInsertError } = await supabase
      .from("pillars")
      .insert({
        icp_id: icpDbId,
        business_id: businessId,
        pillar_order: nextPosition,
        position: nextPosition,
        name: pillar.name,
        description: pillar.description,
        custom: true,
        user_id: userId,
      })
      .select("id")
      .single();

    if (pillarInsertError || !insertedPillar?.id) {
      console.error("Custom pillar insert error:", pillarInsertError);
      return NextResponse.json({ error: "Failed to save custom pillar" }, { status: 500 });
    }

    const topicRows = (pillar.topics || []).map((topic) => ({
      pillar_id: insertedPillar.id,
      title: topic.title,
      description: topic.description,
    }));

    const { data: insertedTopics, error: topicInsertError } = await supabase
      .from("pillar_topics")
      .insert(topicRows)
      .select("id, title, description");

    if (topicInsertError) {
      console.error("Custom pillar topics insert error:", topicInsertError);
      return NextResponse.json({ error: "Failed to save custom pillar topics" }, { status: 500 });
    }

    const savedPillar: ContentPillar = {
      ...pillar,
      id: insertedPillar.id,
      custom: true,
      saved: true,
      topics: insertedTopics?.length
        ? insertedTopics.map((topic) => ({
            id: topic.id,
            title: topic.title,
            description: topic.description,
          }))
        : pillar.topics,
    };

    return NextResponse.json({ pillar: savedPillar });
  } catch (error) {
    console.error("Save custom pillar error:", error);
    return NextResponse.json({ error: "Failed to save custom pillar" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body: { pillarId?: string | null; userId?: string | null } = await req.json();
    const { pillarId, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (!pillarId) {
      return NextResponse.json({ error: "pillarId is required" }, { status: 400 });
    }

    // Only allow deleting if the user owns this pillar
    const { error } = await supabase
      .from("pillars")
      .update({ custom: false })
      .eq("id", pillarId)
      .eq("user_id", userId);

    if (error) {
      console.error("Custom pillar update error:", error);
      return NextResponse.json({ error: "Failed to update custom pillar" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Custom pillar update API error:", error);
    return NextResponse.json({ error: "Failed to update custom pillar" }, { status: 500 });
  }
}
