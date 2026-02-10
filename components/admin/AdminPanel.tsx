"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Game, Player, KillEvent } from "@/lib/supabase/types";
import { getMissionById } from "@/lib/missions";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import {
  Users,
  Skull,
  Play,
  Trophy,
  Eye,
  ArrowRight,
} from "lucide-react";

interface AdminPanelProps {
  game: Game;
  players: Player[];
  events: KillEvent[];
}

export default function AdminPanel({
  game,
  players: initialPlayers,
  events: initialEvents,
}: AdminPanelProps) {
  const [players, setPlayers] = useState(initialPlayers);
  const [events, setEvents] = useState(initialEvents);

  const alivePlayers = players.filter((p) => p.is_alive);
  const deadPlayers = players.filter((p) => !p.is_alive);

  useEffect(() => {
    const channel = supabase
      .channel(`admin-${game.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players", filter: `game_id=eq.${game.id}` },
        () => {
          supabase
            .from("players")
            .select("*")
            .eq("game_id", game.id)
            .order("joined_at", { ascending: true })
            .then(({ data }) => { if (data) setPlayers(data); });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "kill_events", filter: `game_id=eq.${game.id}` },
        (payload) => {
          setEvents((prev) => [payload.new as KillEvent, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [game.id]);

  const getPlayerName = (id: string) =>
    players.find((p) => p.id === id)?.name || "Inconnu";

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
          Admin Panel
        </h1>
        <Badge variant={game.status === "active" ? "live" : game.status === "finished" ? "red" : "green"}>
          {game.status === "lobby" ? "Lobby" : game.status === "active" ? "En cours" : "Terminé"}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card padding="sm">
          <div className="text-center">
            <Users className="w-5 h-5 text-killer-400 mx-auto mb-1" />
            <p className="text-xl font-bold font-[family-name:var(--font-display)]">{players.length}</p>
            <p className="text-xs text-killer-200/50">joueurs</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <Play className="w-5 h-5 text-killer-400 mx-auto mb-1" />
            <p className="text-xl font-bold font-[family-name:var(--font-display)]">{alivePlayers.length}</p>
            <p className="text-xs text-killer-200/50">vivants</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <Skull className="w-5 h-5 text-danger-400 mx-auto mb-1" />
            <p className="text-xl font-bold font-[family-name:var(--font-display)]">{deadPlayers.length}</p>
            <p className="text-xs text-killer-200/50">morts</p>
          </div>
        </Card>
      </div>

      {game.status === "active" && (
        <Card>
          <h2 className="text-lg font-bold font-[family-name:var(--font-display)] mb-3 flex items-center gap-2">
            <Eye className="w-5 h-5 text-killer-400" />
            Chaîne des assassinats
          </h2>
          <div className="space-y-2">
            {alivePlayers.map((player) => {
              const target = players.find((p) => p.id === player.target_id);
              const mission = player.mission_id ? getMissionById(player.mission_id) : null;
              return (
                <div
                  key={player.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-surface-2/50 text-sm"
                >
                  <span>{player.avatar_emoji}</span>
                  <span className="font-medium">{player.name}</span>
                  <ArrowRight className="w-3 h-3 text-killer-500 flex-shrink-0" />
                  <span>{target?.avatar_emoji}</span>
                  <span className="text-killer-200/60">{target?.name}</span>
                  {mission && (
                    <span className="text-xs text-killer-200/30 truncate ml-auto">
                      {mission.description}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-bold font-[family-name:var(--font-display)] mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-killer-400" />
          Tous les joueurs
        </h2>
        <div className="space-y-2">
          {players.map((player) => (
            <div
              key={player.id}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                player.is_alive ? "bg-surface-2/50" : "bg-surface-2/30 opacity-60"
              }`}
            >
              <span className="text-xl">{player.avatar_emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{player.name}</p>
                <p className="text-xs text-killer-200/40 font-[family-name:var(--font-mono)]">
                  Code: {player.kill_code}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold">{player.kill_count} kills</p>
                <span
                  className={`text-xs ${player.is_alive ? "text-killer-400" : "text-danger-400"}`}
                >
                  {player.is_alive ? "Vivant" : "Mort"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {events.length > 0 && (
        <Card>
          <h2 className="text-lg font-bold font-[family-name:var(--font-display)] mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-killer-400" />
            Timeline des kills
          </h2>
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-surface-2/50 text-sm"
              >
                <Skull className="w-4 h-4 text-danger-400 flex-shrink-0" />
                <div className="flex-1">
                  <p>
                    <span className="font-medium">{getPlayerName(event.killer_id)}</span>
                    {" "}a éliminé{" "}
                    <span className="text-danger-400">{getPlayerName(event.victim_id)}</span>
                  </p>
                  <p className="text-xs text-killer-200/40">{event.mission_description}</p>
                </div>
                <span className="text-xs text-killer-200/40 flex-shrink-0">
                  {formatRelativeTime(event.killed_at)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
