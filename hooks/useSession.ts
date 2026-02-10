"use client";

import { useState, useEffect, useCallback } from "react";

type Session = {
  playerId: string;
  gameId: string;
};

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("killer-session");
    if (stored) {
      try {
        setSession(JSON.parse(stored));
      } catch {
        localStorage.removeItem("killer-session");
      }
    }
    setIsLoading(false);
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
