import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/server";
import { getMissionById } from "@/lib/missions";
import type { Player, Account } from "@/lib/firebase/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const playerDoc = await adminDb.collection("players").doc(id).get();
    const player = playerDoc.exists
      ? ({ id: playerDoc.id, ...playerDoc.data() } as Player)
      : null;

    if (!player) {
      return NextResponse.json(
        { error: "Joueur introuvable" },
        { status: 404 }
      );
    }

    let target = null;
    if (player.target_id) {
      const targetDoc = await adminDb
        .collection("players")
        .doc(player.target_id)
        .get();
      const targetPlayer = targetDoc.exists
        ? ({ id: targetDoc.id, ...targetDoc.data() } as Player)
        : null;

      if (targetPlayer) {
        let photoUrl: string | null = null;
        if (targetPlayer.account_id) {
          const accDoc = await adminDb
            .collection("accounts")
            .doc(targetPlayer.account_id)
            .get();
          const acc = accDoc.exists
            ? ({ id: accDoc.id, ...accDoc.data() } as Account)
            : null;
          photoUrl = acc?.photo_url ?? null;
        }
        target = {
          id: targetPlayer.id,
          name: targetPlayer.name,
          photo_url: photoUrl,
        };
      }
    }

    const missionFromId = player.mission_id
      ? getMissionById(player.mission_id)
      : null;
    const mission = missionFromId || (player.mission_description ? { id: 0, description: player.mission_description, category: "action", difficulty: "medium" } : null);

    return NextResponse.json({ player, target, mission });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
