import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/server";
import { generateKillCode } from "@/lib/utils";
import type { Account, Game } from "@/lib/firebase/types";

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

    // Get account
    const accountDoc = await adminDb.collection("accounts").doc(accountId).get();

    if (!accountDoc.exists) {
      return NextResponse.json(
        { error: "Compte introuvable" },
        { status: 401 }
      );
    }

    const account = { id: accountDoc.id, ...accountDoc.data() } as Account;

    if (!account.photo_url) {
      return NextResponse.json(
        { error: "Tu dois ajouter une photo de profil avant de jouer" },
        { status: 400 }
      );
    }

    const playerName = account.username;

    const gameSnap = await adminDb
      .collection("games")
      .where("join_code", "==", joinCode.toUpperCase())
      .limit(1)
      .get();

    if (gameSnap.empty) {
      return NextResponse.json(
        { error: "Partie introuvable. Verifie le code." },
        { status: 404 }
      );
    }

    const game = { id: gameSnap.docs[0].id, ...gameSnap.docs[0].data() } as Game;

    if (game.status !== "lobby") {
      return NextResponse.json(
        { error: "Cette partie a deja commence" },
        { status: 400 }
      );
    }

    // Check account uniqueness in this game
    const existingPlayerSnap = await adminDb
      .collection("players")
      .where("game_id", "==", game.id)
      .where("account_id", "==", accountId)
      .limit(1)
      .get();

    if (!existingPlayerSnap.empty) {
      return NextResponse.json(
        { error: "Tu es deja dans cette partie" },
        { status: 400 }
      );
    }

    // Generate unique kill code
    const existingCodesSnap = await adminDb
      .collection("players")
      .where("game_id", "==", game.id)
      .get();

    const usedCodes = existingCodesSnap.docs.map(
      (d) => d.data().kill_code as string
    );
    const killCode = generateKillCode(usedCodes);

    const now = new Date().toISOString();
    const ref = adminDb.collection("players").doc();
    const playerData = {
      game_id: game.id,
      account_id: accountId,
      name: playerName,
      kill_code: killCode,
      target_id: null,
      mission_id: null,
      is_alive: true,
      kill_count: 0,
      joined_at: now,
      died_at: null,
    };
    await ref.set(playerData);

    const player = { id: ref.id, ...playerData };

    return NextResponse.json({ player, game });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
