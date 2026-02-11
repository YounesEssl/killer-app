"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Link from "next/link";
import {
  Crosshair,
  Zap,
  Eye,
  Target,
  Skull,
  LogIn,
  LogOut,
  UserPlus,
} from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthModal from "@/components/auth/AuthModal";

type AuthMode = "login" | "signup";

export default function Home() {
  const { session, isLoading: sessionLoading } = useSession();
  const { user, fullName, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [authModal, setAuthModal] = useState<AuthMode | null>(null);

  useEffect(() => {
    if (!sessionLoading && session) {
      router.push(`/game/${session.gameId}`);
    }
  }, [session, sessionLoading, router]);

  const isLoading = sessionLoading || authLoading;

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
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
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative bg-white overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.6 }}
        className="text-center relative z-10 max-w-sm w-full space-y-8"
      >
        {/* Auth status bar */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-2.5"
          >
            <span className="text-sm text-slate-500">
              Connecte en tant que{" "}
              <span className="font-semibold text-brand-600">{fullName}</span>
            </span>
            <button
              onClick={signOut}
              className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
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
            <h1 className="text-7xl font-black font-[family-name:var(--font-display)] tracking-tight">
              <span className="text-gradient-green">KILLER</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-slate-400 text-lg"
          >
            Personne n&apos;est a l&apos;abri.
          </motion.p>
        </div>

        {user ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
            className="space-y-3"
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
            className="space-y-3"
          >
            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={<LogIn className="w-5 h-5" />}
              onClick={() => setAuthModal("login")}
            >
              Se connecter
            </Button>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              icon={<UserPlus className="w-5 h-5" />}
              onClick={() => setAuthModal("signup")}
            >
              Creer un compte
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
                className="flex items-center gap-4 text-left"
              >
                <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 font-[family-name:var(--font-display)]">
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-400">{step.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      <AuthModal
        isOpen={authModal !== null}
        onClose={() => setAuthModal(null)}
        initialMode={authModal ?? "login"}
      />
    </div>
  );
}
