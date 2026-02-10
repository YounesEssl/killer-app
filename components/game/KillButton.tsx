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
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Link href={`/game/${gameId}/kill`}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-full py-4 px-6 rounded-2xl bg-danger-600 hover:bg-danger-500 text-white font-bold text-lg
                     flex items-center justify-center gap-3 glow-red transition-all duration-200
                     font-[family-name:var(--font-display)] cursor-pointer active:scale-95"
        >
          <Skull className="w-6 h-6" />
          J&apos;AI TUÉ MA CIBLE
        </motion.button>
      </Link>
    </motion.div>
  );
}
