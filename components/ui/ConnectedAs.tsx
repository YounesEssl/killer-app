"use client";

import { useAccount } from "@/hooks/useAccount";
import ProfilePhoto from "@/components/ui/ProfilePhoto";

export default function ConnectedAs() {
  const { account, isLoading } = useAccount();

  if (isLoading || !account) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500">
      <ProfilePhoto src={account.photo_url} alt={account.username} size="xs" />
      <span>
        Connecte en tant que{" "}
        <span className="font-semibold text-green-400/70">{account.username}</span>
      </span>
    </div>
  );
}
