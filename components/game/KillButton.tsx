"use client";

import { motion } from "framer-motion";
import { Skull, ChevronRight } from "lucide-react";
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
          className="w-full py-5 px-6 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-lg
                     flex items-center justify-between transition-all
                     font-[family-name:var(--font-display)] cursor-pointer
                     shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:shadow-[0_0_30px_rgba(239,68,68,0.25)]
                     group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-red-500/5 translate-x-[-100%] group-hover:translate-x-[0%] transition-transform duration-500 ease-out" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 bg-red-500/20 rounded-xl">
              <Skull className="w-6 h-6" />
            </div>
            J&apos;AI TUE MA CIBLE
          </div>
          <ChevronRight className="w-5 h-5 text-red-500/50 group-hover:translate-x-1 transition-transform relative z-10" />
        </motion.button>
      </Link>
    </motion.div>
  );
}
