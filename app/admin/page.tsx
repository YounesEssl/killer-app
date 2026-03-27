"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import BottomSheet from "@/components/ui/BottomSheet";
import ProfilePhoto from "@/components/ui/ProfilePhoto";
import { Lock, Plus, RefreshCw, Trash2, Edit3, Users, Copy } from "lucide-react";
import type { Account } from "@/lib/firebase/types";

export default function AdminPage() {
  const [adminSecret, setAdminSecret] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState("");

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const headers = useCallback(() => ({
    "Content-Type": "application/json",
    "x-admin-secret": adminSecret,
  }), [adminSecret]);

  const fetchAccounts = useCallback(async () => {
    setIsLoadingAccounts(true);
    try {
      const res = await fetch("/api/admin/accounts", { headers: headers() });
      const data = await res.json();
      if (res.ok) setAccounts(data.accounts);
    } catch {}
    setIsLoadingAccounts(false);
  }, [headers]);

  const handleAuth = async () => {
    if (!adminSecret.trim()) return;
    setAuthError("");

    try {
      const res = await fetch("/api/admin/accounts", {
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret.trim(),
        },
      });

      if (!res.ok) {
        setAuthError("Code admin incorrect");
        return;
      }

      const stored = adminSecret.trim();
      setAdminSecret(stored);
      sessionStorage.setItem("killer_admin_secret", stored);
      setIsAuthenticated(true);
    } catch {
      setAuthError("Erreur reseau");
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("killer_admin_secret");
    if (stored) {
      setAdminSecret(stored);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchAccounts();
  }, [isAuthenticated, fetchAccounts]);

  const handleCreate = async () => {
    if (!newUsername.trim()) return;
    setIsCreating(true);
    setCreateError("");

    try {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ username: newUsername.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error);
        setIsCreating(false);
        return;
      }

      setNewUsername("");
      setShowCreate(false);
      fetchAccounts();
    } catch {
      setCreateError("Erreur reseau");
    }
    setIsCreating(false);
  };

  const handleEdit = async () => {
    if (!editAccount || !editUsername.trim()) return;
    setIsEditing(true);
    setEditError("");

    try {
      const res = await fetch(`/api/admin/accounts/${editAccount.id}`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ username: editUsername.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error);
        setIsEditing(false);
        return;
      }

      setEditAccount(null);
      fetchAccounts();
    } catch {
      setEditError("Erreur reseau");
    }
    setIsEditing(false);
  };

  const handleRegenerateCode = async (account: Account) => {
    try {
      await fetch(`/api/admin/accounts/${account.id}`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ regenerateCode: true }),
      });
      fetchAccounts();
    } catch {}
  };

  const handleDelete = async (account: Account) => {
    if (!confirm(`Supprimer le compte de ${account.username} ?`)) return;

    try {
      await fetch(`/api/admin/accounts/${account.id}`, {
        method: "DELETE",
        headers: headers(),
      });
      fetchAccounts();
    } catch {}
  };

  const handleCopyCode = async (account: Account) => {
    await navigator.clipboard.writeText(`${account.username}: ${account.secret_code}`);
    setCopiedId(account.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-[#0a0f0d]">
        <div className="fixed inset-0 bg-grid pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
          className="w-full max-w-sm space-y-6 text-center relative z-10"
        >
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-white">
              Admin Panel
            </h1>
            <p className="text-gray-500 text-sm">
              Entre le code admin pour acceder au panel
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Code admin"
              type="password"
              placeholder="Code secret"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              error={authError}
            />
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleAuth}
              disabled={!adminSecret.trim()}
            >
              Acceder
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh px-5 py-8 max-w-lg mx-auto bg-[#0a0f0d] relative">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-white">
                Comptes
              </h1>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {accounts.length} compte{accounts.length > 1 ? "s" : ""}
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreate(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Creer
            </Button>
          </div>

          {isLoadingAccounts ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {accounts.map((account, index) => (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card>
                      <div className="flex items-center gap-3">
                        <ProfilePhoto
                          src={account.photo_url}
                          alt={account.username}
                          size="lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">
                            {account.username}
                          </p>
                          <p className="text-lg font-bold font-[family-name:var(--font-mono)] text-green-400 tracking-widest">
                            {account.secret_code}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleCopyCode(account)}
                            className="p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-500 hover:text-green-400"
                            title="Copier"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditAccount(account);
                              setEditUsername(account.username);
                              setEditError("");
                            }}
                            className="p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-500 hover:text-green-400"
                            title="Modifier"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRegenerateCode(account)}
                            className="p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-500 hover:text-green-400"
                            title="Regenerer le code"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(account)}
                            className="p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-500 hover:text-red-400"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {copiedId === account.id && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-green-400 font-semibold mt-2"
                        >
                          Copie !
                        </motion.p>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      <BottomSheet
        isOpen={showCreate}
        onClose={() => { setShowCreate(false); setCreateError(""); setNewUsername(""); }}
        title="Creer un compte"
      >
        <div className="space-y-4">
          <Input
            label="Prenom"
            placeholder="Prenom du joueur"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            error={createError}
          />
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isCreating}
            disabled={!newUsername.trim()}
            onClick={handleCreate}
          >
            Creer le compte
          </Button>
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={!!editAccount}
        onClose={() => { setEditAccount(null); setEditError(""); }}
        title="Modifier le compte"
      >
        <div className="space-y-4">
          <Input
            label="Prenom"
            placeholder="Nouveau prenom"
            value={editUsername}
            onChange={(e) => setEditUsername(e.target.value)}
            error={editError}
          />
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isEditing}
            disabled={!editUsername.trim()}
            onClick={handleEdit}
          >
            Enregistrer
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
