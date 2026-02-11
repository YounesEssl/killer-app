"use client";

import { motion } from "framer-motion";
import Badge from "@/components/ui/Badge";
import Counter from "@/components/ui/Counter";

interface SurvivorCountProps {
  alive: number;
  total: number;
}

export default function SurvivorCount({ alive, total }: SurvivorCountProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
      className="flex items-center gap-3"
    >
      <Badge variant="live">EN JEU</Badge>
      <span className="text-sm text-slate-700 font-[family-name:var(--font-display)]">
        <Counter value={alive} className="text-brand-600 font-bold" />
        <span className="text-slate-400">/{total}</span>
        <span className="ml-1">survivants</span>
      </span>
    </motion.div>
  );
}
