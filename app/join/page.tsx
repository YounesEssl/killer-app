"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import CodeInput from "@/components/ui/CodeInput";
import { useSession } from "@/hooks/useSession";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ConnectedAs from "@/components/ui/ConnectedAs";
import AuthGuard from "@/components/auth/AuthGuard";
import { AVATARS } from "@/lib/avatars";

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSession } = useSession();
  const [joinCode, setJoinCode] = useState("");
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setJoinCode(code.toUpperCase());
    }
  }, [searchParams]);

  const handleJoin = async () => {
    if (!joinCode) return;
    setIsJoining(true);
    setError("");

    try {
      const res = await fetch("/api/games/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          joinCode: joinCode.toUpperCase(),
          avatarEmoji: AVATARS[avatarIndex].id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setIsJoining(false);
        return;
      }

      await refreshSession();
      router.push(`/game/${data.game.id}`);
    } catch {
      setError("Erreur reseau");
      setIsJoining(false);
    }
  };

  const selected = AVATARS[avatarIndex];
  const SelectedIcon = selected.icon;

  return (
    <div className="min-h-dvh px-6 py-8 flex flex-col max-w-sm mx-auto bg-white">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors"
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
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] text-slate-900">
            Rejoindre
          </h1>
          <p className="text-slate-500 mt-1">
            Entre le code de la partie
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 ml-1 font-[family-name:var(--font-display)]">
              Code de la partie
            </label>
            {!searchParams.get("code") ? (
              <CodeInput
                length={6}
                type="alpha"
                onComplete={(code) => setJoinCode(code)}
              />
            ) : (
              <div className="text-center">
                <span className="text-3xl font-bold font-[family-name:var(--font-mono)] text-brand-600 tracking-widest">
                  {joinCode}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 ml-1 font-[family-name:var(--font-display)]">
              Ton avatar
            </label>

            {/* Selected avatar preview */}
            <motion.div
              key={avatarIndex}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex flex-col items-center gap-2 py-3"
            >
              <div className={cn("w-20 h-20 rounded-full flex items-center justify-center", selected.bg)}>
                <SelectedIcon className={cn("w-10 h-10", selected.text)} />
              </div>
              <span className="text-sm font-medium text-slate-500">{selected.label}</span>
            </motion.div>

            {/* Avatar grid */}
            <div className="grid grid-cols-8 gap-2">
              {AVATARS.map((avatar, i) => {
                const Icon = avatar.icon;
                const isSelected = avatarIndex === i;
                return (
                  <motion.button
                    key={avatar.id}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setAvatarIndex(i)}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      isSelected
                        ? `${avatar.bg} ring-2 ring-brand-500 ring-offset-2`
                        : "bg-slate-50 hover:bg-slate-100"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isSelected ? avatar.text : "text-slate-400")} />
                  </motion.button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm text-rose-500">{error}</p>}
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
  );
}

export default function JoinPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="min-h-dvh flex items-center justify-center bg-white">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <JoinForm />
      </Suspense>
    </AuthGuard>
  );
}
