"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

function pseudoToEmail(pseudo: string) {
  return `${pseudo.toLowerCase().trim()}@killer.app`;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(
    async (pseudo: string, password: string, firstName: string, lastName: string) => {
      const { data, error } = await supabase.auth.signUp({
        email: pseudoToEmail(pseudo),
        password,
        options: {
          data: {
            pseudo: pseudo.trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
        },
      });
      if (error) {
        if (error.message.includes("already been registered")) {
          throw new Error("Ce pseudo est déjà pris");
        }
        throw new Error(error.message);
      }
      return data;
    },
    []
  );

  const signIn = useCallback(async (pseudo: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: pseudoToEmail(pseudo),
      password,
    });
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("Pseudo ou mot de passe incorrect");
      }
      throw new Error(error.message);
    }
    return data;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const pseudo = user?.user_metadata?.pseudo as string | undefined;
  const firstName = user?.user_metadata?.first_name as string | undefined;
  const lastName = user?.user_metadata?.last_name as string | undefined;
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : undefined;

  return { user, pseudo, firstName, lastName, fullName, loading, signUp, signIn, signOut };
}
