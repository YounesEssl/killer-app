"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import CodeInput from "@/components/ui/CodeInput";
import { useSession } from "@/hooks/useSession";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const AVATARS = [
  "🎭", "🔪", "🕵️", "💀", "👻", "🎯", "🐍", "🦊", "🐺", "🎪",
  "🃏", "👁️", "🌙", "⚡", "🔥", "💎", "🎲", "🏴‍☠️", "🦇", "🕷️",
];

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { saveSession } = useSession();
  const [joinCode, setJoinCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [avatar, setAvatar] = useState("🎭");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setJoinCode(code.toUpperCase());
    }
  }, [searchParams]);

  const handleJoin = async () => {
    if (!joinCode || !playerName.trim()) return;
    setIsJoining(true);
    setError("");

    try {
      const res = await fetch("/api/games/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          joinCode: joinCode.toUpperCase(),
          playerName: playerName.trim(),
          avatarEmoji: avatar,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setIsJoining(false);
        return;
      }

      saveSession(data.player.id, data.game.id);
      router.push(`/game/${data.game.id}`);
    } catch {
      setError("Erreur réseau");
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-dvh px-6 py-8 flex flex-col max-w-sm mx-auto">
      <Link
        href="/"
        className="flex items-center gap-2 text-killer-200/60 hover:text-killer-200 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Retour</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">
            Rejoindre
          </h1>
          <p className="text-killer-200/60 mt-1">
            Entre le code de la partie
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-killer-200 font-[family-name:var(--font-display)]">
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
                <span className="text-3xl font-bold font-[family-name:var(--font-mono)] text-killer-400 tracking-widest">
                  {joinCode}
                </span>
              </div>
            )}
          </div>

          <Input
            label="Ton prénom"
            placeholder="Comment tu t'appelles ?"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-killer-200 font-[family-name:var(--font-display)]">
              Ton avatar
            </label>
            <div className="grid grid-cols-10 gap-2">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setAvatar(emoji)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                    avatar === emoji
                      ? "bg-killer-900/50 ring-2 ring-killer-500 scale-110"
                      : "bg-surface-2 hover:bg-surface-3"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-danger-400">{error}</p>}
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={isJoining}
          disabled={joinCode.length < 6 || !playerName.trim()}
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
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-killer-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <JoinForm />
    </Suspense>
  );
}
