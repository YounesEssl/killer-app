"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import CodeInput from "@/components/ui/CodeInput";
import { useAccount } from "@/hooks/useAccount";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ConnectedAs from "@/components/ui/ConnectedAs";
import AuthGuard from "@/components/auth/AuthGuard";

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { account, refreshAccount } = useAccount();
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setJoinCode(code.toUpperCase());
    }
  }, [searchParams]);

  const handleJoin = async () => {
    if (!joinCode || !account) return;
    setIsJoining(true);
    setError("");

    try {
      const res = await fetch("/api/games/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          joinCode: joinCode.toUpperCase(),
          accountId: account.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setIsJoining(false);
        return;
      }

      await refreshAccount();
      router.push(`/game/${data.game.id}`);
    } catch {
      setError("Erreur reseau");
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-dvh px-6 py-8 flex flex-col max-w-sm mx-auto bg-[#0a0f0d] relative">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Retour</span>
          </Link>
          <ConnectedAs />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] text-white">
              Rejoindre
            </h1>
            <p className="text-gray-500 mt-1">
              Entre le code de la partie
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-green-500/50 ml-1 font-[family-name:var(--font-display)]">
                Code de la partie
              </label>
              {!searchParams.get("code") ? (
                <CodeInput
                  length={6}
                  type="alpha"
                  onComplete={(code) => setJoinCode(code)}
                />
              ) : (
                <div className="text-center py-4">
                  <span className="text-4xl font-bold font-[family-name:var(--font-mono)] text-green-400 tracking-[0.2em] text-glow-green">
                    {joinCode}
                  </span>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isJoining}
            disabled={joinCode.length < 6}
            onClick={handleJoin}
          >
            Entrer dans la partie
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="min-h-dvh flex items-center justify-center bg-[#0a0f0d]">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <JoinForm />
      </Suspense>
    </AuthGuard>
  );
}
