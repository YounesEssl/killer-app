"use client";

import { useAuth } from "@/hooks/useAuth";
import { User } from "lucide-react";

export default function ConnectedAs() {
  const { fullName, loading } = useAuth();

  if (loading || !fullName) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-400">
      <User className="w-3 h-3" />
      <span>
        Connecte en tant que{" "}
        <span className="font-semibold text-slate-500">{fullName}</span>
      </span>
    </div>
  );
}
