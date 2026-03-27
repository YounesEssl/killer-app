import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const gameDoc = await adminDb.collection("games").doc(id).get();

    if (!gameDoc.exists) {
      return NextResponse.json(
        { error: "Partie introuvable" },
        { status: 404 }
      );
    }

    const game = { id: gameDoc.id, ...gameDoc.data() };

    const playersSnap = await adminDb
      .collection("players")
      .where("game_id", "==", id)
      .get();

    const players = playersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ game, players });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
