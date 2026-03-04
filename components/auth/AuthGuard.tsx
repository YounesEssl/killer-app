"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@/hooks/useAccount";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { account, isLoading, needsPhoto } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !account) {
      router.replace("/");
    }
    if (!isLoading && account && needsPhoto) {
      router.replace("/profile/photo");
    }
  }, [account, isLoading, needsPhoto, router]);

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#0a0f0d]">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!account || needsPhoto) return null;

  return <>{children}</>;
}
