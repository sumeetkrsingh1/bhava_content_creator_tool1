import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { CreatorStyle } from "@/types";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("creator_styles")
      .select("id, name, handle, avatar, description, style_tags, sample_snippet")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Creator styles fetch error:", error);
      return NextResponse.json({ error: "Failed to load creator styles" }, { status: 500 });
    }

    const styles: CreatorStyle[] = (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      handle: row.handle,
      avatar: row.avatar,
      description: row.description,
      styleTags: Array.isArray(row.style_tags) ? row.style_tags : [],
      sampleSnippet: row.sample_snippet ?? "",
    }));

    return NextResponse.json({ styles });
  } catch (error) {
    console.error("Creator styles API error:", error);
    return NextResponse.json({ error: "Failed to load creator styles" }, { status: 500 });
  }
}
