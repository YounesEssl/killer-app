"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

function nameToEmail(firstName: string, lastName: string) {
  const clean = (s: string) =>
    s.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
  return `${clean(firstName)}.${clean(lastName)}@killer.app`;
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
    async (firstName: string, lastName: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({
        email: nameToEmail(firstName, lastName),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
        },
      });
      if (error) {
        if (error.message.includes("already been registered")) {
          throw new Error("Un compte avec ce nom existe déjà");
        }
        throw new Error(error.message);
      }
      return data;
    },
    []
  );

  const signIn = useCallback(async (firstName: string, lastName: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: nameToEmail(firstName, lastName),
      password,
    });
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("Nom ou mot de passe incorrect");
      }
      throw new Error(error.message);
    }
    return data;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const firstName = user?.user_metadata?.first_name as string | undefined;
  const lastName = user?.user_metadata?.last_name as string | undefined;
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : undefined;

  return { user, firstName, lastName, fullName, loading, signUp, signIn, signOut };
}
