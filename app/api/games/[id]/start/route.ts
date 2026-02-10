import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createKillChain } from "@/lib/game-logic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { adminPassword } = await request.json();
    const supabase = createServerClient();

    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("*")
      .eq("id", id)
      .single();

    if (gameError || !game) {
      return NextResponse.json(
        { error: "Partie introuvable" },
        { status: 404 }
      );
    }

    if (game.admin_password !== adminPassword) {
      return NextResponse.json(
        { error: "Mot de passe admin incorrect" },
        { status: 403 }
      );
    }

    if (game.status !== "lobby") {
      return NextResponse.json(
        { error: "La partie n'est pas en lobby" },
        { status: 400 }
      );
    }

    const { data: players } = await supabase
      .from("players")
      .select("*")
      .eq("game_id", id);

    if (!players || players.length < 4) {
      return NextResponse.json(
        { error: "Il faut au minimum 4 joueurs pour lancer la partie" },
        { status: 400 }
      );
    }

    const chain = createKillChain(players);

    for (const assignment of chain) {
      await supabase
        .from("players")
        .update({
          target_id: assignment.target_id,
          mission_id: assignment.mission_id,
        })
        .eq("id", assignment.id);
    }

    await supabase
      .from("games")
      .update({
        status: "active" as const,
        started_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
