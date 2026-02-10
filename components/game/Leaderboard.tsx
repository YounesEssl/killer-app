"use client";

import { motion } from "framer-motion";
import type { Player } from "@/lib/supabase/types";
import { Shield } from "lucide-react";

interface LeaderboardProps {
  players: Player[];
  currentPlayerId: string | null;
  lastSurvivorId?: string | null;
}

export default function Leaderboard({
  players,
  currentPlayerId,
  lastSurvivorId,
}: LeaderboardProps) {
  const sorted = [...players].sort((a, b) => b.kill_count - a.kill_count);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-3">
      {sorted.map((player, index) => {
        const isCurrentPlayer = player.id === currentPlayerId;
        const isLastSurvivor = player.id === lastSurvivorId;

        return (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
              isCurrentPlayer
                ? "glass glow-green"
                : "glass"
            }`}
          >
            <div className="w-8 text-center flex-shrink-0">
              {index < 3 ? (
                <span className="text-xl">{medals[index]}</span>
              ) : (
                <span className="text-sm text-killer-200/40 font-mono">
                  {index + 1}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="relative">
                <span className="text-xl">{player.avatar_emoji}</span>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface ${
                    player.is_alive ? "bg-killer-500" : "bg-danger-500"
                  }`}
                />
              </span>
              <div className="flex flex-col min-w-0">
                <span
                  className={`font-medium truncate ${
                    isCurrentPlayer ? "text-killer-300" : "text-foreground"
                  } ${!player.is_alive ? "opacity-50" : ""}`}
                >
                  {player.name}
                  {isCurrentPlayer && (
                    <span className="text-xs text-killer-500 ml-1">(toi)</span>
                  )}
                </span>
                {isLastSurvivor && (
                  <span className="flex items-center gap-1 text-xs text-killer-400">
                    <Shield className="w-3 h-3" />
                    Dernier survivant
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-lg font-bold font-[family-name:var(--font-display)] text-foreground">
                {player.kill_count}
              </span>
              <span className="text-xs text-killer-200/40">
                kill{player.kill_count > 1 ? "s" : ""}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
