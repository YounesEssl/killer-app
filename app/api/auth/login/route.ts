import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/server";
import { normalizeUsername } from "@/lib/utils";
import type { Account } from "@/lib/firebase/types";

export async function POST(request: Request) {
  try {
    const { username, code } = await request.json();

    if (!username || !code) {
      return NextResponse.json(
        { error: "Le nom et le code sont requis" },
        { status: 400 }
      );
    }

    const normalized = normalizeUsername(username);

    const snap = await adminDb
      .collection("accounts")
      .where("username_normalized", "==", normalized)
      .limit(1)
      .get();
    const account = snap.empty
      ? null
      : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as Account);

    if (!account) {
      return NextResponse.json(
        { error: "Compte introuvable" },
        { status: 401 }
      );
    }

    if (account.secret_code !== code) {
      return NextResponse.json(
        { error: "Code incorrect" },
        { status: 401 }
      );
    }

    return NextResponse.json({ account });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
