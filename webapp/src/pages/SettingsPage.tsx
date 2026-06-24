import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/layout/Navbar";
import { fetchSession, clearSession, tokenStore } from "@/lib/session";
import { toast } from "sonner";

export default function SettingsPage() {
  const [session, setSession] = useState<{ user?: { name?: string; email?: string } } | null>(null);

  useEffect(() => {
    fetchSession().then(setSession);
  }, []);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsChangingPassword(true);

    try {
      const token = tokenStore.get();
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
          revokeOtherSessions: true,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(data?.error?.message || "Unable to change password right now");
        return;
      }

      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Password change failed", error);
      toast.error("Unable to change password right now");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    toast.error("Account deletion coming soon. Contact support to delete your account.");
    setShowDeleteConfirm(false);
  };

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

        {/* Change Password */}
        <section className="mb-8 p-6 bg-card border border-border rounded-lg">
          <h2 className="font-body font-semibold text-sm text-foreground mb-4 uppercase tracking-wide">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current">Current password</Label>
              <Input
                id="current"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new">New password</Label>
              <Input
                id="new"
                type="password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm new password</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" size="sm" disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}>
              {isChangingPassword ? "Updating…" : "Update password"}
            </Button>
          </form>
        </section>

        {/* Danger Zone */}
        <section className="p-6 bg-card border border-destructive/30 rounded-lg">
          <h2 className="font-body font-semibold text-sm text-destructive mb-2 uppercase tracking-wide">Danger Zone</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          {showDeleteConfirm ? (
            <div className="flex items-center gap-3">
              <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                Yes, delete my account
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
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
