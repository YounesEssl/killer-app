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
      setError("Erreur reseau");
    }

    setIsChecking(false);
  };

  if (!authenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-6 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
          className="w-full max-w-sm space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-brand-600" />
            </div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
              Admin Panel
            </h1>
            <p className="text-slate-500 text-sm">
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
            Acceder
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!game) return null;

  return (
    <div className="min-h-dvh px-5 py-6 max-w-2xl mx-auto bg-white">
      <AdminPanel game={game} players={players} events={events} />
    </div>
  );
}
