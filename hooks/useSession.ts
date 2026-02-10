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

  useEffect(() => {
    async function init() {
      // 1. Try localStorage first
      const stored = localStorage.getItem("killer-session");
      if (stored) {
        try {
          setSession(JSON.parse(stored));
          setIsLoading(false);
          return;
        } catch {
          localStorage.removeItem("killer-session");
        }
      }

      // 2. If no localStorage, try to recover from auth
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: player } = await supabase
            .from("players")
            .select("id, game_id, games!inner(status)")
            .eq("user_id", user.id)
            .in("games.status", ["lobby", "active"])
            .order("joined_at", { ascending: false })
            .limit(1)
            .single();

          if (player) {
            const recovered: Session = {
              playerId: player.id,
              gameId: player.game_id,
            };
            localStorage.setItem(
              "killer-session",
              JSON.stringify(recovered)
            );
            setSession(recovered);
          }
        }
      } catch {
        // No auth or no active game — that's fine
      }

      setIsLoading(false);
    }

    init();
  }, []);

  const saveSession = useCallback((playerId: string, gameId: string) => {
    const newSession = { playerId, gameId };
    localStorage.setItem("killer-session", JSON.stringify(newSession));
    setSession(newSession);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem("killer-session");
    setSession(null);
  }, []);

  return { session, isLoading, saveSession, clearSession };
}
