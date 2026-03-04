"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Account } from "@/lib/supabase/types";

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
    const { data } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", accountId)
      .single();
    return data as Account | null;
  }, []);

  const fetchActiveSession = useCallback(async (accountId: string) => {
    const { data: player } = await supabase
      .from("players")
      .select("id, game_id, games!inner(status)")
      .eq("account_id", accountId)
      .in("games.status", ["lobby", "active"])
      .order("joined_at", { ascending: false })
      .limit(1)
      .single();

    if (player) {
      return { playerId: player.id, gameId: player.game_id };
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
