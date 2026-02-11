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
    green: "bg-brand-100 text-brand-700",
    red: "bg-rose-50 text-rose-600",
    neutral: "bg-slate-100 text-slate-600",
    live: "bg-brand-100 text-brand-700",
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
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-500" />
        </span>
      )}
      {pulse && variant !== "live" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-400" />
        </span>
      )}
      {children}
    </span>
  );
}
