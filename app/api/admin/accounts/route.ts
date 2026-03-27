import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/server";
import { normalizeUsername, generateSecretCode } from "@/lib/utils";
import type { Account } from "@/lib/firebase/types";

function checkAdmin(request: Request) {
  const secret = request.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return false;
  }
  return true;
}

export async function GET(request: Request) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const snapshot = await adminDb
      .collection("accounts")
      .orderBy("created_at", "desc")
      .get();

    const accounts = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Account
    );

    return NextResponse.json({ accounts });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const { username } = await request.json();

    if (!username?.trim()) {
      return NextResponse.json(
        { error: "Le nom est requis" },
        { status: 400 }
      );
    }

    const normalized = normalizeUsername(username);
    const code = generateSecretCode();

    // Check uniqueness
    const existingSnapshot = await adminDb
      .collection("accounts")
      .where("username_normalized", "==", normalized)
      .get();

    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { error: "Ce nom existe deja" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const ref = adminDb.collection("accounts").doc();
    const accountData = {
      username: username.trim(),
      username_normalized: normalized,
      secret_code: code,
      photo_url: null,
      created_at: now,
      updated_at: now,
    };
    await ref.set(accountData);

    const account: Account = { id: ref.id, ...accountData };

    return NextResponse.json({ account });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
