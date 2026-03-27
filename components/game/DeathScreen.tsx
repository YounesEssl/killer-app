"use client";

import { motion } from "framer-motion";
import type { Player } from "@/lib/firebase/types";
import { formatDuration } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Skull, Eye, RotateCcw, Activity, Clock, Target } from "lucide-react";

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
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative bg-[#0a0f0d] overflow-hidden">
      {/* Red radial glow */}
      <div className="absolute inset-0 bg-radial-glow-red pointer-events-none" />
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, duration: 0.8 }}
        className="text-center relative z-10 space-y-6 max-w-sm w-full"
      >
        {/* Skull icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
          className="relative mx-auto w-fit"
        >
          <div className="absolute inset-0 rounded-full bg-red-500 blur-2xl opacity-20 animate-pulse" />
          <div className="relative w-28 h-28 rounded-full border-2 border-red-500/30 bg-[#111916] flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <Skull className="w-14 h-14 text-red-500" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl font-black text-red-500 font-[family-name:var(--font-display)] text-glow-red"
        >
          TU ES MORT
        </motion.h1>

        {/* Ghost message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2 justify-center px-4 py-2 bg-red-500/5 border border-red-500/20 rounded-full mx-auto w-fit"
        >
          <Eye className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-400/80 uppercase tracking-widest font-medium">
            Le jeu continue sans toi...
          </span>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#111916] rounded-2xl border border-white/5 p-6 space-y-6"
        >
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Tes stats
          </p>
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-red-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500 leading-none mb-1">Eliminations</p>
                <p className="text-2xl font-bold text-white font-[family-name:var(--font-display)]">
                  {player.kill_count} <span className="text-sm font-medium text-gray-500">kill{player.kill_count > 1 ? "s" : ""}</span>
                </p>
              </div>
            </div>
            {survivalTime && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-red-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 leading-none mb-1">Survecu pendant</p>
                  <p className="text-lg font-bold text-white">{survivalTime}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-3 pt-4"
        >
          <Link href={`/game/${gameId}/feed`}>
            <Button variant="secondary" fullWidth icon={<Activity className="w-4 h-4" />}>
              Voir le feed
            </Button>
          </Link>
          <Link href="/">
            <Button
              variant="ghost"
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
