"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Player } from "@/lib/supabase/types";
import type { Mission } from "@/lib/missions";
import SurvivorCount from "./SurvivorCount";
import MissionCard from "./MissionCard";
import KillButton from "./KillButton";
import { Eye, EyeOff, Shield } from "lucide-react";

interface PlayerDashboardProps {
  player: Player;
  target: Player | null;
  mission: Mission | null;
  survivorsCount: number;
  totalPlayers: number;
  gameId: string;
}

export default function PlayerDashboard({
  player,
  target,
  mission,
  survivorsCount,
  totalPlayers,
  gameId,
}: PlayerDashboardProps) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="space-y-5 pb-24">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between"
      >
        <SurvivorCount alive={survivorsCount} total={totalPlayers} />
      </motion.div>

      {target && (
        <MissionCard
          targetName={target.name}
          targetEmoji={target.avatar_emoji}
          mission={mission}
        />
      )}

      <KillButton gameId={gameId} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-xl p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-killer-200/40" />
            <span className="text-sm text-killer-200/60">Ton code secret</span>
          </div>
          <button
            onClick={() => setShowCode(!showCode)}
            className="p-2 rounded-lg hover:bg-surface-2 transition-colors"
          >
            {showCode ? (
              <EyeOff className="w-4 h-4 text-killer-200/40" />
            ) : (
              <Eye className="w-4 h-4 text-killer-200/40" />
            )}
          </button>
        </div>
        <p className="text-2xl font-bold font-[family-name:var(--font-mono)] text-killer-300 mt-2 tracking-widest">
          {showCode ? player.kill_code : "••••"}
        </p>
        <p className="text-xs text-killer-200/30 mt-1">
          Donne ce code à ton killer si tu te fais éliminer
        </p>
      </motion.div>
    </div>
  );
}
