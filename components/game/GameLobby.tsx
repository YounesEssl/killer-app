"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase/client";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { batchGetByIds } from "@/lib/firebase/helpers";
import type { Game, Player, Account } from "@/lib/firebase/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import BottomSheet from "@/components/ui/BottomSheet";
import { Copy, Share2, Users, Play, QrCode, Check } from "lucide-react";
import ProfilePhoto from "@/components/ui/ProfilePhoto";
import { QRCodeSVG } from "qrcode.react";
import ConnectedAs from "@/components/ui/ConnectedAs";

interface GameLobbyProps {
  game: Game;
  players: Player[];
}

type PlayerWithPhoto = Player & { photo_url?: string | null };

export default function GameLobby({ game, players: initialPlayers }: GameLobbyProps) {
  const [players, setPlayers] = useState<PlayerWithPhoto[]>(initialPlayers);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch photos for a list of players
  const enrichWithPhotos = async (playerList: Player[]): Promise<PlayerWithPhoto[]> => {
    const accountIds = playerList.filter((p) => p.account_id).map((p) => p.account_id!);
    if (accountIds.length === 0) return playerList.map((p) => ({ ...p, photo_url: null }));

    const accounts = await batchGetByIds<Account>(db, "accounts", accountIds);
    return playerList.map((p) => ({
      ...p,
      photo_url: p.account_id ? accounts.get(p.account_id)?.photo_url ?? null : null,
    }));
  };

  useEffect(() => {
    const q = query(
      collection(db, "players"),
      where("game_id", "==", game.id)
    );

    const unsubscribe = onSnapshot(q, async (snap) => {
      const playerList = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Player)
        .sort((a, b) => (a.joined_at ?? "").localeCompare(b.joined_at ?? ""));
      const withPhotos = await enrichWithPhotos(playerList);
      setPlayers(withPhotos);
    });

    return () => unsubscribe();
  }, [game.id]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(game.join_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/join?code=${game.join_code}`;
    const text = `Rejoins la partie "${game.name}" !\nCode: ${game.join_code}\n${url}`;

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

  const handleStart = async () => {
    if (!adminPassword) return;
    setIsStarting(true);
    setAdminError("");

    try {
      const res = await fetch(`/api/games/${game.id}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAdminError(data.error);
        setIsStarting(false);
        return;
      }
    } catch {
      setAdminError("Erreur reseau");
      setIsStarting(false);
    }
  };

  const joinUrl = typeof window !== "undefined"
    ? `${window.location.origin}/join?code=${game.join_code}`
    : "";

  return (
    <div className="min-h-dvh pb-safe bg-[#0a0f0d] relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-50" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-[#0a0f0d]/50 to-[#0a0f0d] pointer-events-none" />

      <div className="relative z-10 px-5 py-8 max-w-lg mx-auto space-y-6">
        <div className="flex justify-center">
          <ConnectedAs />
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
          className="text-center space-y-2"
        >
          <p className="text-green-400 text-xs font-black tracking-[0.3em] uppercase font-[family-name:var(--font-display)]">
            Salle d&apos;attente
          </p>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] text-white text-glow-green">
            {game.name}
          </h1>

          {/* Join code */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={handleCopy}
            className="relative group cursor-pointer mt-4"
          >
            <div className="bg-[#111916] border border-green-500/20 rounded-3xl py-6 px-4 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3">
                {copied ? (
                  <div className="flex items-center gap-1 text-green-400 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-lg">
                    <Check size={12} /> Copie !
                  </div>
                ) : (
                  <Copy size={16} className="text-white/20" />
                )}
              </div>
              <p className="text-xs text-white/40 font-medium tracking-widest uppercase mb-1">Code d&apos;acces</p>
              <div className="text-5xl font-black tracking-[0.2em] text-white font-[family-name:var(--font-mono)] flex justify-center">
                {game.join_code.split("").map((char, i) => (
                  <span key={i} className="inline-block hover:text-green-400 transition-colors">
                    {char}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Action row */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleShare}
            icon={<Share2 className="w-4 h-4" />}
            fullWidth
          >
            Partager
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowQR(true)}
            icon={<QrCode className="w-4 h-4" />}
            fullWidth
          >
            QR Code
          </Button>
        </div>

        {/* Player list */}
        <div className="bg-[#111916] rounded-[2rem] border border-green-500/10 shadow-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="w-4 h-4 text-green-400" />
              </div>
              <span className="font-bold font-[family-name:var(--font-display)] text-white">
                {players.length} joueur{players.length > 1 ? "s" : ""} inscrit{players.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="text-[10px] font-bold text-white/30 bg-white/5 px-2 py-1 rounded-md uppercase tracking-wider">
              Min. 4
            </div>
          </div>

          <div className="p-4 grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
            <AnimatePresence>
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-green-500/20 transition-colors"
                >
                  <ProfilePhoto src={player.photo_url ?? null} alt={player.name} size="sm" />
                  <span className="text-sm font-medium text-white/80 truncate">{player.name}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {players.length === 0 && (
              <div className="col-span-2 py-8 text-center text-white/20 italic text-sm">
                En attente de joueurs...
              </div>
            )}
          </div>
        </div>

        {/* Launch button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => setShowAdmin(true)}
          icon={<Play className="w-5 h-5" />}
          disabled={players.length < 4}
        >
          Lancer la partie
        </Button>

        {/* Admin bottom sheet */}
        <BottomSheet
          isOpen={showAdmin}
          onClose={() => { setShowAdmin(false); setAdminError(""); }}
          title="Lancer la partie"
        >
          <div className="space-y-4">
            <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-2xl text-sm text-green-400 leading-relaxed">
              {players.length} joueur{players.length > 1 ? "s" : ""} inscrit
              {players.length > 1 ? "s" : ""}
              {players.length < 4 && (
                <span className="text-red-400 ml-1">
                  (minimum 4 joueurs)
                </span>
              )}
            </div>
            <Input
              label="Mot de passe admin"
              type="password"
              placeholder="Ton mot de passe admin"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              error={adminError}
            />
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={isStarting}
              disabled={players.length < 4 || !adminPassword}
              onClick={handleStart}
            >
              Confirmer le lancement
            </Button>
          </div>
        </BottomSheet>

        {/* QR bottom sheet */}
        <BottomSheet
          isOpen={showQR}
          onClose={() => setShowQR(false)}
          title="QR Code"
        >
          <div className="flex flex-col items-center gap-6 pb-4">
            <div className="bg-white p-5 rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.1)]">
              <QRCodeSVG value={joinUrl} size={200} fgColor="#0a0f0d" level="H" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-white font-bold">Scannez pour rejoindre</p>
              <p className="text-sm text-gray-500">
                Scanne ce code pour rejoindre la partie
              </p>
            </div>
          </div>
        </BottomSheet>
      </div>
    </div>
  );
}
