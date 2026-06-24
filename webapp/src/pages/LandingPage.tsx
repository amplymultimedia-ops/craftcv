import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Zap, Layout, Download, Mic2, Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const FEATURES = [
  { icon: Zap, title: "AI Job Matching", desc: "Paste a job ad and watch your CV reshape itself to match the role — keywords, tone, priorities all adjusted automatically." },
  { icon: Layout, title: "10 Premium Templates", desc: "From ATS-optimised classic to dark sidebar executive — every template is print-perfect and professionally designed." },
  { icon: Download, title: "One-Click PDF Export", desc: "Download a pixel-perfect PDF instantly. No watermarks, no account upgrade required for basic export." },
  { icon: Mic2, title: "Tone of Voice Control", desc: "Switch between Professional, Confident, Human, Creative, or Personal — the same facts, a very different impression." },
];

const PRICING = [
  {
    name: "7-Day Trial",
    price: "€2.90",
    period: "one-time",
    then: "then €27.95 / 4 weeks",
    features: ["All templates", "AI job matching", "PDF export", "Tone control"],
    cta: "Start Trial",
    highlight: false,
    plan: "trial",
  },
  {
    name: "Monthly",
    price: "€27.95",
    period: "every 4 weeks",
    then: null,
    features: ["Everything in Trial", "Unlimited resumes", "Cover letter generator", "Priority support"],
    cta: "Get Monthly",
    highlight: false,
    plan: "monthly",
  },
  {
    name: "Annual",
    price: "€94.80",
    period: "per year",
    then: "Just €7.90 / month",
    features: ["Everything in Monthly", "Save 72% vs monthly", "Early access features", "Dedicated support"],
    cta: "Best Value",
    highlight: true,
    plan: "annual",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="h-16 border-b border-border/50 sticky top-0 z-50 bg-background/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">CraftCV</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/login">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="secondary" className="mb-6 text-xs font-body font-medium tracking-wide uppercase">
            AI-Powered CV Builder
          </Badge>
          <h1 className="font-display text-5xl lg:text-6xl font-light leading-[1.1] text-foreground mb-6">
            Your CV, Perfectly<br />
            <em className="not-italic text-primary">Crafted</em> for<br />
            Every Role
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 font-body max-w-md">
            Paste a job ad and CraftCV rewrites your resume to match — tailoring keywords, tone, and emphasis so you land more interviews.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button size="lg" className="gap-2">
                Start Building Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">Sign in</Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">7-day trial for €2.90 · No credit card to start</p>
        </motion.div>

        {/* Mock CV Preview */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="hidden lg:block"
        >
          <div className="bg-white rounded-xl border border-border shadow-2xl shadow-foreground/5 p-8 max-w-sm mx-auto rotate-1 hover:rotate-0 transition-transform duration-500">
            <div className="mb-4 pb-4 border-b border-border">
              <div className="h-5 bg-foreground/90 rounded w-36 mb-1" />
              <div className="h-3 bg-primary/60 rounded w-24 mb-2" />
              <div className="flex gap-3">
                <div className="h-2.5 bg-muted rounded w-20" />
                <div className="h-2.5 bg-muted rounded w-24" />
              </div>
            </div>
            <div className="mb-4">
              <div className="h-2.5 bg-foreground/30 rounded w-16 mb-2" />
              <div className="space-y-1.5">
                <div className="h-2 bg-muted rounded w-full" />
                <div className="h-2 bg-muted rounded w-5/6" />
                <div className="h-2 bg-muted rounded w-4/5" />
              </div>
            </div>
            <div className="mb-4">
              <div className="h-2.5 bg-foreground/30 rounded w-20 mb-2" />
              <div className="mb-2">
                <div className="h-2.5 bg-foreground/20 rounded w-28 mb-1" />
                <div className="h-2 bg-muted rounded w-3/4 mb-1" />
                <div className="h-2 bg-muted rounded w-2/3" />
              </div>
              <div>
                <div className="h-2.5 bg-foreground/20 rounded w-32 mb-1" />
                <div className="h-2 bg-muted rounded w-4/5 mb-1" />
                <div className="h-2 bg-muted rounded w-3/4" />
              </div>
            </div>
            <div>
              <div className="h-2.5 bg-foreground/30 rounded w-10 mb-2" />
              <div className="flex flex-wrap gap-1.5">
                {["TypeScript", "React", "Node.js", "AWS"].map((s) => (
                  <span key={s} className="text-[9px] bg-accent text-accent-foreground px-2 py-0.5 rounded font-body font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="bg-secondary/40 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-light text-foreground mb-3">Everything you need</h2>
            <p className="text-muted-foreground text-lg">Built for serious job seekers who want an edge.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-lg p-6"
              >
                <div className="w-9 h-9 rounded-md bg-accent flex items-center justify-center mb-4">
                  <Icon className="w-4 h-4 text-accent-foreground" />
                </div>
                <h3 className="font-body font-semibold text-foreground mb-2 text-sm">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-light text-foreground mb-3">Simple pricing</h2>
            <p className="text-muted-foreground text-lg">Start with a trial, upgrade anytime.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING.map(({ name, price, period, then, features, cta, highlight, plan }) => (
              <div
                key={plan}
                className={`rounded-xl border p-7 relative ${highlight ? "border-primary bg-card shadow-lg shadow-primary/10" : "border-border bg-card"}`}
              >
                {highlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs">
                    Best Value
                  </Badge>
                )}
                <p className="font-body font-medium text-sm text-muted-foreground mb-1">{name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-display text-4xl font-semibold text-foreground">{price}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{period}</p>
                {then && <p className="text-xs text-primary font-medium mb-5">{then}</p>}
                {!then && <div className="mb-5" />}
                <ul className="space-y-2.5 mb-7">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/login">
                  <Button className="w-full" variant={highlight ? "default" : "outline"} size="sm">
                    {cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
              <FileText className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-display text-base font-semibold">CraftCV</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 CraftCV. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
