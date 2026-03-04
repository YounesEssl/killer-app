import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { normalizeUsername, generateSecretCode } from "@/lib/utils";

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
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
  }

  return NextResponse.json({ account: data });
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
    const supabase = createServerClient();

    const updates: Record<string, string> = {
      updated_at: new Date().toISOString(),
    };

    if (username?.trim()) {
      const normalized = normalizeUsername(username);

      // Check uniqueness (exclude self)
      const { data: existing } = await supabase
        .from("accounts")
        .select("id")
        .eq("username_normalized", normalized)
        .neq("id", id)
        .single();

      if (existing) {
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

    const { data, error } = await supabase
      .from("accounts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ account: data });
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
  const supabase = createServerClient();

  // Delete photo from storage
  await supabase.storage.from("avatars").remove([`${id}.jpg`]);

  // Delete account
  const { error } = await supabase
    .from("accounts")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
