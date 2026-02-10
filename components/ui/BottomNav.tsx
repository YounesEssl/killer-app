"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Crosshair, Skull, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  gameId: string;
}

export default function BottomNav({ gameId }: BottomNavProps) {
  const pathname = usePathname();

  const tabs = [
    {
      label: "Mission",
      icon: Crosshair,
      href: `/game/${gameId}`,
      active: pathname === `/game/${gameId}`,
    },
    {
      label: "Feed",
      icon: Skull,
      href: `/game/${gameId}/feed`,
      active: pathname === `/game/${gameId}/feed`,
    },
    {
      label: "Classement",
      icon: Trophy,
      href: `/game/${gameId}/leaderboard`,
      active: pathname === `/game/${gameId}/leaderboard`,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[72px]",
                tab.active
                  ? "text-killer-400"
                  : "text-killer-200/50 hover:text-killer-200/80"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-all duration-200",
                  tab.active && "drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                )}
              />
              <span className="text-xs font-medium font-[family-name:var(--font-display)]">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
