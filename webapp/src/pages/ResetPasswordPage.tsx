import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!token) {
      toast.error("This reset link is invalid or expired.");
      return;
    }

    if (!password || !confirmPassword) {
      toast.error("Please fill in both password fields");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { error } = await authClient.resetPassword({
        token,
        newPassword: password,
      });

      if (error) {
        toast.error(error.message || "Unable to reset password");
        return;
      }

      toast.success("Password updated successfully");
      navigate("/login");
    } catch {
      toast.error("Unable to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-foreground text-background p-12">
        <Link to="/" className="font-display text-2xl font-semibold text-primary">CraftCV</Link>
        <div>
          <blockquote className="font-display text-4xl leading-tight mb-6">
            "Set a new password and get back to building."
          </blockquote>
          <p className="text-background/60 text-sm">Secure access to your CV builder</p>
        </div>
        <div className="text-background/40 text-xs">© 2024 CraftCV</div>
      </div>

      <div className="flex flex-col justify-center items-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden font-display text-2xl font-semibold text-primary block mb-8">CraftCV</Link>

          <div className="mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent mb-4">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-semibold mb-2">Reset your password</h1>
            <p className="text-muted-foreground text-sm">Choose a new password for your account.</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-sm font-medium">New password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Button onClick={handleReset} disabled={loading || !token} className="w-full">
              {loading ? "Updating…" : "Update password"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Remembered it?{" "}
            <Link to="/login" className="text-foreground underline underline-offset-2 hover:text-primary">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
