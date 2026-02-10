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
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-center gap-4 p-4 glass rounded-xl"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-danger-600/20 flex items-center justify-center">
        <Skull className="w-5 h-5 text-danger-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground font-medium">
          Un joueur a été éliminé
        </p>
        <p className="text-xs text-killer-200/50 mt-0.5">
          {survivorsCount} survivant{survivorsCount > 1 ? "s" : ""} restant
          {survivorsCount > 1 ? "s" : ""}
        </p>
      </div>
      <span className="text-xs text-killer-200/40 flex-shrink-0">
        {formatRelativeTime(killedAt)}
      </span>
    </motion.div>
  );
}
