"use client";

import { useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import CodeInput from "@/components/ui/CodeInput";
import Button from "@/components/ui/Button";
import { ArrowLeft, Check, X } from "lucide-react";
import Link from "next/link";

type KillState = "input" | "loading" | "success" | "error";

export default function KillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: gameId } = use(params);
  const router = useRouter();
  const { session } = useSession();
  const [state, setState] = useState<KillState>("input");
  const [error, setError] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [result, setResult] = useState<{
    newTarget?: { name: string; avatar_emoji: string };
    killCount: number;
    survivorsCount: number;
    isGameOver: boolean;
  } | null>(null);

  const handleSubmit = async (code: string) => {
    if (!session) return;
    setState("loading");
    setCodeError(false);
    setError("");

    try {
      const res = await fetch("/api/kills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: session.playerId, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState("error");
        setError(data.error);
        setCodeError(true);
        setTimeout(() => setState("input"), 2000);
        return;
      }

      setResult({
        newTarget: data.newTarget,
        killCount: data.killCount,
        survivorsCount: data.survivorsCount,
        isGameOver: data.isGameOver,
      });
      setState("success");

      setTimeout(() => {
        router.push(`/game/${gameId}`);
      }, 3500);
    } catch {
      setState("error");
      setError("Erreur réseau");
      setTimeout(() => setState("input"), 2000);
    }
  };

  return (
    <div className="min-h-dvh px-6 py-8 max-w-sm mx-auto relative">
      {/* Kill flash overlay */}
      <AnimatePresence>
        {state === "success" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-danger-600/20 pointer-events-none kill-flash"
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {state === "input" || state === "loading" ? (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <Link
                href={`/game/${gameId}`}
                className="flex items-center gap-2 text-killer-200/60 hover:text-killer-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Annuler</span>
              </Link>
            </div>

            <div className="text-center space-y-2 pt-8">
              <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
                Entre le code de ta victime
              </h1>
              <p className="text-killer-200/60 text-sm">
                Demande son code à 4 chiffres
              </p>
            </div>

            <div className="py-8">
              <CodeInput
                length={4}
                type="numeric"
                onComplete={handleSubmit}
                error={codeError}
                disabled={state === "loading"}
              />
            </div>

            {state === "loading" && (
              <div className="flex justify-center">
                <div className="w-6 h-6 border-2 border-killer-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {error && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-danger-400 text-sm"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        ) : state === "success" && result ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="flex flex-col items-center justify-center min-h-[80vh] space-y-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 rounded-full bg-danger-600/20 flex items-center justify-center"
            >
              <span className="text-4xl">☠️</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-black text-danger-500 font-[family-name:var(--font-display)]"
            >
              KILL CONFIRMÉ
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-killer-200/60"
            >
              {result.killCount} kill{result.killCount > 1 ? "s" : ""} au total
              {" • "}
              {result.survivorsCount} survivant{result.survivorsCount > 1 ? "s" : ""}
            </motion.p>

            {result.isGameOver ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center space-y-2"
              >
                <p className="text-4xl">👑</p>
                <p className="text-xl font-bold text-killer-400 font-[family-name:var(--font-display)]">
                  Tu as gagné !
                </p>
              </motion.div>
            ) : result.newTarget ? (
              <motion.div
                initial={{ opacity: 0, y: 20, rotateY: 90 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="glass glow-green rounded-2xl p-5 w-full text-center space-y-2"
              >
                <p className="text-xs uppercase tracking-widest text-killer-500 font-[family-name:var(--font-display)]">
                  Nouvelle cible
                </p>
                <p className="text-3xl">{result.newTarget.avatar_emoji}</p>
                <p className="text-xl font-bold font-[family-name:var(--font-display)]">
                  {result.newTarget.name}
                </p>
              </motion.div>
            ) : null}
          </motion.div>
        ) : (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[80vh] space-y-4"
          >
            <motion.div
              animate={{ x: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.4 }}
              className="w-16 h-16 rounded-full bg-danger-600/20 flex items-center justify-center"
            >
              <X className="w-8 h-8 text-danger-400" />
            </motion.div>
            <p className="text-lg font-bold text-danger-400 font-[family-name:var(--font-display)]">
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
