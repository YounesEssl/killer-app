"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAccount } from "@/hooks/useAccount";
import PhotoCapture from "@/components/ui/PhotoCapture";
import { Camera } from "lucide-react";

export default function PhotoPage() {
  const { account, isLoading, refreshAccount } = useAccount();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#0a0f0d]">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!account) {
    router.replace("/");
    return null;
  }

  const handleCapture = async (base64: string) => {
    setIsUploading(true);
    setError("");

    try {
      const res = await fetch(`/api/accounts/${account.id}/photo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo: base64 }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setIsUploading(false);
        return;
      }

      await refreshAccount();
      router.push("/");
    } catch {
      setError("Erreur reseau");
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-dvh px-6 py-8 flex flex-col items-center justify-center max-w-sm mx-auto bg-[#0a0f0d] relative">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
          className="w-full space-y-8 text-center"
        >
          <div className="space-y-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
              className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto"
            >
              <Camera className="w-8 h-8 text-green-400" />
            </motion.div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-white">
              Photo de profil
            </h1>
            <p className="text-gray-500 text-sm">
              Ajoute une photo pour que les autres joueurs te reconnaissent
            </p>
          </div>

          {isUploading ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Upload en cours...</p>
            </div>
          ) : (
            <PhotoCapture onCapture={handleCapture} />
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
        </motion.div>
      </div>
    </div>
  );
}
