"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Player, Game } from "@/lib/supabase/types";
import { formatDuration } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Share2, Trophy, Shield, Users, Skull, Clock, RotateCcw, Crown, Medal } from "lucide-react";
import ProfilePhoto from "@/components/ui/ProfilePhoto";
import { supabase } from "@/lib/supabase/client";

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

  const [photoMap, setPhotoMap] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const accountIds = players.filter((p) => p.account_id).map((p) => p.account_id!);
    if (accountIds.length === 0) return;

    supabase
      .from("accounts")
      .select("id, photo_url")
      .in("id", accountIds)
      .then(({ data }) => {
        if (data) {
          setPhotoMap(Object.fromEntries(data.map((a) => [a.id, a.photo_url])));
        }
      });
  }, [players]);

  const getPhotoUrl = (player: Player | null) => {
    if (!player?.account_id) return null;
    return photoMap[player.account_id] ?? null;
  };

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
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative bg-[#0a0f0d] overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-radial-glow pointer-events-none" />

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, duration: 0.8 }}
        className="text-center relative z-10 space-y-6 max-w-sm w-full"
      >
        {/* Trophy */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
          className="relative mx-auto w-fit"
        >
          <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full animate-pulse" />
          <div className="relative w-28 h-28 rounded-full border-2 border-green-500/30 bg-[#111916] flex items-center justify-center shadow-[0_0_50px_rgba(74,222,128,0.2)]">
            <Trophy className="w-14 h-14 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.6)]" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl font-black text-gradient-green font-[family-name:var(--font-display)] text-glow-green"
        >
          GAME OVER
        </motion.h1>

        {/* Winner card */}
        {winner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#111916] rounded-3xl border border-green-400/40 shadow-[0_0_40px_rgba(74,222,128,0.15)] p-6 space-y-3 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Crown size={80} className="text-green-400" />
            </div>
            <div className="mx-auto w-fit relative z-10">
              <ProfilePhoto src={getPhotoUrl(winner)} alt={winner.name} size="lg" className="border-2 border-green-400/50 shadow-[0_0_20px_rgba(74,222,128,0.3)]" />
            </div>
            <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-display)] relative z-10">
              {winner.name}
              {isWinner && (
                <span className="block text-sm text-green-400 mt-1">
                  C&apos;est toi !
                </span>
              )}
            </h2>
            <p className="text-gray-400 flex items-center justify-center gap-2 relative z-10">
              <Medal className="w-4 h-4 text-green-400" />
              Meilleur killer avec{" "}
              <span className="text-green-400 font-bold">
                {winner.kill_count} kill{winner.kill_count > 1 ? "s" : ""}
              </span>
            </p>
          </motion.div>
        )}

        {/* Last survivor */}
        {lastSurvivor && lastSurvivor.id !== winner?.id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#111916] rounded-2xl border border-green-500/10 p-4 flex items-center gap-3"
          >
            <ProfilePhoto src={getPhotoUrl(lastSurvivor)} alt={lastSurvivor.name} size="md" />
            <div className="text-left">
              <p className="text-sm font-semibold text-white">
                {lastSurvivor.name}
                {lastSurvivor.id === currentPlayerId && (
                  <span className="text-xs text-green-400 ml-1">(toi)</span>
                )}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Dernier survivant
              </p>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-[#111916] rounded-2xl border border-green-500/10 p-3 text-center">
            <Users className="w-4 h-4 text-green-500/60 mx-auto mb-1" />
            <p className="text-xl font-bold text-white font-[family-name:var(--font-display)]">
              {players.length}
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">joueurs</p>
          </div>
          <div className="bg-[#111916] rounded-2xl border border-green-500/10 p-3 text-center">
            <Skull className="w-4 h-4 text-red-400/60 mx-auto mb-1" />
            <p className="text-xl font-bold text-white font-[family-name:var(--font-display)]">
              {totalKills}
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">kills</p>
          </div>
          <div className="bg-[#111916] rounded-2xl border border-green-500/10 p-3 text-center">
            <Clock className="w-4 h-4 text-green-500/60 mx-auto mb-1" />
            <p className="text-xl font-bold text-white font-[family-name:var(--font-display)]">
              {gameDuration || "—"}
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">duree</p>
          </div>
        </motion.div>

        {/* Actions */}
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
