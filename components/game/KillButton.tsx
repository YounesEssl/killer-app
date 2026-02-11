"use client";

import { motion } from "framer-motion";
import { Skull } from "lucide-react";
import Link from "next/link";

interface KillButtonProps {
  gameId: string;
}

export default function KillButton({ gameId }: KillButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.5, delay: 0.3 }}
    >
      <Link href={`/game/${gameId}/kill`}>
        <motion.button
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="w-full py-4 px-6 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 font-bold text-lg
                     flex items-center justify-center gap-3 transition-all
                     font-[family-name:var(--font-display)] cursor-pointer"
        >
          <Skull className="w-6 h-6" />
          J&apos;AI TUE MA CIBLE
        </motion.button>
      </Link>
    </motion.div>
  );
}
