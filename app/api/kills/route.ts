import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getMissionById } from "@/lib/missions";

// Simple in-memory rate limiter
const attempts = new Map<
  string,
  { count: number; resetAt: number }
>();

function checkRateLimit(playerId: string): {
  allowed: boolean;
  retryAfter?: number;
} {
  const now = Date.now();
  const record = attempts.get(playerId);

  if (record && now < record.resetAt) {
    if (record.count >= 3) {
      return {
        allowed: false,
        retryAfter: Math.ceil((record.resetAt - now) / 1000),
      };
    }
    record.count++;
    return { allowed: true };
  }

  attempts.set(playerId, { count: 1, resetAt: now + 60000 });
  return { allowed: true };
}

function resetRateLimit(playerId: string) {
  attempts.delete(playerId);
}

export async function POST(request: Request) {
  try {
    const { playerId, code } = await request.json();

    if (!playerId || !code) {
      return NextResponse.json(
        { error: "playerId et code sont requis" },
        { status: 400 }
      );
    }

    // Rate limit check
    const rateCheck = checkRateLimit(playerId);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Trop de tentatives. Réessaie dans ${rateCheck.retryAfter}s`,
        },
        { status: 429 }
      );
    }

    const supabase = createServerClient();

    // Get killer
    const { data: killer, error: killerError } = await supabase
      .from("players")
      .select("*")
      .eq("id", playerId)
      .single();

    if (killerError || !killer) {
      return NextResponse.json(
        { error: "Joueur introuvable" },
        { status: 404 }
      );
    }

    if (!killer.is_alive) {
      return NextResponse.json(
        { error: "Tu es mort, tu ne peux plus éliminer personne" },
        { status: 400 }
      );
    }

    if (!killer.target_id) {
      return NextResponse.json(
        { error: "Tu n'as pas de cible" },
        { status: 400 }
      );
    }

    // Get target
    const { data: target, error: targetError } = await supabase
      .from("players")
      .select("*")
      .eq("id", killer.target_id)
      .single();

    if (targetError || !target) {
      return NextResponse.json(
        { error: "Cible introuvable" },
        { status: 404 }
      );
    }

    if (!target.is_alive) {
      return NextResponse.json(
        { error: "Ta cible est déjà éliminée" },
        { status: 400 }
      );
    }

    // Validate code
    if (code !== target.kill_code) {
      return NextResponse.json(
        { error: "Code incorrect" },
        { status: 400 }
      );
    }

    // Reset rate limit on successful kill
    resetRateLimit(playerId);

    // Get mission description
    const mission = killer.mission_id
      ? getMissionById(killer.mission_id)
      : null;

    // Kill the target
    await supabase
      .from("players")
      .update({
        is_alive: false,
        died_at: new Date().toISOString(),
      })
      .eq("id", target.id);

    // Update killer: new target, new mission, increment kill count
    await supabase
      .from("players")
      .update({
        target_id: target.target_id,
        mission_id: target.mission_id,
        kill_count: killer.kill_count + 1,
      })
      .eq("id", killer.id);

    // Count survivors
    const { count } = await supabase
      .from("players")
      .select("*", { count: "exact", head: true })
      .eq("game_id", killer.game_id)
      .eq("is_alive", true);

    const survivorsCount = count || 0;

    // Create kill event
    await supabase.from("kill_events").insert({
      game_id: killer.game_id,
      killer_id: killer.id,
      victim_id: target.id,
      mission_description: mission?.description || "Mission inconnue",
      survivors_count: survivorsCount,
    });

    // Check if game is over
    let isGameOver = false;
    if (survivorsCount <= 1) {
      isGameOver = true;

      // Winner = player with the most kills
      const { data: topKiller } = await supabase
        .from("players")
        .select("id")
        .eq("game_id", killer.game_id)
        .order("kill_count", { ascending: false })
        .limit(1)
        .single();

      await supabase
        .from("games")
        .update({
          status: "finished" as const,
          winner_id: topKiller?.id ?? killer.id,
          finished_at: new Date().toISOString(),
        })
        .eq("id", killer.game_id);
    }

    // Get new target info
    let newTarget = null;
    if (target.target_id && !isGameOver) {
      const { data } = await supabase
        .from("players")
        .select("id, name, avatar_emoji")
        .eq("id", target.target_id)
        .single();
      newTarget = data;
    }

    const newMission = target.mission_id
      ? getMissionById(target.mission_id)
      : null;

    return NextResponse.json({
      success: true,
      newTarget,
      newMission,
      survivorsCount,
      isGameOver,
      killCount: killer.kill_count + 1,
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
