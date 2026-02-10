"use client";

import { motion } from "framer-motion";
import type { Player } from "@/lib/supabase/types";
import { formatDuration } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface DeathScreenProps {
  player: Player;
  gameId: string;
  gameStartedAt: string | null;
}

export default function DeathScreen({
  player,
  gameId,
  gameStartedAt,
}: DeathScreenProps) {
  const survivalTime =
    gameStartedAt && player.died_at
      ? formatDuration(gameStartedAt, player.died_at)
      : null;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-danger-600/5 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="text-center relative z-10 space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
          className="text-8xl"
        >
          💀
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-black text-danger-500 font-[family-name:var(--font-display)]"
        >
          TU ES MORT
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <div className="glass rounded-xl p-4 inline-flex flex-col items-center gap-2">
            <p className="text-killer-200/60 text-sm">Tes stats</p>
            <p className="text-2xl font-bold text-foreground font-[family-name:var(--font-display)]">
              {player.kill_count} kill{player.kill_count > 1 ? "s" : ""}
            </p>
            {survivalTime && (
              <p className="text-sm text-killer-200/40">
                Survécu pendant {survivalTime}
              </p>
            )}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-killer-200/40 text-sm"
        >
          Le jeu continue sans toi... 👀
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col gap-3 pt-4"
        >
          <Link href={`/game/${gameId}/feed`}>
            <Button variant="secondary" fullWidth>
              Voir le feed
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
