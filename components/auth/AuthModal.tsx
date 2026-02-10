"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn, UserPlus } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";

type AuthMode = "login" | "signup";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [pseudo, setPseudo] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();

  const resetForm = () => {
    setPseudo("");
    setFirstName("");
    setLastName("");
    setPassword("");
    setError("");
  };

  const toggleMode = () => {
    setMode((m) => (m === "login" ? "signup" : "login"));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!pseudo.trim()) {
      setError("Le pseudo est requis");
      return;
    }
    if (pseudo.trim().length < 2) {
      setError("Le pseudo doit faire au moins 2 caractères");
      return;
    }
    if (mode === "signup" && (!firstName.trim() || !lastName.trim())) {
      setError("Le prénom et le nom de famille sont requis");
      return;
    }
    if (!password) {
      setError("Le mot de passe est requis");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caractères");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        await signUp(pseudo, password, firstName, lastName);
      } else {
        await signIn(pseudo, password);
      }
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 glass-strong rounded-t-3xl max-h-[85vh] overflow-auto pb-safe"
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-killer-200/20" />
            </div>

            <div className="flex items-center justify-between px-6 pb-4">
              <h3 className="text-lg font-bold font-[family-name:var(--font-display)] text-foreground">
                {mode === "login" ? "Se connecter" : "Créer un compte"}
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-surface-2 transition-colors"
              >
                <X className="w-5 h-5 text-killer-200/60" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
              <Input
                label="Pseudo"
                placeholder="Ton pseudo"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                autoComplete="username"
                autoCapitalize="off"
              />
              {mode === "signup" && (
                <>
                  <p className="text-xs text-killer-200/50">
                    Utilise ton vrai nom pour que les autres joueurs te reconnaissent
                  </p>
                  <Input
                    label="Prénom"
                    placeholder="Ton vrai prénom"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                  />
                  <Input
                    label="Nom de famille"
                    placeholder="Ton vrai nom"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                  />
                </>
              )}
              <Input
                label="Mot de passe"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
              />

              {error && (
                <p className="text-sm text-danger-400">{error}</p>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                icon={
                  mode === "login" ? (
                    <LogIn className="w-5 h-5" />
                  ) : (
                    <UserPlus className="w-5 h-5" />
                  )
                }
              >
                {mode === "login" ? "Se connecter" : "Créer mon compte"}
              </Button>

              <button
                type="button"
                onClick={toggleMode}
                className="w-full text-center text-sm text-killer-400 hover:text-killer-300 transition-colors"
              >
                {mode === "login"
                  ? "Pas encore de compte ? Créer un compte"
                  : "Déjà un compte ? Se connecter"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
