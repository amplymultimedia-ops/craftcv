import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import { Subscription } from "@/lib/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const PLANS = [
  {
    id: "trial",
    name: "7-Day Trial",
    price: "€2.90",
    period: "one-time",
    note: "then €27.95 / 4 weeks",
    features: ["All 10 templates", "AI job matching", "PDF export", "Tone of voice control"],
    highlight: false,
  },
  {
    id: "monthly",
    name: "Monthly",
    price: "€27.95",
    period: "every 4 weeks",
    note: null,
    features: ["Everything in Trial", "Unlimited resumes", "Cover letter generator", "Priority support"],
    highlight: false,
  },
  {
    id: "annual",
    name: "Annual",
    price: "€94.80",
    period: "per year",
    note: "Just €7.90 / month — save 72%",
    features: ["Everything in Monthly", "Early access features", "Dedicated support", "Cancel anytime"],
    highlight: true,
  },
];

export default function BillingPage() {
  const queryClient = useQueryClient();
  const [cancelling, setCancelling] = useState(false);

  const { data: subscription } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => api.get<Subscription>("/api/subscription"),
  });

  const startMutation = useMutation({
    mutationFn: (plan: string) => api.post<Subscription>("/api/subscription/start", { plan }),
    onSuccess: () => {
      toast.success("Subscription started!");
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.post("/api/subscription/cancel"),
    onSuccess: () => {
      toast.success("Subscription cancelled.");
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      setCancelling(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="font-display text-4xl font-light text-foreground mb-2">Billing</h1>
          <p className="text-muted-foreground">Manage your subscription plan.</p>
        </div>

        {subscription && (
          <div className="mb-10 p-5 rounded-lg border border-border bg-card flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-body font-medium text-sm text-foreground">
                Current plan: <span className="capitalize">{subscription.plan}</span>
                <Badge
                  variant={subscription.status === "active" ? "default" : "secondary"}
                  className="ml-2 text-xs"
                >
                  {subscription.status}
                </Badge>
              </p>
              {subscription.currentPeriodEndsAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Renews {new Date(subscription.currentPeriodEndsAt).toLocaleDateString()}
                </p>
              )}
              {subscription.trialEndsAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Trial ends {new Date(subscription.trialEndsAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {PLANS.map((plan) => {
            const isCurrentPlan = subscription?.plan === plan.id && subscription?.status === "active";
            return (
              <div
                key={plan.id}
                className={`rounded-xl border p-6 relative ${plan.highlight ? "border-primary shadow-lg shadow-primary/10" : "border-border"} bg-card`}
              >
                {plan.highlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs">Best Value</Badge>
                )}
                <p className="font-body text-xs text-muted-foreground uppercase tracking-wide mb-1">{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-0.5">
                  <span className="font-display text-3xl font-semibold text-foreground">{plan.price}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{plan.period}</p>
                {plan.note && <p className="text-xs text-primary font-medium mb-5">{plan.note}</p>}
                {!plan.note && <div className="mb-5" />}
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="w-3 h-3 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrentPlan ? (
                  <Button className="w-full" variant="secondary" size="sm" disabled>
                    Current plan
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.highlight ? "default" : "outline"}
                    size="sm"
                    onClick={() => startMutation.mutate(plan.id)}
                    disabled={startMutation.isPending}
                  >
                    {startMutation.isPending ? "Processing…" : `Choose ${plan.name}`}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {subscription?.status === "active" && (
          <div className="border border-destructive/30 rounded-lg p-5 bg-destructive/5">
            <h3 className="font-body font-medium text-sm text-foreground mb-1">Cancel subscription</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Your access will continue until the end of the current billing period.
            </p>
            {cancelling ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => cancelMutation.mutate()}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? "Cancelling…" : "Confirm cancellation"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setCancelling(false)}>
                  Keep subscription
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setCancelling(true)}>
                Cancel subscription
              </Button>
            )}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
