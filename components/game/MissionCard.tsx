"use client";

import { motion } from "framer-motion";
import type { Mission } from "@/lib/missions";
import { MessageCircle, Handshake, Drama, Brain, Swords } from "lucide-react";
import ProfilePhoto from "@/components/ui/ProfilePhoto";

interface MissionCardProps {
  targetName: string;
  targetPhotoUrl: string | null;
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
  targetPhotoUrl,
  mission,
}: MissionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.5, delay: 0.1 }}
      className="bg-[#111916] rounded-3xl border border-green-400/40 shadow-[0_0_40px_rgba(74,222,128,0.15)] p-6 space-y-5 relative overflow-hidden"
    >
      {/* Subtle green gradient at top */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none" />

      <div className="space-y-3 relative z-10">
        <p className="text-xs uppercase tracking-widest text-green-400 font-[family-name:var(--font-display)] font-bold">
          Ta cible
        </p>
        <div className="flex items-center gap-4">
          <div className="relative">
            <ProfilePhoto src={targetPhotoUrl} alt={targetName} size="lg" className="border-2 border-green-500/30 shadow-[0_0_20px_rgba(74,222,128,0.2)]" />
            <div className="absolute -bottom-1 -right-1 bg-green-500 p-1 rounded-lg shadow-lg">
              <Swords className="w-3 h-3 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white font-[family-name:var(--font-display)]">
            {targetName}
          </h2>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />

      <div className="space-y-3 relative z-10">
        <p className="text-xs uppercase tracking-widest text-green-400 font-[family-name:var(--font-display)] font-bold">
          Ta mission
        </p>
        <p className="text-lg text-gray-300 leading-relaxed">
          {mission?.description || "Mission en cours de chargement..."}
        </p>
      </div>
    </motion.div>
  );
}
