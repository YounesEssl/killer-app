"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

type Session = {
  playerId: string;
  gameId: string;
};

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSession(null);
        setIsLoading(false);
        return;
      }

      const { data: player } = await supabase
        .from("players")
        .select("id, game_id, games!inner(status)")
        .eq("user_id", user.id)
        .in("games.status", ["lobby", "active"])
        .order("joined_at", { ascending: false })
        .limit(1)
        .single();

      if (player) {
        setSession({ playerId: player.id, gameId: player.game_id });
      } else {
        setSession(null);
      }
    } catch {
      setSession(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return { session, isLoading, refreshSession: fetchSession };
}
