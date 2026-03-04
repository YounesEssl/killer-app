import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { normalizeUsername } from "@/lib/utils";

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
    const supabase = createServerClient();

    const { data: account, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("username_normalized", normalized)
      .single();

    if (error || !account) {
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
