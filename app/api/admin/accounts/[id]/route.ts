import { NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase/server";
import { normalizeUsername, generateSecretCode } from "@/lib/utils";
import type { Account } from "@/lib/firebase/types";

function checkAdmin(request: Request) {
  const secret = request.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return false;
  }
  return true;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { id } = await params;

  const doc = await adminDb.collection("accounts").doc(id).get();

  if (!doc.exists) {
    return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
  }

  const account = { id: doc.id, ...doc.data() } as Account;
  return NextResponse.json({ account });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { username, regenerateCode } = await request.json();

    const updates: Record<string, string> = {
      updated_at: new Date().toISOString(),
    };

    if (username?.trim()) {
      const normalized = normalizeUsername(username);

      // Check uniqueness (exclude self)
      const existingSnapshot = await adminDb
        .collection("accounts")
        .where("username_normalized", "==", normalized)
        .where("__name__", "!=", id)
        .get();

      if (!existingSnapshot.empty) {
        return NextResponse.json(
          { error: "Ce nom existe deja" },
          { status: 400 }
        );
      }

      updates.username = username.trim();
      updates.username_normalized = normalized;
    }

    if (regenerateCode) {
      updates.secret_code = generateSecretCode();
    }

    const docRef = adminDb.collection("accounts").doc(id);
    await docRef.update(updates);

    const updatedDoc = await docRef.get();
    const account = { id: updatedDoc.id, ...updatedDoc.data() } as Account;

    return NextResponse.json({ account });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { id } = await params;

  // Delete photo from storage
  await adminStorage
    .bucket()
    .file(`avatars/${id}.jpg`)
    .delete({ ignoreNotFound: true });

  // Delete account
  try {
    await adminDb.collection("accounts").doc(id).delete();
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
