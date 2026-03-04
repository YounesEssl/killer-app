"use client";

import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface ProfilePhotoProps {
  src: string | null;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeStyles = {
  xs: { container: "w-5 h-5", icon: "w-3 h-3" },
  sm: { container: "w-8 h-8", icon: "w-4 h-4" },
  md: { container: "w-10 h-10", icon: "w-5 h-5" },
  lg: { container: "w-14 h-14", icon: "w-7 h-7" },
  xl: { container: "w-20 h-20", icon: "w-10 h-10" },
};

export default function ProfilePhoto({ src, alt, size = "md", className }: ProfilePhotoProps) {
  const s = sizeStyles[size];

  if (!src) {
    return (
      <div className={cn(s.container, "rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0", className)}>
        <User className={cn(s.icon, "text-green-400/60")} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn(s.container, "rounded-full object-cover flex-shrink-0 border border-green-500/20", className)}
    />
  );
}
