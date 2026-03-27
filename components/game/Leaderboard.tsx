"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Player, Account } from "@/lib/firebase/types";
import { Shield, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import ProfilePhoto from "@/components/ui/ProfilePhoto";
import { db } from "@/lib/firebase/client";
import { batchGetByIds } from "@/lib/firebase/helpers";

interface LeaderboardProps {
  players: Player[];
  currentPlayerId: string | null;
  lastSurvivorId?: string | null;
}

const medalColors = [
  "text-amber-400", // gold
  "text-gray-400", // silver
  "text-amber-600", // bronze
];

export default function Leaderboard({
  players,
  currentPlayerId,
  lastSurvivorId,
}: LeaderboardProps) {
  const sorted = [...players].sort((a, b) => b.kill_count - a.kill_count);
  const [photoMap, setPhotoMap] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const accountIds = players.filter((p) => p.account_id).map((p) => p.account_id!);
    if (accountIds.length === 0) return;

    batchGetByIds<Account>(db, "accounts", accountIds).then((accounts) => {
      const map: Record<string, string | null> = {};
      accounts.forEach((acc, id) => {
        map[id] = acc.photo_url ?? null;
      });
      setPhotoMap(map);
    });
  }, [players]);

  return (
    <div className="space-y-3">
      {sorted.map((player, index) => {
        const isCurrentPlayer = player.id === currentPlayerId;
        const isLastSurvivor = player.id === lastSurvivorId;
        const photoUrl = player.account_id ? photoMap[player.account_id] ?? null : null;

        return (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4, delay: index * 0.04 }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-2xl transition-all",
              isCurrentPlayer
                ? "bg-[#111916] border border-green-500/30 shadow-[0_0_20px_rgba(74,222,128,0.1)]"
                : "bg-[#111916] border border-white/5"
            )}
          >
            <div className="w-8 text-center flex-shrink-0">
              {index < 3 ? (
                <Medal className={cn("w-5 h-5 mx-auto", medalColors[index])} />
              ) : (
                <span className="text-sm text-gray-500 font-mono">
                  {index + 1}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="relative">
                <ProfilePhoto src={photoUrl} alt={player.name} size="md" />
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#111916]",
                    player.is_alive ? "bg-green-500 shadow-[0_0_6px_rgba(74,222,128,0.5)]" : "bg-red-400"
                  )}
                />
              </span>
              <div className="flex flex-col min-w-0">
                <span
                  className={cn(
                    "font-medium truncate text-sm",
                    isCurrentPlayer ? "text-green-400" : "text-white",
                    !player.is_alive && "opacity-50"
                  )}
                >
                  {player.name}
                  {isCurrentPlayer && (
                    <span className="text-xs text-green-400/60 ml-1">(toi)</span>
                  )}
                </span>
                {isLastSurvivor && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <Shield className="w-3 h-3" />
                    Dernier survivant
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-lg font-bold font-[family-name:var(--font-display)] text-white">
                {player.kill_count}
              </span>
              <span className="text-xs text-gray-500">
                kill{player.kill_count > 1 ? "s" : ""}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
