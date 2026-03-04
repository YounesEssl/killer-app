"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAccount } from "@/hooks/useAccount";
import { useGame } from "@/hooks/useGame";
import type { Player } from "@/lib/supabase/types";
import Leaderboard from "@/components/game/Leaderboard";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import ConnectedAs from "@/components/ui/ConnectedAs";
import AuthGuard from "@/components/auth/AuthGuard";

export default function LeaderboardPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AuthGuard>
      <LeaderboardPageContent params={params} />
    </AuthGuard>
  );
}

function LeaderboardPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id: gameId } = use(params);
  const { session } = useAccount();
  const { game } = useGame(gameId);
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (game && game.status !== "finished") {
      router.replace(`/game/${gameId}`);
    }
  }, [game, gameId, router]);

  useEffect(() => {
    async function fetchPlayers() {
      const { data } = await supabase
        .from("players")
        .select("*")
        .eq("game_id", gameId);
      if (data) setPlayers(data);
      setIsLoading(false);
    }
    fetchPlayers();
  }, [gameId]);

  if (isLoading || !game || game.status !== "finished") {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#0a0f0d]">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-green-400" />
              <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-white">
                Classement final
              </h1>
            </div>
          </div>

          <Leaderboard
            players={players}
            currentPlayerId={session?.playerId ?? null}
            lastSurvivorId={players.find((p) => p.is_alive)?.id ?? null}
          />

          <Link href={`/game/${gameId}`}>
            <Button variant="secondary" fullWidth>
              Retour
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
