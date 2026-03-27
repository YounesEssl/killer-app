"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase/client";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import type { KillEvent } from "@/lib/firebase/types";

export function useKillFeed(gameId: string) {
  const [events, setEvents] = useState<KillEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    const q = query(
      collection(db, "kill_events"),
      where("game_id", "==", gameId)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as KillEvent);
    list.sort((a, b) => b.killed_at.localeCompare(a.killed_at));
    setEvents(list);
    setIsLoading(false);
  }, [gameId]);

  useEffect(() => {
    const q = query(
      collection(db, "kill_events"),
      where("game_id", "==", gameId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as KillEvent);
        list.sort((a, b) => b.killed_at.localeCompare(a.killed_at));
        setEvents(list);
        setIsLoading(false);
      },
      (err) => {
        console.error("[useKillFeed] Realtime error:", err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [gameId]);

  return { events, isLoading, refetch: fetchEvents };
}
