"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import CodeInput from "@/components/ui/CodeInput";
import Link from "next/link";
import ProfilePhoto from "@/components/ui/ProfilePhoto";
import {
  Crosshair,
  Zap,
  Eye,
  Target,
  Skull,
  LogIn,
  LogOut,
} from "lucide-react";
import { useAccount } from "@/hooks/useAccount";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { account, session, isLoading, isLoggedIn, needsPhoto, login, logout } = useAccount();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (!isLoading && isLoggedIn && needsPhoto) {
      router.push("/profile/photo");
    }
  }, [isLoading, isLoggedIn, needsPhoto, router]);

  useEffect(() => {
    if (!isLoading && session) {
      router.push(`/game/${session.gameId}`);
    }
  }, [session, isLoading, router]);

  const handleLogin = async () => {
    if (!username.trim() || code.length < 4) return;
    setIsLoggingIn(true);
    setLoginError("");

    try {
      await login(username.trim(), code);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Erreur de connexion");
    }
    setIsLoggingIn(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#0a0f0d]">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const steps = [
    {
      icon: Target,
      title: "Recois ta cible",
      desc: "et ta mission secrete",
    },
    {
      icon: Eye,
      title: "Accomplis ta mission",
      desc: "en toute discretion",
    },
    {
      icon: Skull,
      title: "Elimine et recommence",
      desc: "recupere le code de ta victime",
    },
  ];

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative bg-[#0a0f0d] overflow-hidden">
      {/* Background atmosphere */}
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-radial-glow pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.6 }}
        className="text-center relative z-10 max-w-sm w-full space-y-8"
      >
        {/* Auth status bar */}
        {isLoggedIn && account && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-between bg-[#111916]/80 backdrop-blur-md border border-green-500/10 rounded-2xl px-4 py-2.5"
          >
            <div className="flex items-center gap-2">
              <ProfilePhoto src={account.photo_url} alt={account.username} size="sm" />
              <span className="text-sm text-gray-400">
                <span className="font-semibold text-green-400">{account.username}</span>
              </span>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-xl hover:bg-white/5 transition-colors text-gray-500 hover:text-green-400"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
          >
            <h1 className="text-7xl font-black font-[family-name:var(--font-display)] tracking-tighter">
              <span className="text-gradient-green text-glow-green">KILLER</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-green-500/50 text-xs font-medium tracking-[0.3em] uppercase"
          >
            Personne n&apos;est a l&apos;abri.
          </motion.p>
        </div>

        {isLoggedIn ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
            className="flex flex-col gap-3"
          >
            <Link href="/join">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                icon={<Crosshair className="w-5 h-5" />}
              >
                Rejoindre une partie
              </Button>
            </Link>
            <Link href="/create">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                icon={<Zap className="w-5 h-5" />}
              >
                Creer une partie
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
            className="bg-[#111916] rounded-[2rem] border border-green-500/10 shadow-2xl p-7 space-y-5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl pointer-events-none" />

            <Input
              label="Prenom"
              placeholder="Ton nom de code..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-green-500/50 ml-1 font-[family-name:var(--font-display)]">
                Code secret
              </label>
              <CodeInput
                length={4}
                type="numeric"
                onComplete={(c) => setCode(c)}
              />
            </div>
            {loginError && (
              <p className="text-sm text-red-400">{loginError}</p>
            )}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoggingIn}
              disabled={!username.trim() || code.length < 4}
              onClick={handleLogin}
              icon={<LogIn className="w-5 h-5" />}
            >
              Se connecter
            </Button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
          className="pt-4 space-y-4"
        >
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-4 text-left p-4 bg-[#111916]/40 border border-green-500/5 rounded-2xl"
              >
                <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white font-[family-name:var(--font-display)]">
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}
