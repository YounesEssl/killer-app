"use client";

import { useState, use } from "react";
import { motion } from "framer-motion";
import type { Game, Player, KillEvent } from "@/lib/supabase/types";
import AdminPanel from "@/components/admin/AdminPanel";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Lock } from "lucide-react";

export default function AdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: gameId } = use(params);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [events, setEvents] = useState<KillEvent[]>([]);

  const handleAuth = async () => {
    setIsChecking(true);
    setError("");

    try {
      const res = await fetch(`/api/games/${gameId}`);
      const data = await res.json();

      if (!res.ok || !data.game) {
        setError("Partie introuvable");
        setIsChecking(false);
        return;
      }

      if (data.game.admin_password !== password) {
        setError("Mot de passe incorrect");
        setIsChecking(false);
        return;
      }

      setGame(data.game as Game);
      setPlayers((data.players || []) as Player[]);

      const feedRes = await fetch(`/api/games/${gameId}/feed`);
      const eventsData = await feedRes.json();
      setEvents((eventsData || []) as KillEvent[]);

      setAuthenticated(true);
    } catch {
      setError("Erreur réseau");
    }

    setIsChecking(false);
  };

  if (!authenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-6"
        >
          <div className="text-center space-y-2">
            <Lock className="w-10 h-10 text-killer-400 mx-auto" />
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
              Admin Panel
            </h1>
            <p className="text-killer-200/60 text-sm">
              Entre le mot de passe admin
            </p>
          </div>

          <Input
            type="password"
            placeholder="Mot de passe admin"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            onKeyDown={(e) => e.key === "Enter" && handleAuth()}
          />

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isChecking}
            disabled={!password}
            onClick={handleAuth}
          >
            Accéder
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!game) return null;

  return (
    <div className="min-h-dvh px-4 py-6 max-w-2xl mx-auto">
      <AdminPanel game={game} players={players} events={events} />
    </div>
  );
}
