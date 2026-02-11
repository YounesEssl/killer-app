"use client";

import { motion } from "framer-motion";
import type { Player } from "@/lib/supabase/types";
import { formatDuration } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Skull, Eye, RotateCcw } from "lucide-react";

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
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative bg-white">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, duration: 0.8 }}
        className="text-center relative z-10 space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
          className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mx-auto"
        >
          <Skull className="w-10 h-10 text-rose-500" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl font-black text-rose-500 font-[family-name:var(--font-display)]"
        >
          TU ES MORT
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3"
        >
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 inline-flex flex-col items-center gap-2">
            <p className="text-slate-500 text-sm">Tes stats</p>
            <p className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
              {player.kill_count} kill{player.kill_count > 1 ? "s" : ""}
            </p>
            {survivalTime && (
              <p className="text-sm text-slate-400">
                Survecu pendant {survivalTime}
              </p>
            )}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-slate-400 text-sm flex items-center gap-2 justify-center"
        >
          <Eye className="w-4 h-4" />
          Le jeu continue sans toi...
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-3 pt-4"
        >
          <Link href={`/game/${gameId}/feed`}>
            <Button variant="secondary" fullWidth>
              Voir le feed
            </Button>
          </Link>
          <Link href="/">
            <Button
              variant="secondary"
              fullWidth
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Nouvelle partie
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
