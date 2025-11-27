import { NextResponse } from "next/server";

import { getSupabaseUserContext } from "@/lib/supabase/context";

export async function GET() {
  const { client: supabase, userId } = await getSupabaseUserContext();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("id, title, updated_at, category")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load sessions" }, { status: 500 });
  }

  return NextResponse.json({ sessions: sessions ?? [] });
}
