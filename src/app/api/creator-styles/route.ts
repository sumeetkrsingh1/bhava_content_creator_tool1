export const runtime = 'edge';
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { CreatorStyle } from "@/types";

function mapCreatorStyle(row: {
  id: string;
  user_id?: string | null;
  name: string;
  handle: string;
  avatar: string;
  description: string;
  style_tags: unknown;
  sample_snippet: string | null;
}): CreatorStyle {
  return {
    id: row.id,
    name: row.name,
    handle: row.handle,
    avatar: row.avatar,
    description: row.description,
    styleTags: Array.isArray(row.style_tags) ? row.style_tags : [],
    sampleSnippet: row.sample_snippet ?? "",
    imported: Boolean(row.user_id),
    saved: Boolean(row.user_id),
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mine = searchParams.get("mine") === "true";

    if (mine) {
      const authHeader = req.headers.get("authorization");
      const accessToken = authHeader?.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length)
        : null;

      if (!accessToken) {
        return NextResponse.json({ error: "Authorization token is required" }, { status: 401 });
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
      const authedSupabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        auth: {
          persistSession: false,
        },
      });

      const { data: authData, error: authError } = await authedSupabase.auth.getUser(accessToken);

      if (authError || !authData.user) {
        console.error("Creator styles fetch auth error:", authError);
        return NextResponse.json({ error: "Invalid user session" }, { status: 401 });
      }

      const { data, error } = await authedSupabase
        .from("creator_styles")
        .select("id, user_id, name, handle, avatar, description, style_tags, sample_snippet")
        .eq("user_id", authData.user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Saved creator styles fetch error:", error);
        return NextResponse.json({ error: "Failed to load saved creator styles" }, { status: 500 });
      }

      return NextResponse.json({ styles: (data ?? []).map(mapCreatorStyle) });
    }

    const { data, error } = await supabase
      .from("creator_styles")
      .select("id, user_id, name, handle, avatar, description, style_tags, sample_snippet")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Creator styles fetch error:", error);
      return NextResponse.json({ error: "Failed to load creator styles" }, { status: 500 });
    }

    const styles: CreatorStyle[] = (data ?? []).map(mapCreatorStyle);

    return NextResponse.json({ styles });
  } catch (error) {
    console.error("Creator styles API error:", error);
    return NextResponse.json({ error: "Failed to load creator styles" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: { style: CreatorStyle; userId?: string | null; accessToken?: string | null } = await req.json();
    const { style, accessToken } = body;
    let { userId } = body;

    if (!accessToken) {
      return NextResponse.json({ error: "accessToken is required" }, { status: 401 });
    }

    if (!style?.name?.trim() || !style?.handle?.trim()) {
      return NextResponse.json({ error: "Style name and handle are required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const authedSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        persistSession: false,
      },
    });

    const { data: authData, error: authError } = await authedSupabase.auth.getUser(accessToken);

    if (authError || !authData.user) {
      console.error("Creator style save auth error:", authError);
      return NextResponse.json({ error: "Invalid user session" }, { status: 401 });
    }

    userId = authData.user.id;
    const styleId = crypto.randomUUID();
    const { data, error } = await authedSupabase
      .from("creator_styles")
      .insert({
        id: styleId,
        user_id: userId,
        name: style.name,
        handle: style.handle,
        avatar: style.avatar || style.name.charAt(0).toUpperCase(),
        description: style.description,
        style_tags: style.styleTags,
        sample_snippet: style.sampleSnippet,
      })
      .select("id, user_id, name, handle, avatar, description, style_tags, sample_snippet")
      .single();

    if (error || !data) {
      console.error("Creator style insert error:", error);
      return NextResponse.json({ error: "Failed to save creator style" }, { status: 500 });
    }

    const savedStyle: CreatorStyle = {
      id: data.id,
      name: data.name,
      handle: data.handle,
      avatar: data.avatar,
      description: data.description,
      styleTags: Array.isArray(data.style_tags) ? data.style_tags : [],
      sampleSnippet: data.sample_snippet ?? "",
      imported: true,
      saved: true,
    };

    return NextResponse.json({ style: savedStyle });
  } catch (error) {
    console.error("Creator style save API error:", error);
    return NextResponse.json({ error: "Failed to save creator style" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body: { styleId?: string | null; accessToken?: string | null } = await req.json();
    const { styleId, accessToken } = body;

    if (!styleId) {
      return NextResponse.json({ error: "styleId is required" }, { status: 400 });
    }

    if (!accessToken) {
      return NextResponse.json({ error: "accessToken is required" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const authedSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        persistSession: false,
      },
    });

    const { data: authData, error: authError } = await authedSupabase.auth.getUser(accessToken);

    if (authError || !authData.user) {
      console.error("Creator style delete auth error:", authError);
      return NextResponse.json({ error: "Invalid user session" }, { status: 401 });
    }

    const { error } = await authedSupabase
      .from("creator_styles")
      .delete()
      .eq("id", styleId)
      .eq("user_id", authData.user.id);

    if (error) {
      console.error("Creator style delete error:", error);
      return NextResponse.json({ error: "Failed to delete creator style" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Creator style delete API error:", error);
    return NextResponse.json({ error: "Failed to delete creator style" }, { status: 500 });
  }
}
