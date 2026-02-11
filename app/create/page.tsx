"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { ArrowLeft, Copy, Share2, Zap } from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import ConnectedAs from "@/components/ui/ConnectedAs";
import AuthGuard from "@/components/auth/AuthGuard";

function CreatePageContent() {
  const [name, setName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [createdGame, setCreatedGame] = useState<{
    id: string;
    join_code: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !adminPassword.trim()) return;
    setIsCreating(true);
    setError("");

    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          adminPassword: adminPassword.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setIsCreating(false);
        return;
      }

      setCreatedGame({ id: data.id, join_code: data.join_code });
      setIsCreating(false);
    } catch {
      setError("Erreur reseau");
      setIsCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!createdGame) return;
    await navigator.clipboard.writeText(createdGame.join_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!createdGame) return;
    const url = `${window.location.origin}/join?code=${createdGame.join_code}`;
    const text = `Rejoins la partie "${name}" !\nCode: ${createdGame.join_code}\n${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ text, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const joinUrl = createdGame
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/join?code=${createdGame.join_code}`
    : "";

  if (createdGame) {
    return (
      <div className="min-h-dvh px-6 py-8 flex flex-col items-center justify-center max-w-sm mx-auto bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
          className="w-full space-y-6 text-center"
        >
          <div className="space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
              className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto"
            >
              <Zap className="w-8 h-8 text-brand-600" />
            </motion.div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
              Partie creee !
            </h1>
            <p className="text-slate-500 text-sm">
              Partage ce code avec les joueurs
            </p>
          </div>

          <Card glow className="py-8">
            <p className="text-5xl font-black font-[family-name:var(--font-mono)] text-brand-600 tracking-[0.3em]">
              {createdGame.join_code}
            </p>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={handleCopy}
              icon={<Copy className="w-4 h-4" />}
            >
              {copied ? "Copie !" : "Copier"}
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={handleShare}
              icon={<Share2 className="w-4 h-4" />}
            >
              Partager
            </Button>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
              <QRCodeSVG value={joinUrl} size={160} />
            </div>
            <p className="text-xs text-slate-400">
              Scanne pour rejoindre
            </p>
          </div>

          <Link href={`/join?code=${createdGame.join_code}`}>
            <Button variant="primary" size="lg" fullWidth>
              Rejoindre le lobby
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh px-6 py-8 flex flex-col max-w-sm mx-auto bg-white">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Retour</span>
        </Link>
        <ConnectedAs />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] text-slate-900">
            Creer une partie
          </h1>
          <p className="text-slate-500 mt-1">
            Configure ta partie de Killer
          </p>
        </div>

        <div className="space-y-4">
          <Input
            label="Nom de la partie"
            placeholder="Week-end anniversaire"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Mot de passe admin"
            type="password"
            placeholder="Pour acceder au panel admin"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
          />
          {error && <p className="text-sm text-rose-500">{error}</p>}
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={isCreating}
          disabled={!name.trim() || !adminPassword.trim()}
          onClick={handleCreate}
        >
          Creer la partie
        </Button>
      </motion.div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <AuthGuard>
      <CreatePageContent />
    </AuthGuard>
  );
}
