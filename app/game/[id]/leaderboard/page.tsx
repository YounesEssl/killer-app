"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/hooks/useSession";
import { useGame } from "@/hooks/useGame";
import type { Player } from "@/lib/supabase/types";
import Leaderboard from "@/components/game/Leaderboard";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function LeaderboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: gameId } = use(params);
  const { session } = useSession();
  const { game } = useGame(gameId);
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect to game page if game is still active
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
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-killer-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh px-4 py-6 pb-24 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-killer-400" />
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
            Classement final
          </h1>
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
  );
}
