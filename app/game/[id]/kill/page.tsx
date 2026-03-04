"use client";

import { useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAccount } from "@/hooks/useAccount";
import CodeInput from "@/components/ui/CodeInput";
import Button from "@/components/ui/Button";
import { ArrowLeft, Check, X, Skull, Trophy, Zap } from "lucide-react";
import Link from "next/link";
import ConnectedAs from "@/components/ui/ConnectedAs";
import AuthGuard from "@/components/auth/AuthGuard";
import ProfilePhoto from "@/components/ui/ProfilePhoto";

type KillState = "input" | "loading" | "success" | "error";

export default function KillPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AuthGuard>
      <KillPageContent params={params} />
    </AuthGuard>
  );
}

function KillPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id: gameId } = use(params);
  const router = useRouter();
  const { session } = useAccount();
  const [state, setState] = useState<KillState>("input");
  const [error, setError] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [result, setResult] = useState<{
    newTarget?: { name: string; photo_url: string | null };
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
      setError("Erreur reseau");
      setTimeout(() => setState("input"), 2000);
    }
  };

  return (
    <div className="min-h-dvh px-6 py-8 max-w-sm mx-auto relative bg-[#0a0f0d] overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-radial-glow pointer-events-none" />

      {/* Kill flash overlay */}
      <AnimatePresence>
        {state === "success" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.4, times: [0, 0.2, 1] }}
            className="fixed inset-0 z-50 bg-red-500/20 pointer-events-none mix-blend-overlay"
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {state === "input" || state === "loading" ? (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8 relative z-10"
          >
            <div className="flex items-center justify-between">
              <Link
                href={`/game/${gameId}`}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Annuler</span>
              </Link>
              <ConnectedAs />
            </div>

            <div className="text-center space-y-2 pt-8">
              <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-white">
                Entre le code de{" "}
                <span className="text-green-400 text-glow-green">ta victime</span>
              </h1>
              <p className="text-gray-500 text-sm">
                Demande son code a 4 chiffres
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
              <div className="flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-500 uppercase tracking-widest animate-pulse font-mono">
                  Validation en cours...
                </p>
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 justify-center"
              >
                <X className="w-4 h-4" />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}
          </motion.div>
        ) : state === "success" && result ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex flex-col items-center justify-center min-h-[80vh] space-y-6 relative z-10"
          >
            {/* Celebration icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 20 }}
              className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_50px_rgba(74,222,128,0.5)]"
            >
              <Check className="w-12 h-12 text-[#0a0f0d]" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl font-black text-green-400 font-[family-name:var(--font-display)] text-glow-green"
            >
              KILL CONFIRME
            </motion.h1>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-4 w-full"
            >
              <div className="bg-[#111916] border border-white/5 p-4 rounded-2xl flex flex-col items-center">
                <Skull className="text-gray-500 mb-1 w-5 h-5" />
                <span className="text-2xl font-bold text-white">{result.killCount}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Kills totaux</span>
              </div>
              <div className="bg-[#111916] border border-white/5 p-4 rounded-2xl flex flex-col items-center">
                <span className="text-gray-500 mb-1 text-lg">👥</span>
                <span className="text-2xl font-bold text-white">{result.survivorsCount}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Survivants</span>
              </div>
            </motion.div>

            {result.isGameOver ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="bg-[#111916] border border-yellow-500/40 p-8 rounded-3xl shadow-[0_0_40px_rgba(234,179,8,0.15)] text-center space-y-4 w-full"
              >
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-yellow-500 font-[family-name:var(--font-display)]">
                  Tu as gagne !
                </p>
              </motion.div>
            ) : result.newTarget ? (
              <motion.div
                initial={{ opacity: 0, y: 20, rotateY: 90 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ delay: 0.8, ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
                className="bg-[#111916] rounded-3xl border border-green-400/40 shadow-[0_0_40px_rgba(74,222,128,0.15)] p-6 w-full text-center space-y-3 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4">
                  <Zap className="text-green-400/20 animate-pulse w-10 h-10" />
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-green-400 font-[family-name:var(--font-display)] font-bold">
                  Nouvelle cible
                </p>
                <div className="mx-auto w-fit">
                  <ProfilePhoto src={result.newTarget.photo_url} alt={result.newTarget.name} size="lg" className="border-2 border-green-400/50 shadow-[0_0_20px_rgba(74,222,128,0.3)]" />
                </div>
                <p className="text-xl font-bold font-[family-name:var(--font-display)] text-white">
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
            transition={{ ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center min-h-[80vh] space-y-4 relative z-10"
          >
            <motion.div
              animate={{ x: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.4 }}
              className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)]"
            >
              <X className="w-8 h-8 text-red-400" />
            </motion.div>
            <p className="text-lg font-bold text-red-400 font-[family-name:var(--font-display)]">
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
