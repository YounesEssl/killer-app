"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase/client";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import type { Player } from "@/lib/firebase/types";

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
    const snap = await getDoc(doc(db, "accounts", accountId));
    setTargetPhotoUrl(snap.exists() ? (snap.data().photo_url ?? null) : null);
  }, []);

  const fetchTarget = useCallback(
    async (targetId: string) => {
      const snap = await getDoc(doc(db, "players", targetId));
      if (snap.exists()) {
        const targetData = { id: snap.id, ...snap.data() } as Player;
        setTarget(targetData);
        await fetchPhotoUrl(targetData.account_id);
      }
    },
    [fetchPhotoUrl]
  );

  const fetchPlayer = useCallback(async () => {
    if (!playerId) {
      setIsLoading(false);
      return;
    }

    const snap = await getDoc(doc(db, "players", playerId));
    if (snap.exists()) {
      const data = { id: snap.id, ...snap.data() } as Player;
      setPlayer(data);
      if (data.target_id) {
        await fetchTarget(data.target_id);
      }
    }
    setIsLoading(false);
  }, [playerId, fetchTarget]);

  useEffect(() => {
    if (!playerId) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "players", playerId),
      (snap) => {
        if (snap.exists()) {
          const updated = { id: snap.id, ...snap.data() } as Player;
          setPlayer(updated);

          if (updated.target_id) {
            fetchTarget(updated.target_id);
          }
        }
        setIsLoading(false);
      },
      (err) => {
        console.error("[usePlayer] Realtime error:", err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [playerId, fetchTarget]);

  return { player, target, targetPhotoUrl, isLoading, refetch: fetchPlayer };
}
