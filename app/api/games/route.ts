import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
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

    const supabase = createServerClient();
    let joinCode = generateJoinCode();

    // Ensure unique join code
    let existing = await supabase
      .from("games")
      .select("id")
      .eq("join_code", joinCode)
      .single();

    while (existing.data) {
      joinCode = generateJoinCode();
      existing = await supabase
        .from("games")
        .select("id")
        .eq("join_code", joinCode)
        .single();
    }

    const { data: game, error } = await supabase
      .from("games")
      .insert({
        name,
        join_code: joinCode,
        admin_password: adminPassword,
        status: "lobby" as const,
        winner_id: null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(game);
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
