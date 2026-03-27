"use client";

import { use, useEffect, useState } from "react";
import { useGame } from "@/hooks/useGame";
import { db } from "@/lib/firebase/client";
import { collection, query, where, getDocs } from "firebase/firestore";
import type { Player } from "@/lib/firebase/types";
import KillFeed from "@/components/game/KillFeed";
import BottomNav from "@/components/ui/BottomNav";
import Badge from "@/components/ui/Badge";
import { motion } from "framer-motion";
import ConnectedAs from "@/components/ui/ConnectedAs";
import AuthGuard from "@/components/auth/AuthGuard";

export default function FeedPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AuthGuard>
      <FeedPageContent params={params} />
    </AuthGuard>
  );
}

function FeedPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id: gameId } = use(params);
  const { game } = useGame(gameId);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    getDocs(query(collection(db, "players"), where("game_id", "==", gameId)))
      .then((snap) => setPlayers(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Player)));
  }, [gameId]);

  const alivePlayers = players.filter((p) => p.is_alive);

  return (
    <div className="min-h-dvh px-5 py-6 pb-24 max-w-lg mx-auto bg-[#0a0f0d] relative">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <ConnectedAs />
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-white">
                Feed
              </h1>
              {game?.status === "active" && (
                <Badge variant="green">
                  {alivePlayers.length}/{players.length} survivants
                </Badge>
              )}
            </div>
          </div>

          <KillFeed gameId={gameId} totalPlayers={players.length} />
        </motion.div>
      </div>

      <BottomNav gameId={gameId} />
    </div>
  );
}
