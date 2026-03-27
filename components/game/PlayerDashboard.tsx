"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Player } from "@/lib/firebase/types";
import type { Mission } from "@/lib/missions";
import SurvivorCount from "./SurvivorCount";
import MissionCard from "./MissionCard";
import KillButton from "./KillButton";
import { Eye, EyeOff, Lock, ShieldAlert } from "lucide-react";

interface PlayerDashboardProps {
  player: Player;
  target: Player | null;
  targetPhotoUrl: string | null;
  mission: Mission | null;
  survivorsCount: number;
  totalPlayers: number;
  gameId: string;
}

export default function PlayerDashboard({
  player,
  target,
  targetPhotoUrl,
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
          targetPhotoUrl={targetPhotoUrl}
          mission={mission}
        />
      )}

      <KillButton gameId={gameId} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4, delay: 0.5 }}
        className="bg-[#111916] rounded-3xl border border-green-500/10 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-green-400" />
            <span className="text-xs font-bold text-green-400 tracking-widest uppercase font-[family-name:var(--font-display)]">
              Ton code secret
            </span>
          </div>
          <button
            onClick={() => setShowCode(!showCode)}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            {showCode ? (
              <EyeOff className="w-4 h-4 text-gray-500" />
            ) : (
              <Eye className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
        <div className="flex justify-center items-center py-4 bg-[#0a0f0d] rounded-2xl border border-white/5 mb-4">
          <p className={`text-3xl font-bold font-[family-name:var(--font-mono)] tracking-[0.5em] transition-all duration-300 ${showCode ? "text-white" : "text-gray-700 blur-sm"}`}>
            {showCode ? player.kill_code : "****"}
          </p>
        </div>
        <div className="flex items-start gap-3 px-1">
          <ShieldAlert className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
          <p className="text-[11px] text-gray-500 leading-tight">
            Donne ce code a ton killer si tu te fais eliminer
          </p>
        </div>
      </motion.div>
    </div>
  );
}
