"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

interface CounterProps {
  value: number;
  className?: string;
}

export default function Counter({ value, className }: CounterProps) {
  const spring = useSpring(value, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (v) => Math.round(v));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.span className={className}>
      {display}
    </motion.span>
  );
}
