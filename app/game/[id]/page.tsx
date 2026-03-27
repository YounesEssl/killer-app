"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@/hooks/useAccount";
import { useGame } from "@/hooks/useGame";
import { usePlayer } from "@/hooks/usePlayer";
import { db } from "@/lib/firebase/client";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { getMissionById } from "@/lib/missions";
import type { Player } from "@/lib/firebase/types";
import GameLobby from "@/components/game/GameLobby";
import PlayerDashboard from "@/components/game/PlayerDashboard";
import DeathScreen from "@/components/game/DeathScreen";
import VictoryScreen from "@/components/game/VictoryScreen";
import BottomNav from "@/components/ui/BottomNav";
import { AlertCircle, Lock } from "lucide-react";
import ConnectedAs from "@/components/ui/ConnectedAs";
import AuthGuard from "@/components/auth/AuthGuard";

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AuthGuard>
      <GamePageContent params={params} />
    </AuthGuard>
  );
}

function GamePageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id: gameId } = use(params);
  const router = useRouter();
  const { account, session } = useAccount();
  const { game, isLoading: gameLoading } = useGame(gameId);
  const { player, target, targetPhotoUrl, isLoading: playerLoading } = usePlayer(
    session?.gameId === gameId ? session?.playerId ?? null : null
  );
  const [players, setPlayers] = useState<Player[]>([]);
  const [playersLoading, setPlayersLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "players"),
      where("game_id", "==", gameId)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Player);
      list.sort((a, b) => (a.joined_at ?? "").localeCompare(b.joined_at ?? ""));
      setPlayers(list);
      setPlayersLoading(false);
    });

    return () => unsubscribe();
  }, [gameId]);

  const isLoading = gameLoading || playerLoading || playersLoading;

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#0a0f0d]">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-6 bg-[#0a0f0d]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-gray-500" />
          </div>
          <p className="text-gray-400">Partie introuvable</p>
          <button
            onClick={() => router.push("/")}
            className="text-green-400 text-sm font-semibold"
          >
            Retour a l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  // Lobby state
  if (game.status === "lobby") {
    return <GameLobby game={game} players={players} />;
  }

  // Finished state
  if (game.status === "finished") {
    const winner = players.find((p) => p.id === game.winner_id) || null;
    return (
      <VictoryScreen
        game={game}
        winner={winner}
        players={players}
        currentPlayerId={session?.playerId ?? null}
      />
    );
  }

  // Active game - need player session
  if (!session || !player) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-6 bg-[#0a0f0d]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-gray-500" />
          </div>
          <p className="text-gray-400">Session expiree</p>
          <button
            onClick={() => router.push("/join?code=" + game.join_code)}
            className="text-green-400 text-sm font-semibold"
          >
            Retrouver ma session
          </button>
        </div>
      </div>
    );
  }

  // Dead state
  if (!player.is_alive) {
    return (
      <>
        <DeathScreen
          player={player}
          gameId={gameId}
          gameStartedAt={game.started_at}
        />
        <BottomNav gameId={gameId} />
      </>
    );
  }

  // Active & alive
  const alivePlayers = players.filter((p) => p.is_alive);
  const missionFromId = player.mission_id ? getMissionById(player.mission_id) ?? null : null;
  const mission = missionFromId || (player.mission_description ? { id: 0, description: player.mission_description, category: "action" as const, difficulty: "medium" as const } : null);

  return (
    <div className="min-h-dvh px-5 py-6 max-w-lg mx-auto bg-[#0a0f0d] relative">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="relative z-10">
        <div className="mb-4">
          <ConnectedAs />
        </div>
        <PlayerDashboard
          player={player}
          target={target}
          targetPhotoUrl={targetPhotoUrl}
          mission={mission}
          survivorsCount={alivePlayers.length}
          totalPlayers={players.length}
          gameId={gameId}
        />
      </div>
      <BottomNav gameId={gameId} />
    </div>
  );
}
