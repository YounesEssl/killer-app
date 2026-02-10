"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Crosshair, Zap, Eye, Target, Skull } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { session, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && session) {
      router.push(`/game/${session.gameId}`);
    }
  }, [session, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-killer-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const steps = [
    {
      icon: Target,
      title: "Reçois ta cible",
      desc: "et ta mission secrète",
    },
    {
      icon: Eye,
      title: "Accomplis ta mission",
      desc: "en toute discrétion",
    },
    {
      icon: Skull,
      title: "Élimine et recommence",
      desc: "récupère le code de ta victime",
    },
  ];

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-killer-950/30 via-transparent to-killer-950/20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center relative z-10 max-w-sm w-full space-y-8"
      >
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-7xl font-black font-[family-name:var(--font-display)] tracking-tight">
              <span className="text-gradient-green">KILLER</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-killer-200/60 text-lg"
          >
            Personne n&apos;est à l&apos;abri.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
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
              Créer une partie
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="pt-4 space-y-4"
        >
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.15 }}
                className="flex items-center gap-4 text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-killer-900/50 flex items-center justify-center flex-shrink-0 border border-killer-700/20">
                  <Icon className="w-5 h-5 text-killer-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground font-[family-name:var(--font-display)]">
                    {step.title}
                  </p>
                  <p className="text-xs text-killer-200/40">{step.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}
