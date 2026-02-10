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
    green: "bg-killer-900/50 text-killer-300 border-killer-700/30",
    red: "bg-danger-600/20 text-danger-400 border-danger-600/30",
    neutral: "bg-surface-2 text-killer-200 border-border",
    live: "bg-danger-600/20 text-danger-400 border-danger-600/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border",
        "font-[family-name:var(--font-display)]",
        variants[variant],
        className
      )}
    >
      {variant === "live" && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-danger-500" />
        </span>
      )}
      {pulse && variant !== "live" && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-killer-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-killer-400" />
        </span>
      )}
      {children}
    </span>
  );
}
