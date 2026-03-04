"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CodeInputProps {
  length: number;
  onComplete: (code: string) => void;
  error?: boolean;
  disabled?: boolean;
  type?: "numeric" | "alpha";
}

export default function CodeInput({
  length,
  onComplete,
  error = false,
  disabled = false,
  type = "numeric",
}: CodeInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = useCallback(
    (index: number, value: string) => {
      const char = type === "alpha"
        ? value.toUpperCase().replace(/[^A-Z0-9]/g, "")
        : value.replace(/[^0-9]/g, "");

      if (!char) return;

      const newValues = [...values];
      newValues[index] = char.slice(-1);
      setValues(newValues);

      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      if (newValues.every((v) => v !== "")) {
        onComplete(newValues.join(""));
      }
    },
    [values, length, onComplete, type]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        const newValues = [...values];
        if (values[index]) {
          newValues[index] = "";
          setValues(newValues);
        } else if (index > 0) {
          newValues[index - 1] = "";
          setValues(newValues);
          inputRefs.current[index - 1]?.focus();
        }
      }
    },
    [values]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = type === "alpha"
        ? e.clipboardData.getData("text").toUpperCase().replace(/[^A-Z0-9]/g, "")
        : e.clipboardData.getData("text").replace(/[^0-9]/g, "");
      const chars = pasted.slice(0, length).split("");
      const newValues = [...values];
      chars.forEach((char, i) => {
        newValues[i] = char;
      });
      setValues(newValues);
      if (chars.length === length) {
        onComplete(newValues.join(""));
      } else {
        inputRefs.current[chars.length]?.focus();
      }
    },
    [values, length, onComplete, type]
  );

  return (
    <motion.div
      className="flex gap-3 justify-center"
      animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type={type === "numeric" ? "tel" : "text"}
          inputMode={type === "numeric" ? "numeric" : "text"}
          maxLength={1}
          value={values[index]}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          autoFocus={index === 0}
          className={cn(
            "w-14 h-16 text-center text-2xl font-bold rounded-2xl",
            "bg-white/5 border-2 transition-all backdrop-blur-sm",
            "font-[family-name:var(--font-mono)]",
            "focus:outline-none",
            "disabled:opacity-50",
            error
              ? "border-red-500/40 text-red-400"
              : values[index]
              ? "border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.15)]"
              : "border-white/10 text-white focus:border-green-500/50 focus:bg-white/10"
          )}
        />
      ))}
    </motion.div>
  );
}
