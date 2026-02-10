import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { generateKillCode } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { joinCode, playerName, avatarEmoji } = await request.json();

    if (!joinCode || !playerName) {
      return NextResponse.json(
        { error: "Le code et le prénom sont requis" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("*")
      .eq("join_code", joinCode.toUpperCase())
      .single();

    if (gameError || !game) {
      return NextResponse.json(
        { error: "Partie introuvable. Vérifie le code." },
        { status: 404 }
      );
    }

    if (game.status !== "lobby") {
      return NextResponse.json(
        { error: "Cette partie a déjà commencé" },
        { status: 400 }
      );
    }

    // Check name uniqueness
    const { data: existingPlayer } = await supabase
      .from("players")
      .select("id")
      .eq("game_id", game.id)
      .eq("name", playerName.trim())
      .single();

    if (existingPlayer) {
      return NextResponse.json(
        { error: "Ce prénom est déjà pris dans cette partie" },
        { status: 400 }
      );
    }

    // Generate unique kill code
    const { data: existingCodes } = await supabase
      .from("players")
      .select("kill_code")
      .eq("game_id", game.id);

    const usedCodes = (existingCodes || []).map((p) => p.kill_code);
    const killCode = generateKillCode(usedCodes);

    const { data: player, error: playerError } = await supabase
      .from("players")
      .insert({
        game_id: game.id,
        name: playerName.trim(),
        avatar_emoji: avatarEmoji || "🎭",
        kill_code: killCode,
        target_id: null,
        mission_id: null,
        is_alive: true,
        kill_count: 0,
      })
      .select()
      .single();

    if (playerError) {
      return NextResponse.json(
        { error: playerError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ player, game });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
