"use client";

import { motion } from "framer-motion";
import { Skull } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface KillFeedItemProps {
  survivorsCount: number;
  killedAt: string;
  index: number;
}

export default function KillFeedItem({
  survivorsCount,
  killedAt,
  index,
}: KillFeedItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4, delay: index * 0.05 }}
      className="flex items-center gap-4 p-4 bg-[#111916] rounded-2xl border border-green-500/10"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
        <Skull className="w-5 h-5 text-red-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium">
          Un joueur a ete elimine
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {survivorsCount} survivant{survivorsCount > 1 ? "s" : ""} restant
          {survivorsCount > 1 ? "s" : ""}
        </p>
      </div>
      <span className="text-xs text-gray-500 flex-shrink-0">
        {formatRelativeTime(killedAt)}
      </span>
    </motion.div>
  );
}
