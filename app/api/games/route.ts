import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/server";
import { generateJoinCode } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { name, adminPassword } = await request.json();

    if (!name || !adminPassword) {
      return NextResponse.json(
        { error: "Le nom et le mot de passe admin sont requis" },
        { status: 400 }
      );
    }

    let joinCode = generateJoinCode();

    // Ensure unique join code
    let existing = await adminDb
      .collection("games")
      .where("join_code", "==", joinCode)
      .limit(1)
      .get();

    while (!existing.empty) {
      joinCode = generateJoinCode();
      existing = await adminDb
        .collection("games")
        .where("join_code", "==", joinCode)
        .limit(1)
        .get();
    }

    const now = new Date().toISOString();
    const ref = adminDb.collection("games").doc();
    const gameData = {
      name,
      join_code: joinCode,
      admin_password: adminPassword,
      status: "lobby" as const,
      winner_id: null,
      created_at: now,
      started_at: null,
      finished_at: null,
    };
    await ref.set(gameData);

    return NextResponse.json({ id: ref.id, ...gameData });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
