"use client";

import { useKillFeed } from "@/hooks/useKillFeed";
import KillFeedItem from "./KillFeedItem";
import { motion } from "framer-motion";
import { Skull } from "lucide-react";

interface KillFeedProps {
  gameId: string;
  totalPlayers: number;
}

export default function KillFeed({ gameId, totalPlayers }: KillFeedProps) {
  const { events, isLoading } = useKillFeed(gameId);

  const currentSurvivors = events.length > 0
    ? events[0].survivors_count
    : totalPlayers;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-white">
          Eliminations
        </h2>
        <span className="text-sm text-gray-500">
          {currentSurvivors} sur {totalPlayers}
        </span>
      </div>

      {events.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
            <Skull className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-gray-500">Aucune elimination pour le moment</p>
          <p className="text-gray-600 text-sm mt-1">
            La tension monte...
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {events.map((event, index) => (
            <KillFeedItem
              key={event.id}
              survivorsCount={event.survivors_count}
              killedAt={event.killed_at}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
