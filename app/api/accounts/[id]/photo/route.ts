import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

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

    const supabase = createServerClient();

    // Verify account exists
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("id")
      .eq("id", id)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: "Compte introuvable" },
        { status: 404 }
      );
    }

    // Convert base64 to buffer
    const base64Data = photo.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Upload to Supabase Storage
    const filePath = `${id}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: "Erreur lors de l'upload: " + uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const photoUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    // Update account
    const { error: updateError } = await supabase
      .from("accounts")
      .update({ photo_url: photoUrl, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateError) {
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
