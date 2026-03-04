"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-xs font-bold uppercase tracking-widest text-green-500/50 ml-1 font-[family-name:var(--font-display)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-3.5 rounded-2xl border border-white/10 bg-white/5",
            "text-white placeholder:text-gray-500",
            "focus:outline-none focus:border-green-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(74,222,128,0.1)]",
            "transition-all backdrop-blur-sm",
            "font-[family-name:var(--font-body)]",
            error && "border-red-500/30 focus:border-red-500/50",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-400 ml-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
