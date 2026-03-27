import { NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { photo } = await request.json();

    if (!photo) {
      return NextResponse.json(
        { error: "La photo est requise" },
        { status: 400 }
      );
    }

    // Verify account exists
    const accountDoc = await adminDb.collection("accounts").doc(id).get();

    if (!accountDoc.exists) {
      return NextResponse.json(
        { error: "Compte introuvable" },
        { status: 404 }
      );
    }

    // Convert base64 to buffer
    const base64Data = photo.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Upload to Firebase Storage
    const filePath = `${id}.jpg`;
    try {
      await adminStorage
        .bucket()
        .file(`avatars/${filePath}`)
        .save(buffer, { contentType: "image/jpeg", public: true });
    } catch (uploadErr: unknown) {
      const message =
        uploadErr instanceof Error ? uploadErr.message : "Unknown error";
      return NextResponse.json(
        { error: "Erreur lors de l'upload: " + message },
        { status: 500 }
      );
    }

    // Get public URL
    const photoUrl = `https://storage.googleapis.com/${adminStorage.bucket().name}/avatars/${filePath}?t=${Date.now()}`;

    // Update account
    try {
      await adminDb
        .collection("accounts")
        .doc(id)
        .update({ photo_url: photoUrl, updated_at: new Date().toISOString() });
    } catch {
      return NextResponse.json(
        { error: "Erreur lors de la mise a jour" },
        { status: 500 }
      );
    }

    return NextResponse.json({ photo_url: photoUrl });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
