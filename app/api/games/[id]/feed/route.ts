import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/server";
import type { KillEvent } from "@/lib/firebase/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const snap = await adminDb
      .collection("kill_events")
      .where("game_id", "==", id)
      .get();

    const events = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as KillEvent)
      .sort((a, b) => b.killed_at.localeCompare(a.killed_at));

    return NextResponse.json(events);
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
