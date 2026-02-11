"use client";

import { getAvatarById } from "@/lib/avatars";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface PlayerAvatarProps {
  avatarId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: { container: "w-8 h-8", icon: "w-4 h-4" },
  md: { container: "w-10 h-10", icon: "w-5 h-5" },
  lg: { container: "w-14 h-14", icon: "w-7 h-7" },
};

export default function PlayerAvatar({ avatarId, size = "md", className }: PlayerAvatarProps) {
  const avatar = getAvatarById(avatarId);
  const s = sizeStyles[size];

  if (!avatar) {
    return (
      <div className={cn(s.container, "rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0", className)}>
        <User className={cn(s.icon, "text-slate-400")} />
      </div>
    );
  }

  const Icon = avatar.icon;

  return (
    <div className={cn(s.container, "rounded-full flex items-center justify-center flex-shrink-0", avatar.bg, className)}>
      <Icon className={cn(s.icon, avatar.text)} />
    </div>
  );
}
