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
          <label className="block text-sm font-medium text-killer-200 font-[family-name:var(--font-display)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-3 rounded-xl bg-surface-2 border border-border",
            "text-foreground placeholder:text-killer-200/40",
            "focus:outline-none focus:border-killer-500 focus:ring-1 focus:ring-killer-500/30",
            "transition-all duration-200",
            "font-[family-name:var(--font-body)]",
            error && "border-danger-500 focus:border-danger-500 focus:ring-danger-500/30",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-danger-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
