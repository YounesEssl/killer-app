"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import type { Game, Player } from "@/lib/supabase/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import BottomSheet from "@/components/ui/BottomSheet";
import { Copy, Share2, Users, Play, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface GameLobbyProps {
  game: Game;
  players: Player[];
}

export default function GameLobby({ game, players: initialPlayers }: GameLobbyProps) {
  const [players, setPlayers] = useState(initialPlayers);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel(`lobby-${game.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "players",
          filter: `game_id=eq.${game.id}`,
        },
        (payload) => {
          setPlayers((prev) => {
            const newPlayer = payload.new as Player;
            if (prev.some((p) => p.id === newPlayer.id)) return prev;
            return [...prev, newPlayer];
          });
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("[GameLobby] Realtime subscription error, falling back to polling");
        }
      });

    // Fallback polling every 5s
    const fetchPlayers = async () => {
      const { data } = await supabase
        .from("players")
        .select("*")
        .eq("game_id", game.id)
        .order("joined_at", { ascending: true });
      if (data) setPlayers(data);
    };
    const interval = setInterval(fetchPlayers, 5000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [game.id]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(game.join_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/join?code=${game.join_code}`;
    const text = `🔪 Rejoins la partie "${game.name}" !\nCode: ${game.join_code}\n${url}`;

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
      setAdminError("Erreur réseau");
      setIsStarting(false);
    }
  };

  const joinUrl = typeof window !== "undefined"
    ? `${window.location.origin}/join?code=${game.join_code}`
    : "";

  return (
    <div className="min-h-dvh px-4 py-8 pb-safe max-w-lg mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
          {game.name}
        </h1>
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl font-bold font-[family-name:var(--font-mono)] text-killer-400 tracking-widest">
            {game.join_code}
          </span>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-surface-2 transition-colors"
          >
            <Copy className="w-4 h-4 text-killer-200/60" />
          </button>
        </div>
        {copied && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-killer-400"
          >
            Copié !
          </motion.p>
        )}
      </motion.div>

      <div className="flex gap-3">
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

      <Card glow>
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-killer-400" />
          <span className="font-bold font-[family-name:var(--font-display)]">
            {players.length} joueur{players.length > 1 ? "s" : ""} inscrit{players.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <AnimatePresence>
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-2 p-2 rounded-lg bg-surface-2/50"
              >
                <span className="text-lg">{player.avatar_emoji}</span>
                <span className="text-sm truncate">{player.name}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Card>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={() => setShowAdmin(true)}
        icon={<Play className="w-5 h-5" />}
      >
        Lancer la partie
      </Button>

      <BottomSheet
        isOpen={showAdmin}
        onClose={() => { setShowAdmin(false); setAdminError(""); }}
        title="Lancer la partie"
      >
        <div className="space-y-4">
          <p className="text-sm text-killer-200/60">
            {players.length} joueur{players.length > 1 ? "s" : ""} inscrit
            {players.length > 1 ? "s" : ""}
            {players.length < 4 && (
              <span className="text-danger-400 ml-1">
                (minimum 4 joueurs)
              </span>
            )}
          </p>
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

      <BottomSheet
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        title="QR Code"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white p-4 rounded-2xl">
            <QRCodeSVG value={joinUrl} size={200} />
          </div>
          <p className="text-sm text-killer-200/60 text-center">
            Scanne ce code pour rejoindre la partie
          </p>
        </div>
      </BottomSheet>
    </div>
  );
}
