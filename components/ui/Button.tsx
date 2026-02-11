"use client";

import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white shadow-brand",
  secondary:
    "bg-white border-2 border-brand-500 text-brand-600 hover:bg-brand-50",
  danger:
    "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100",
  ghost:
    "text-slate-500 hover:bg-slate-50",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2.5 text-sm rounded-xl gap-1.5",
  md: "px-6 py-3 text-base rounded-2xl gap-2",
  lg: "px-8 py-3.5 text-lg rounded-2xl gap-2.5",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "inline-flex items-center justify-center font-bold transition-all cursor-pointer",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "font-[family-name:var(--font-display)]",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children as React.ReactNode}
    </motion.button>
  );
}
