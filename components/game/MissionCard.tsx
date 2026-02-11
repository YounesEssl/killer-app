"use client";

import { motion } from "framer-motion";
import type { Mission } from "@/lib/missions";
import { MessageCircle, Handshake, Drama, Brain } from "lucide-react";
import PlayerAvatar from "@/components/ui/PlayerAvatar";

interface MissionCardProps {
  targetName: string;
  targetEmoji: string;
  mission: Mission | null;
}

const categoryIcons = {
  conversation: { icon: MessageCircle, label: "Conversation" },
  action: { icon: Handshake, label: "Action" },
  social: { icon: Drama, label: "Social" },
  piege: { icon: Brain, label: "Piege" },
};

export default function MissionCard({
  targetName,
  targetEmoji,
  mission,
}: MissionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-3xl border-2 border-brand-200 shadow-brand p-6 space-y-5"
    >
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-brand-600 font-[family-name:var(--font-display)] font-bold">
          Ta cible
        </p>
        <div className="flex items-center gap-4">
          <PlayerAvatar avatarId={targetEmoji} size="lg" />
          <h2 className="text-3xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
            {targetName}
          </h2>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent" />

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-brand-600 font-[family-name:var(--font-display)] font-bold">
          Ta mission
        </p>
        <p className="text-lg text-slate-700 leading-relaxed">
          {mission?.description || "Mission en cours de chargement..."}
        </p>
        {mission && (
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold font-[family-name:var(--font-display)] ${
                mission.difficulty === "easy"
                  ? "bg-brand-100 text-brand-700"
                  : mission.difficulty === "medium"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              {mission.difficulty === "easy"
                ? "Facile"
                : mission.difficulty === "medium"
                ? "Moyen"
                : "Difficile"}
            </span>
            {(() => {
              const cat = categoryIcons[mission.category as keyof typeof categoryIcons];
              if (!cat) return null;
              const CatIcon = cat.icon;
              return (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <CatIcon className="w-3.5 h-3.5" />
                  {cat.label}
                </span>
              );
            })()}
          </div>
        )}
      </div>
    </motion.div>
  );
}
