import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { tokenStore } from "@/lib/session";
import { Button } from "@/components/ui/button";

export default function MagicLinkVerifyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const verificationStarted = useRef(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (verificationStarted.current) return;
    verificationStarted.current = true;

    if (!token) {
      setErrorMessage("This sign-in link is missing its verification token.");
      return;
    }

    async function verifyLink(verificationToken: string) {
      try {
        const { data, error } = await authClient.magicLink.verify({
          query: { token: verificationToken },
        });

        if (error || !data?.token) {
          setErrorMessage(error?.message ?? "This sign-in link is invalid or has expired.");
          return;
        }

        tokenStore.set(data.token);
        navigate("/dashboard", { replace: true });
      } catch {
        setErrorMessage("Unable to verify this link. Please request a new one.");
      }
    }

    void verifyLink(token);
  }, [navigate, token]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <section className="w-full max-w-sm text-center">
        <Link to="/" className="font-display text-2xl font-semibold text-primary">
          CraftCV
        </Link>
        {errorMessage ? (
          <div className="mt-10">
            <h1 className="font-display text-2xl font-semibold">Link could not be verified</h1>
            <p className="mt-3 text-sm text-muted-foreground">{errorMessage}</p>
            <Button asChild className="mt-6">
              <Link to="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-10" role="status" aria-live="polite">
            {token ? (
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            ) : (
              <MailCheck className="mx-auto h-8 w-8 text-primary" />
            )}
            <h1 className="mt-5 font-display text-2xl font-semibold">Verifying your email</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your secure sign-in link is being checked.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}