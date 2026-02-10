"use client";

import { use, useEffect, useState } from "react";
import { useGame } from "@/hooks/useGame";
import { supabase } from "@/lib/supabase/client";
import type { Player } from "@/lib/supabase/types";
import KillFeed from "@/components/game/KillFeed";
import BottomNav from "@/components/ui/BottomNav";
import Badge from "@/components/ui/Badge";
import { motion } from "framer-motion";

export default function FeedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: gameId } = use(params);
  const { game } = useGame(gameId);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    supabase
      .from("players")
      .select("*")
      .eq("game_id", gameId)
      .then(({ data }) => { if (data) setPlayers(data); });
  }, [gameId]);

  const alivePlayers = players.filter((p) => p.is_alive);

  return (
    <div className="min-h-dvh px-4 py-6 pb-24 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
            Feed
          </h1>
          {game?.status === "active" && (
            <Badge variant="green">
              {alivePlayers.length}/{players.length} survivants
            </Badge>
          )}
        </div>

        <KillFeed gameId={gameId} totalPlayers={players.length} />
      </motion.div>

      <BottomNav gameId={gameId} />
    </div>
  );
}
