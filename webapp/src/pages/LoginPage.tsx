import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { tokenStore } from "@/lib/session";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  async function handleSendCode() {
    if (!email) return;
    setLoading(true);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim(),
        type: "sign-in",
      });
      if (error) {
        toast.error(error.message ?? "Unable to send verification code");
        return;
      }
      setCode("");
      setCodeSent(true);
      toast.success("Verification code sent");
    } catch {
      toast.error("Unable to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode() {
    if (!email || !/^\d{6}$/.test(code)) return;
    setLoading(true);
    try {
      const { data, error } = await authClient.signIn.emailOtp({
        email: email.trim(),
        otp: code,
      });
      if (error || !data?.token) {
        toast.error(error?.message ?? "The code is invalid or expired");
        return;
      }
      tokenStore.set(data.token);
      window.location.href = "/dashboard";
    } catch {
      toast.error("Unable to verify code. Please try again.");
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
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-semibold mb-2">Sign in</h1>
            <p className="text-muted-foreground text-sm">We'll email you a one-time verification code.</p>
          </div>

          <div className="space-y-4">
            {codeSent ? (
              <div className="rounded-md border border-border bg-card p-4 text-sm" role="status">
                <p className="font-medium">Check your inbox</p>
                <p className="mt-1 text-muted-foreground">Enter the six-digit code sent to {email}.</p>
                <Label htmlFor="verification-code" className="mt-4 block text-left text-sm font-medium">Verification code</Label>
                <Input
                  id="verification-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(event) => event.key === "Enter" && handleVerifyCode()}
                  className="mt-1.5 text-center text-lg tracking-[0.35em]"
                  autoFocus
                />
                <Button
                  onClick={handleVerifyCode}
                  disabled={loading || code.length !== 6}
                  className="mt-3 w-full"
                >
                  {loading ? "Verifying…" : "Verify and sign in"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={loading}
                  className="mt-3 w-full text-center text-sm text-muted-foreground underline underline-offset-2 disabled:opacity-50"
                >
                  Send a new code
                </button>
                <button
                  type="button"
                  onClick={() => { setCodeSent(false); setCode(""); }}
                  className="mt-2 w-full text-center text-sm text-foreground underline underline-offset-2"
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
                      onKeyDown={e => e.key === "Enter" && handleSendCode()}
                      className="pl-9"
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                <Button onClick={handleSendCode} disabled={loading || !email} className="w-full">
                  {loading ? "Sending code…" : "Email me a verification code"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Don't have an account?{" "}
            <Link to="/register" className="text-foreground underline underline-offset-2 hover:text-primary">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
