import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    const { data: players } = await supabase
      .from("players")
      .select("*")
      .eq("game_id", id)
      .order("kill_count", { ascending: false })
      .order("is_alive", { ascending: false });

    return NextResponse.json(players || []);
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
