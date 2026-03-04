import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { generateKillCode } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { joinCode, accountId } = await request.json();

    if (!joinCode) {
      return NextResponse.json(
        { error: "Le code de la partie est requis" },
        { status: 400 }
      );
    }

    if (!accountId) {
      return NextResponse.json(
        { error: "Tu dois etre connecte pour rejoindre une partie" },
        { status: 401 }
      );
    }

    const supabase = createServerClient();

    // Get account
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", accountId)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: "Compte introuvable" },
        { status: 401 }
      );
    }

    if (!account.photo_url) {
      return NextResponse.json(
        { error: "Tu dois ajouter une photo de profil avant de jouer" },
        { status: 400 }
      );
    }

    const playerName = account.username;

    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("*")
      .eq("join_code", joinCode.toUpperCase())
      .single();

    if (gameError || !game) {
      return NextResponse.json(
        { error: "Partie introuvable. Verifie le code." },
        { status: 404 }
      );
    }

    if (game.status !== "lobby") {
      return NextResponse.json(
        { error: "Cette partie a deja commence" },
        { status: 400 }
      );
    }

    // Check account uniqueness in this game
    const { data: existingPlayer } = await supabase
      .from("players")
      .select("id")
      .eq("game_id", game.id)
      .eq("account_id", accountId)
      .single();

    if (existingPlayer) {
      return NextResponse.json(
        { error: "Tu es deja dans cette partie" },
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
        account_id: accountId,
        name: playerName,
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
