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
      const { data: targetPlayer } = await supabase
        .from("players")
        .select("id, name, account_id")
        .eq("id", player.target_id)
        .single();

      if (targetPlayer) {
        let photoUrl: string | null = null;
        if (targetPlayer.account_id) {
          const { data: acc } = await supabase
            .from("accounts")
            .select("photo_url")
            .eq("id", targetPlayer.account_id)
            .single();
          photoUrl = acc?.photo_url ?? null;
        }
        target = {
          id: targetPlayer.id,
          name: targetPlayer.name,
          photo_url: photoUrl,
        };
      }
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
