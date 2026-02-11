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
          <label className="block text-sm font-semibold text-slate-700 ml-1 font-[family-name:var(--font-display)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50",
            "text-slate-900 placeholder:text-slate-400",
            "focus:outline-none focus:border-brand-500 focus:bg-white",
            "transition-all",
            "font-[family-name:var(--font-body)]",
            error && "border-rose-300 focus:border-rose-500",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-rose-500 ml-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
