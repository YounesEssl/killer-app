import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    const { data: game, error } = await supabase
      .from("games")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !game) {
      return NextResponse.json(
        { error: "Partie introuvable" },
        { status: 404 }
      );
    }

    const { data: players } = await supabase
      .from("players")
      .select("*")
      .eq("game_id", id)
      .order("joined_at", { ascending: true });

    return NextResponse.json({ game, players: players || [] });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
