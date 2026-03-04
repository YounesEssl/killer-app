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

export async function GET(request: Request) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ accounts: data });
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
    const supabase = createServerClient();

    // Check uniqueness
    const { data: existing } = await supabase
      .from("accounts")
      .select("id")
      .eq("username_normalized", normalized)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Ce nom existe deja" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("accounts")
      .insert({
        username: username.trim(),
        username_normalized: normalized,
        secret_code: code,
      })
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
