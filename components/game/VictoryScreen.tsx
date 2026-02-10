"use client";

import { motion } from "framer-motion";
import type { Player, Game } from "@/lib/supabase/types";
import { formatDuration } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Share2 } from "lucide-react";

interface VictoryScreenProps {
  game: Game;
  winner: Player | null;
  players: Player[];
  currentPlayerId: string | null;
}

export default function VictoryScreen({
  game,
  winner,
  players,
  currentPlayerId,
}: VictoryScreenProps) {
  const isWinner = winner?.id === currentPlayerId;
  const totalKills = players.reduce((sum, p) => sum + p.kill_count, 0);
  const gameDuration =
    game.started_at && game.finished_at
      ? formatDuration(game.started_at, game.finished_at)
      : null;

  const handleShare = async () => {
    const text = `🔪 KILLER - GAME OVER!\n\n👑 ${winner?.name} remporte la partie "${game.name}" avec ${winner?.kill_count} kill(s)!\n\n📊 ${players.length} joueurs • ${totalKills} éliminations${gameDuration ? ` • ${gameDuration}` : ""}`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-killer-900/20 to-transparent pointer-events-none" />

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="text-center relative z-10 space-y-6 max-w-sm w-full"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
          className="text-8xl"
        >
          👑
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-black text-gradient-green font-[family-name:var(--font-display)]"
        >
          GAME OVER
        </motion.h1>

        {winner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass glow-green rounded-2xl p-6 space-y-3"
          >
            <span className="text-5xl">{winner.avatar_emoji}</span>
            <h2 className="text-2xl font-bold text-foreground font-[family-name:var(--font-display)]">
              {winner.name}
              {isWinner && (
                <span className="block text-sm text-killer-400 mt-1">
                  C&apos;est toi !
                </span>
              )}
            </h2>
            <p className="text-killer-200/60">
              Victoire avec{" "}
              <span className="text-killer-400 font-bold">
                {winner.kill_count} kill{winner.kill_count > 1 ? "s" : ""}
              </span>
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-foreground font-[family-name:var(--font-display)]">
              {players.length}
            </p>
            <p className="text-xs text-killer-200/50">joueurs</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-foreground font-[family-name:var(--font-display)]">
              {totalKills}
            </p>
            <p className="text-xs text-killer-200/50">kills</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-foreground font-[family-name:var(--font-display)]">
              {gameDuration || "—"}
            </p>
            <p className="text-xs text-killer-200/50">durée</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col gap-3 pt-4"
        >
          <Link href={`/game/${game.id}/leaderboard`}>
            <Button variant="primary" fullWidth>
              Voir le classement final
            </Button>
          </Link>
          <Button
            variant="secondary"
            fullWidth
            onClick={handleShare}
            icon={<Share2 className="w-4 h-4" />}
          >
            Partager
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
