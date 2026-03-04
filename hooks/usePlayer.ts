"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Player } from "@/lib/supabase/types";

export function usePlayer(playerId: string | null) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [target, setTarget] = useState<Player | null>(null);
  const [targetPhotoUrl, setTargetPhotoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPhotoUrl = useCallback(async (accountId: string | null) => {
    if (!accountId) {
      setTargetPhotoUrl(null);
      return;
    }
    const { data } = await supabase
      .from("accounts")
      .select("photo_url")
      .eq("id", accountId)
      .single();
    setTargetPhotoUrl(data?.photo_url ?? null);
  }, []);

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
          await fetchPhotoUrl(targetData.account_id);
        }
      }
    }
    setIsLoading(false);
  }, [playerId, fetchPhotoUrl]);

  useEffect(() => {
    fetchPlayer();

    if (!playerId) return;

    const channel = supabase
      .channel(`player-${playerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
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
                if (data) {
                  setTarget(data);
                  fetchPhotoUrl(data.account_id);
                }
              });
          }
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("[usePlayer] Realtime subscription error, falling back to polling");
        }
      });

    // Fallback polling every 5s
    const interval = setInterval(fetchPlayer, 5000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [playerId, fetchPlayer]);

  return { player, target, targetPhotoUrl, isLoading, refetch: fetchPlayer };
}
