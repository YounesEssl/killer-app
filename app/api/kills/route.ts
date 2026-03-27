import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/server";
import { getMissionById } from "@/lib/missions";
import type { Player, Account } from "@/lib/firebase/types";

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
          error: `Trop de tentatives. Reessaie dans ${rateCheck.retryAfter}s`,
        },
        { status: 429 }
      );
    }

    // Get killer
    const killerDoc = await adminDb.collection("players").doc(playerId).get();
    const killer = killerDoc.exists
      ? ({ id: killerDoc.id, ...killerDoc.data() } as Player)
      : null;

    if (!killer) {
      return NextResponse.json(
        { error: "Joueur introuvable" },
        { status: 404 }
      );
    }

    if (!killer.is_alive) {
      return NextResponse.json(
        { error: "Tu es mort, tu ne peux plus eliminer personne" },
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
    const targetDoc = await adminDb
      .collection("players")
      .doc(killer.target_id)
      .get();
    const target = targetDoc.exists
      ? ({ id: targetDoc.id, ...targetDoc.data() } as Player)
      : null;

    if (!target) {
      return NextResponse.json(
        { error: "Cible introuvable" },
        { status: 404 }
      );
    }

    if (!target.is_alive) {
      return NextResponse.json(
        { error: "Ta cible est deja eliminee" },
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
    const missionDesc = mission?.description || killer.mission_description || "Mission inconnue";

    // Kill the target
    await adminDb.collection("players").doc(target.id).update({
      is_alive: false,
      died_at: new Date().toISOString(),
    });

    // Update killer: new target, new mission, increment kill count
    await adminDb.collection("players").doc(killer.id).update({
      target_id: target.target_id,
      mission_id: target.mission_id,
      mission_description: target.mission_description || null,
      kill_count: killer.kill_count + 1,
    });

    // Count survivors
    const countSnap = await adminDb
      .collection("players")
      .where("game_id", "==", killer.game_id)
      .where("is_alive", "==", true)
      .count()
      .get();
    const survivorsCount = countSnap.data().count;

    // Create kill event
    const killEventRef = adminDb.collection("kill_events").doc();
    await killEventRef.set({
      game_id: killer.game_id,
      killer_id: killer.id,
      victim_id: target.id,
      mission_description: missionDesc,
      survivors_count: survivorsCount,
      killed_at: new Date().toISOString(),
    });

    // Check if game is over
    let isGameOver = false;
    if (survivorsCount <= 1) {
      isGameOver = true;

      // Winner = player with the most kills
      const allPlayersSnap = await adminDb
        .collection("players")
        .where("game_id", "==", killer.game_id)
        .get();
      const sorted = allPlayersSnap.docs
        .map((d) => ({ id: d.id, ...(d.data() as { kill_count: number }) }))
        .sort((a, b) => b.kill_count - a.kill_count);
      const topKiller = sorted.length > 0 ? sorted[0] : null;

      await adminDb
        .collection("games")
        .doc(killer.game_id)
        .update({
          status: "finished" as const,
          winner_id: topKiller?.id ?? killer.id,
          finished_at: new Date().toISOString(),
        });
    }

    // Get new target info with photo
    let newTarget = null;
    if (target.target_id && !isGameOver) {
      const newTargetDoc = await adminDb
        .collection("players")
        .doc(target.target_id)
        .get();
      const newTargetPlayer = newTargetDoc.exists
        ? ({ id: newTargetDoc.id, ...newTargetDoc.data() } as Player)
        : null;

      if (newTargetPlayer) {
        let photoUrl: string | null = null;
        if (newTargetPlayer.account_id) {
          const accDoc = await adminDb
            .collection("accounts")
            .doc(newTargetPlayer.account_id)
            .get();
          const acc = accDoc.exists
            ? ({ id: accDoc.id, ...accDoc.data() } as Account)
            : null;
          photoUrl = acc?.photo_url ?? null;
        }
        newTarget = {
          id: newTargetPlayer.id,
          name: newTargetPlayer.name,
          photo_url: photoUrl,
        };
      }
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
