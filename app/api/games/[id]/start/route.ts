import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/server";
import { createKillChain } from "@/lib/game-logic";
import type { Player } from "@/lib/firebase/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { adminPassword } = await request.json();

    const gameDoc = await adminDb.collection("games").doc(id).get();

    if (!gameDoc.exists) {
      return NextResponse.json(
        { error: "Partie introuvable" },
        { status: 404 }
      );
    }

    const game = { id: gameDoc.id, ...gameDoc.data() } as { id: string; admin_password: string; status: string };

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

    const playersSnap = await adminDb
      .collection("players")
      .where("game_id", "==", id)
      .get();

    const players = playersSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Player[];

    if (players.length < 4) {
      return NextResponse.json(
        { error: "Il faut au minimum 4 joueurs pour lancer la partie" },
        { status: 400 }
      );
    }

    const chain = createKillChain(players);

    for (const assignment of chain) {
      await adminDb.collection("players").doc(assignment.id).update({
        target_id: assignment.target_id,
        mission_id: assignment.mission_id,
      });
    }

    await adminDb.collection("games").doc(id).update({
      status: "active" as const,
      started_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
