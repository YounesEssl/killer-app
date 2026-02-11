"use client";

import { useState, useEffect } from "react";
import type { Game, Player, KillEvent } from "@/lib/supabase/types";
import { getMissionById } from "@/lib/missions";
import Card from "@/components/ui/Card";
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
import PlayerAvatar from "@/components/ui/PlayerAvatar";

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
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Admin Panel
        </h1>
        <Badge variant={game.status === "active" ? "live" : game.status === "finished" ? "red" : "green"}>
          {game.status === "lobby" ? "Lobby" : game.status === "active" ? "En cours" : "Termine"}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card padding="sm">
          <div className="text-center">
            <Users className="w-5 h-5 text-brand-500 mx-auto mb-1" />
            <p className="text-xl font-bold font-[family-name:var(--font-display)] text-slate-900">{players.length}</p>
            <p className="text-xs text-slate-400">joueurs</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <Play className="w-5 h-5 text-brand-500 mx-auto mb-1" />
            <p className="text-xl font-bold font-[family-name:var(--font-display)] text-slate-900">{alivePlayers.length}</p>
            <p className="text-xs text-slate-400">vivants</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <Skull className="w-5 h-5 text-rose-500 mx-auto mb-1" />
            <p className="text-xl font-bold font-[family-name:var(--font-display)] text-slate-900">{deadPlayers.length}</p>
            <p className="text-xs text-slate-400">morts</p>
          </div>
        </Card>
      </div>

      {game.status === "active" && (
        <Card>
          <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-slate-900 mb-3 flex items-center gap-2">
            <Eye className="w-5 h-5 text-brand-500" />
            Chaine des assassinats
          </h2>
          <div className="space-y-2">
            {alivePlayers.map((player) => {
              const target = players.find((p) => p.id === player.target_id);
              const mission = player.mission_id ? getMissionById(player.mission_id) : null;
              return (
                <div
                  key={player.id}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 text-sm"
                >
                  <PlayerAvatar avatarId={player.avatar_emoji} size="sm" />
                  <span className="font-medium text-slate-900">{player.name}</span>
                  <ArrowRight className="w-3 h-3 text-brand-500 flex-shrink-0" />
                  <PlayerAvatar avatarId={target?.avatar_emoji || ""} size="sm" />
                  <span className="text-slate-500">{target?.name}</span>
                  {mission && (
                    <span className="text-xs text-slate-400 truncate ml-auto">
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
        <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-slate-900 mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-500" />
          Tous les joueurs
        </h2>
        <div className="space-y-2">
          {players.map((player) => (
            <div
              key={player.id}
              className={`flex items-center gap-3 p-2.5 rounded-xl ${
                player.is_alive ? "bg-slate-50" : "bg-slate-50 opacity-50"
              }`}
            >
              <PlayerAvatar avatarId={player.avatar_emoji} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate text-slate-900">{player.name}</p>
                <p className="text-xs text-slate-400 font-[family-name:var(--font-mono)]">
                  Code: {player.kill_code}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-slate-900">{player.kill_count} kills</p>
                <span
                  className={`text-xs ${player.is_alive ? "text-brand-600" : "text-rose-500"}`}
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
          <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-slate-900 mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-brand-500" />
            Timeline des kills
          </h2>
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 text-sm"
              >
                <Skull className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-slate-900">
                    <span className="font-medium">{getPlayerName(event.killer_id)}</span>
                    {" "}a elimine{" "}
                    <span className="text-rose-500">{getPlayerName(event.victim_id)}</span>
                  </p>
                  <p className="text-xs text-slate-400">{event.mission_description}</p>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">
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
