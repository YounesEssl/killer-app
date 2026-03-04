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
    "bg-green-500 hover:bg-green-400 active:bg-green-600 text-white shadow-[0_0_30px_rgba(74,222,128,0.3)] hover:shadow-[0_0_40px_rgba(74,222,128,0.4)]",
  secondary:
    "bg-white/5 border border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-400/50 backdrop-blur-sm",
  danger:
    "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.15)]",
  ghost:
    "text-gray-400 hover:bg-white/5 hover:text-gray-300",
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
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
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
