"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

const paddingStyles = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export default function Card({
  children,
  className,
  glow = false,
  hover = false,
  padding = "md",
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
      whileHover={hover ? { y: -2 } : undefined}
      className={cn(
        "bg-[#111916] rounded-3xl border border-green-500/10 shadow-lg",
        paddingStyles[padding],
        glow && "border-green-500/30 shadow-[0_0_30px_rgba(74,222,128,0.1)]",
        hover && "hover:shadow-xl transition-all",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
