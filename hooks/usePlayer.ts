"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Player } from "@/lib/supabase/types";

export function usePlayer(playerId: string | null) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [target, setTarget] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlayer = useCallback(async () => {
    if (!playerId) {
      setIsLoading(false);
      return;
    }

    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("id", playerId)
      .single();

    if (data) {
      setPlayer(data);

      if (data.target_id) {
        const { data: targetData } = await supabase
          .from("players")
          .select("*")
          .eq("id", data.target_id)
          .single();

        if (targetData) {
          setTarget(targetData);
        }
      }
    }
    setIsLoading(false);
  }, [playerId]);

  useEffect(() => {
    fetchPlayer();

    if (!playerId) return;

    const channel = supabase
      .channel(`player-${playerId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "players",
          filter: `id=eq.${playerId}`,
        },
        (payload) => {
          const updated = payload.new as Player;
          setPlayer(updated);

          if (updated.target_id) {
            supabase
              .from("players")
              .select("*")
              .eq("id", updated.target_id)
              .single()
              .then(({ data }) => {
                if (data) setTarget(data);
              });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [playerId, fetchPlayer]);

  return { player, target, isLoading, refetch: fetchPlayer };
}
