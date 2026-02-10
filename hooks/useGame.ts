"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Game } from "@/lib/supabase/types";

export function useGame(gameId: string) {
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGame = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from("games")
      .select("*")
      .eq("id", gameId)
      .single();

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setGame(data);
    }
    setIsLoading(false);
  }, [gameId]);

  useEffect(() => {
    fetchGame();

    const channel = supabase
      .channel(`game-${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          setGame(payload.new as Game);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, fetchGame]);

  return { game, isLoading, error, refetch: fetchGame };
}
