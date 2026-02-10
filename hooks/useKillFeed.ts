"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { KillEvent } from "@/lib/supabase/types";

export function useKillFeed(gameId: string) {
  const [events, setEvents] = useState<KillEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    const { data } = await supabase
      .from("kill_events")
      .select("*")
      .eq("game_id", gameId)
      .order("killed_at", { ascending: false });

    if (data) {
      setEvents(data);
    }
    setIsLoading(false);
  }, [gameId]);

  useEffect(() => {
    fetchEvents();

    const channel = supabase
      .channel(`kill-feed-${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "kill_events",
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          setEvents((prev) => [payload.new as KillEvent, ...prev]);
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("[useKillFeed] Realtime subscription error, falling back to polling");
        }
      });

    // Fallback polling every 5s
    const interval = setInterval(fetchEvents, 5000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [gameId, fetchEvents]);

  return { events, isLoading, refetch: fetchEvents };
}
