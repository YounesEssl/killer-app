import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getMissionById } from "@/lib/missions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    const { data: player, error } = await supabase
      .from("players")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !player) {
      return NextResponse.json(
        { error: "Joueur introuvable" },
        { status: 404 }
      );
    }

    let target = null;
    if (player.target_id) {
      const { data } = await supabase
        .from("players")
        .select("id, name, avatar_emoji")
        .eq("id", player.target_id)
        .single();
      target = data;
    }

    const mission = player.mission_id
      ? getMissionById(player.mission_id)
      : null;

    return NextResponse.json({ player, target, mission });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
