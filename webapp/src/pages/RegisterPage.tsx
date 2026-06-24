import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus, Mail, Lock, User, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { tokenStore } from "@/lib/session";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!name || !email || !password) return;
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: "/dashboard",
      });
      if (error) {
        toast.error(error.message ?? "Could not create account");
        return;
      }
      if (data?.token) tokenStore.set(data.token);
      window.location.href = "/dashboard";
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-foreground text-background p-12">
        <Link to="/" className="font-display text-2xl font-semibold text-primary">CraftCV</Link>
        <div>
          <blockquote className="font-display text-4xl leading-tight mb-6">
            "Your CV is the first impression. Make it the right one."
          </blockquote>
          <p className="text-background/60 text-sm">AI-powered tailoring for every application</p>
        </div>
        <div className="text-background/40 text-xs">© 2024 CraftCV</div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col justify-center items-center p-8 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden font-display text-2xl font-semibold text-primary block mb-8">CraftCV</Link>

          <div className="mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent mb-4">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-semibold mb-2">Create account</h1>
            <p className="text-muted-foreground text-sm">Get started with CraftCV today.</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Full name</Label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSignUp()}
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSignUp()}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSignUp()}
                  className="pl-9"
                />
              </div>
            </div>

            <Button
              onClick={handleSignUp}
              disabled={loading || !name || !email || !password}
              className="w-full"
            >
              {loading ? "Creating account…" : "Create account"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-foreground underline underline-offset-2 hover:text-primary">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
