"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "red" | "neutral" | "live";
  className?: string;
  pulse?: boolean;
}

export default function Badge({
  children,
  variant = "green",
  className,
  pulse = false,
}: BadgeProps) {
  const variants = {
    green: "bg-green-500/15 text-green-400 border border-green-500/20",
    red: "bg-red-500/15 text-red-400 border border-red-500/20",
    neutral: "bg-white/5 text-gray-400 border border-white/10",
    live: "bg-green-500/15 text-green-400 border border-green-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-widest",
        "font-[family-name:var(--font-display)]",
        variants[variant],
        className
      )}
    >
      {variant === "live" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
        </span>
      )}
      {pulse && variant !== "live" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
        </span>
      )}
      {children}
    </span>
  );
}
