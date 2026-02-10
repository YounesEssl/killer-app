"use client";

import { motion } from "framer-motion";
import type { Mission } from "@/lib/missions";

interface MissionCardProps {
  targetName: string;
  targetEmoji: string;
  mission: Mission | null;
}

export default function MissionCard({
  targetName,
  targetEmoji,
  mission,
}: MissionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass glow-green rounded-2xl p-6 space-y-5"
    >
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-killer-500 font-[family-name:var(--font-display)] font-semibold">
          Ta cible
        </p>
        <div className="flex items-center gap-4">
          <span className="text-4xl">{targetEmoji}</span>
          <h2 className="text-3xl font-bold text-foreground font-[family-name:var(--font-display)]">
            {targetName}
          </h2>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-killer-500/30 to-transparent" />

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-killer-500 font-[family-name:var(--font-display)] font-semibold">
          Ta mission
        </p>
        <p className="text-lg text-killer-100 leading-relaxed">
          {mission?.description || "Mission en cours de chargement..."}
        </p>
        {mission && (
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium font-[family-name:var(--font-display)] ${
                mission.difficulty === "easy"
                  ? "bg-killer-900/50 text-killer-300"
                  : mission.difficulty === "medium"
                  ? "bg-yellow-900/30 text-yellow-400"
                  : "bg-danger-600/20 text-danger-400"
              }`}
            >
              {mission.difficulty === "easy"
                ? "Facile"
                : mission.difficulty === "medium"
                ? "Moyen"
                : "Difficile"}
            </span>
            <span className="text-xs text-killer-200/40">
              {mission.category === "conversation"
                ? "🗣️ Conversation"
                : mission.category === "action"
                ? "🤝 Action"
                : mission.category === "social"
                ? "🎭 Social"
                : "🧠 Piège"}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
