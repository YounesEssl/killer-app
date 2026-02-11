"use client";

import { motion } from "framer-motion";
import type { Player } from "@/lib/supabase/types";
import { Shield, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import PlayerAvatar from "@/components/ui/PlayerAvatar";

interface LeaderboardProps {
  players: Player[];
  currentPlayerId: string | null;
  lastSurvivorId?: string | null;
}

const medalColors = [
  "text-amber-500", // gold
  "text-slate-400", // silver
  "text-amber-700", // bronze
];

export default function Leaderboard({
  players,
  currentPlayerId,
  lastSurvivorId,
}: LeaderboardProps) {
  const sorted = [...players].sort((a, b) => b.kill_count - a.kill_count);

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
            transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4, delay: index * 0.04 }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-2xl transition-all",
              isCurrentPlayer
                ? "bg-white border-2 border-brand-200 shadow-brand"
                : "bg-white border border-slate-100 shadow-sm"
            )}
          >
            <div className="w-8 text-center flex-shrink-0">
              {index < 3 ? (
                <Medal className={cn("w-5 h-5 mx-auto", medalColors[index])} />
              ) : (
                <span className="text-sm text-slate-400 font-mono">
                  {index + 1}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="relative">
                <PlayerAvatar avatarId={player.avatar_emoji} size="md" />
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white",
                    player.is_alive ? "bg-brand-500" : "bg-rose-400"
                  )}
                />
              </span>
              <div className="flex flex-col min-w-0">
                <span
                  className={cn(
                    "font-medium truncate text-sm",
                    isCurrentPlayer ? "text-brand-700" : "text-slate-900",
                    !player.is_alive && "opacity-50"
                  )}
                >
                  {player.name}
                  {isCurrentPlayer && (
                    <span className="text-xs text-brand-600 ml-1">(toi)</span>
                  )}
                </span>
                {isLastSurvivor && (
                  <span className="flex items-center gap-1 text-xs text-brand-600">
                    <Shield className="w-3 h-3" />
                    Dernier survivant
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-lg font-bold font-[family-name:var(--font-display)] text-slate-900">
                {player.kill_count}
              </span>
              <span className="text-xs text-slate-400">
                kill{player.kill_count > 1 ? "s" : ""}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
