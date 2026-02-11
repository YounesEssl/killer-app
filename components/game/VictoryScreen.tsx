"use client";

import { motion } from "framer-motion";
import type { Player, Game } from "@/lib/supabase/types";
import { formatDuration } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Share2, Trophy, Shield, Users, Skull, Clock } from "lucide-react";
import PlayerAvatar from "@/components/ui/PlayerAvatar";

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
  const lastSurvivor = players.find((p) => p.is_alive) || null;
  const totalKills = players.reduce((sum, p) => sum + p.kill_count, 0);
  const gameDuration =
    game.started_at && game.finished_at
      ? formatDuration(game.started_at, game.finished_at)
      : null;

  const handleShare = async () => {
    const text = `KILLER - GAME OVER!\n\n${winner?.name} remporte la partie "${game.name}" avec ${winner?.kill_count} kill(s)!\nDernier survivant : ${lastSurvivor?.name || "—"}\n\n${players.length} joueurs - ${totalKills} eliminations${gameDuration ? ` - ${gameDuration}` : ""}`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative bg-white">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, duration: 0.8 }}
        className="text-center relative z-10 space-y-6 max-w-sm w-full"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
          className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center mx-auto"
        >
          <Trophy className="w-10 h-10 text-brand-600" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl font-black text-gradient-green font-[family-name:var(--font-display)]"
        >
          GAME OVER
        </motion.h1>

        {winner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-3xl border-2 border-brand-200 shadow-brand p-6 space-y-3"
          >
            <div className="mx-auto w-fit">
              <PlayerAvatar avatarId={winner.avatar_emoji} size="lg" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
              {winner.name}
              {isWinner && (
                <span className="block text-sm text-brand-600 mt-1">
                  C&apos;est toi !
                </span>
              )}
            </h2>
            <p className="text-slate-500">
              Meilleur killer avec{" "}
              <span className="text-brand-600 font-bold">
                {winner.kill_count} kill{winner.kill_count > 1 ? "s" : ""}
              </span>
            </p>
          </motion.div>
        )}

        {lastSurvivor && lastSurvivor.id !== winner?.id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3"
          >
            <PlayerAvatar avatarId={lastSurvivor.avatar_emoji} size="md" />
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-900">
                {lastSurvivor.name}
                {lastSurvivor.id === currentPlayerId && (
                  <span className="text-xs text-brand-600 ml-1">(toi)</span>
                )}
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Dernier survivant
              </p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 text-center">
            <Users className="w-4 h-4 text-brand-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
              {players.length}
            </p>
            <p className="text-xs text-slate-400">joueurs</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 text-center">
            <Skull className="w-4 h-4 text-rose-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
              {totalKills}
            </p>
            <p className="text-xs text-slate-400">kills</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 text-center">
            <Clock className="w-4 h-4 text-brand-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
              {gameDuration || "—"}
            </p>
            <p className="text-xs text-slate-400">duree</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, ease: [0.22, 1, 0.36, 1] }}
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
