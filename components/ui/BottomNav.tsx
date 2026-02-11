"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Target, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  gameId: string;
}

export default function BottomNav({ gameId }: BottomNavProps) {
  const pathname = usePathname();

  const tabs = [
    {
      label: "Mission",
      icon: Target,
      href: `/game/${gameId}`,
      active: pathname === `/game/${gameId}`,
    },
    {
      label: "Feed",
      icon: Activity,
      href: `/game/${gameId}/feed`,
      active: pathname === `/game/${gameId}/feed`,
    },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-xs z-50 bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-3xl p-2 flex justify-around items-center">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 px-5 py-3 rounded-2xl transition-all font-[family-name:var(--font-display)] font-bold text-sm",
              tab.active
                ? "bg-brand-500 text-white shadow-brand"
                : "text-slate-400 hover:bg-slate-50"
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
