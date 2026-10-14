import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus, Mail, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const callbackURL = new URL("/auth/verify", window.location.origin).toString();

  async function handleSendLink() {
    if (!email) return;
    setLoading(true);
    try {
      const { error } = await authClient.signIn.magicLink({
        email,
        callbackURL,
      });
      if (error) {
        toast.error(error.message ?? "Unable to send verification link");
        return;
      }
      setSentTo(email);
    } catch {
      toast.error("Unable to send verification link. Please try again.");
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
            <p className="text-muted-foreground text-sm">Enter your email to verify it and create your account.</p>
          </div>

          <div className="space-y-4">
            {sentTo ? (
              <div className="rounded-md border border-border bg-card p-4 text-sm" role="status">
                <p className="font-medium">Verify your email</p>
                <p className="mt-1 text-muted-foreground">We sent an account link to {sentTo}.</p>
                <button
                  type="button"
                  onClick={() => setSentTo("")}
                  className="mt-3 text-foreground underline underline-offset-2"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <>
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
                      onKeyDown={e => e.key === "Enter" && handleSendLink()}
                      className="pl-9"
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                <Button onClick={handleSendLink} disabled={loading || !email} className="w-full">
                  {loading ? "Sending link…" : "Email me a verification link"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </>
            )}
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
