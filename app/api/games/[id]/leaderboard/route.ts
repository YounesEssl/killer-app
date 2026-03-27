import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/server";
import type { Player } from "@/lib/firebase/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const snap = await adminDb
      .collection("players")
      .where("game_id", "==", id)
      .get();

    const players = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as Player)
      .sort((a, b) => {
        if (b.kill_count !== a.kill_count) return b.kill_count - a.kill_count;
        return (b.is_alive ? 1 : 0) - (a.is_alive ? 1 : 0);
      });

    return NextResponse.json(players);
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
