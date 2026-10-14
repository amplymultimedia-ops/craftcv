import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/layout/Navbar";
import { fetchSession, clearSession, tokenStore } from "@/lib/session";
import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function SettingsPage() {
  const [session, setSession] = useState<{ user?: { name?: string; email?: string } } | null>(null);

  useEffect(() => {
    fetchSession().then(setSession);
  }, []);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const deleteAccountMutation = useMutation({
    mutationFn: () => api.delete<void>("/api/account", {
      body: JSON.stringify({ confirmation: deleteConfirmation }),
    }),
    onSuccess: () => {
      tokenStore.clear();
      window.location.href = "/login";
    },
    onError: (error: Error) => toast.error(error.message || "Unable to delete account"),
  });

  const handleLogout = async () => {
    await clearSession();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="font-display text-4xl font-light text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences.</p>
        </div>

        {/* Account Info */}
        <section className="mb-8 p-6 bg-card border border-border rounded-lg">
          <h2 className="font-body font-semibold text-sm text-foreground mb-4 uppercase tracking-wide">Account</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Name</p>
              <p className="text-sm text-foreground font-medium">{session?.user?.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Email</p>
              <p className="text-sm text-foreground font-medium">{session?.user?.email ?? "—"}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border flex gap-3">
            <Link to="/billing">
              <Button variant="outline" size="sm">Manage billing</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>Sign out</Button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="p-6 bg-card border border-destructive/30 rounded-lg">
          <h2 className="font-body font-semibold text-sm text-destructive mb-2 uppercase tracking-wide">Danger Zone</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Permanently delete your account, resumes, cover letters, job ads, and profile data. This cannot be undone.
          </p>
          {showDeleteConfirm ? (
            <div className="max-w-sm space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="delete-confirmation">Type DELETE to confirm</Label>
                <Input
                  id="delete-confirmation"
                  value={deleteConfirmation}
                  onChange={(event) => setDeleteConfirmation(event.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deleteConfirmation !== "DELETE" || deleteAccountMutation.isPending}
                  onClick={() => deleteAccountMutation.mutate()}
                >
                  {deleteAccountMutation.isPending ? "Deleting…" : "Delete account permanently"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmation("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete account
            </Button>
          )}
        </section>

        <div className="mt-8 text-center">
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
