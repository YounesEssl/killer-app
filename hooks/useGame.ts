"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase/client";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import type { Game } from "@/lib/firebase/types";

export function useGame(gameId: string) {
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGame = useCallback(async () => {
    try {
      const snap = await getDoc(doc(db, "games", gameId));
      if (snap.exists()) {
        setGame({ id: snap.id, ...snap.data() } as Game);
      } else {
        setError("Partie introuvable");
      }
    } catch (err) {
      setError((err as Error).message);
    }
    setIsLoading(false);
  }, [gameId]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "games", gameId),
      (snap) => {
        if (snap.exists()) {
          setGame({ id: snap.id, ...snap.data() } as Game);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error("[useGame] Realtime error:", err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [gameId]);

  return { game, isLoading, error, refetch: fetchGame };
}
