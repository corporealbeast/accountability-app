import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const WORKSPACE_KEY = "christian-coaching-business";
const TABLE = "coaching_business_state";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select("data")
      .eq("workspace_key", WORKSPACE_KEY)
      .single();

    // PGRST116 = row not found — not an error, just no data yet
    if (error && error.code !== "PGRST116") {
      console.error("[coaching-business-state] GET error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data?.data ?? null });
  } catch (err) {
    console.error("[coaching-business-state] GET exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createServerSupabaseClient();

    const { error } = await supabase.from(TABLE).upsert(
      {
        workspace_key: WORKSPACE_KEY,
        data: body,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "workspace_key" }
    );

    if (error) {
      console.error("[coaching-business-state] POST error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[coaching-business-state] POST exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
