"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Player } from "@/lib/supabase/types";
import type { Mission } from "@/lib/missions";
import SurvivorCount from "./SurvivorCount";
import MissionCard from "./MissionCard";
import KillButton from "./KillButton";
import { Eye, EyeOff, Lock } from "lucide-react";

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
        transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
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
        transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4, delay: 0.5 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-500">Ton code secret</span>
          </div>
          <button
            onClick={() => setShowCode(!showCode)}
            className="p-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            {showCode ? (
              <EyeOff className="w-4 h-4 text-slate-400" />
            ) : (
              <Eye className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
        <p className="text-2xl font-bold font-[family-name:var(--font-mono)] text-brand-600 mt-2 tracking-widest">
          {showCode ? player.kill_code : "****"}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Donne ce code a ton killer si tu te fais eliminer
        </p>
      </motion.div>
    </div>
  );
}
