"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase/client";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";
import type { Account } from "@/lib/firebase/types";

const STORAGE_KEY = "killer_account_id";

type Session = {
  playerId: string;
  gameId: string;
};

export function useAccount() {
  const [account, setAccount] = useState<Account | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAccount = useCallback(async (accountId: string) => {
    const snap = await getDoc(doc(db, "accounts", accountId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Account;
  }, []);

  const fetchActiveSession = useCallback(async (accountId: string) => {
    try {
      // Find player records for this account (no orderBy to avoid composite index requirement)
      const playersQuery = query(
        collection(db, "players"),
        where("account_id", "==", accountId),
        limit(10)
      );
      const playersSnap = await getDocs(playersQuery);

      // Check each player's game status to find an active one
      for (const playerDoc of playersSnap.docs) {
        const player = playerDoc.data();
        const gameSnap = await getDoc(doc(db, "games", player.game_id));
        if (gameSnap.exists()) {
          const gameStatus = gameSnap.data().status;
          if (gameStatus === "lobby" || gameStatus === "active") {
            return { playerId: playerDoc.id, gameId: player.game_id };
          }
        }
      }
    } catch (err) {
      console.error("[useAccount] fetchActiveSession error:", err);
    }
    return null;
  }, []);

  const load = useCallback(async () => {
    try {
      const accountId = localStorage.getItem(STORAGE_KEY);
      if (!accountId) {
        setAccount(null);
        setSession(null);
        setIsLoading(false);
        return;
      }

      const acc = await fetchAccount(accountId);
      if (!acc) {
        localStorage.removeItem(STORAGE_KEY);
        setAccount(null);
        setSession(null);
        setIsLoading(false);
        return;
      }

      setAccount(acc);
      const sess = await fetchActiveSession(accountId);
      setSession(sess);
    } catch {
      setAccount(null);
      setSession(null);
    }
    setIsLoading(false);
  }, [fetchAccount, fetchActiveSession]);

  useEffect(() => {
    load();
  }, [load]);

  const login = useCallback(async (username: string, code: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, code }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error);
    }

    const acc = data.account as Account;
    localStorage.setItem(STORAGE_KEY, acc.id);
    setAccount(acc);

    const sess = await fetchActiveSession(acc.id);
    setSession(sess);

    return acc;
  }, [fetchActiveSession]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAccount(null);
    setSession(null);
  }, []);

  const refreshAccount = useCallback(async () => {
    if (!account) return;
    const acc = await fetchAccount(account.id);
    if (acc) setAccount(acc);
    const sess = await fetchActiveSession(account.id);
    setSession(sess);
  }, [account, fetchAccount, fetchActiveSession]);

  return {
    account,
    session,
    isLoading,
    isLoggedIn: !!account,
    needsPhoto: !!account && !account.photo_url,
    login,
    logout,
    refreshAccount,
  };
}
