import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap, Brain, Layers, RefreshCw, Shield, Download,
  Check, ArrowRight, Play, Sparkles, Clock, MonitorSmartphone,
} from "lucide-react";

// ─── Data ──────────────────────────────────────────────────────────────

const features = [
  {
    icon: Brain,
    title: "AI Keyframe Generation",
    description:
      "Describe the motion you want in plain language. Motion AI translates your intent into precise keyframes in seconds.",
  },
  {
    icon: Zap,
    title: "Smart Easing Engine",
    description:
      "Automatically applies industry-standard easing curves. Choose from Ease Out Expo, Spring Physics, Custom Bezier, and more.",
  },
  {
    icon: Layers,
    title: "Layer Intelligence",
    description:
      "Understands layer hierarchy and relationships. Animate entire compositions coherently with a single prompt.",
  },
  {
    icon: RefreshCw,
    title: "Motion Variations",
    description:
      "Generate multiple animation variants instantly. Explore creative directions without starting from scratch.",
  },
  {
    icon: Shield,
    title: "Non-Destructive Workflow",
    description:
      "All AI-generated keyframes are fully editable. Your workflow stays intact — Motion AI enhances it, never replaces it.",
  },
  {
    icon: Download,
    title: "Preset Library",
    description:
      "Access 200+ curated motion presets optimised for UI, broadcast, and social media formats.",
  },
];

const pricingPlans = [
  {
    name: "Trial",
    price: "Free",
    period: "7 days",
    description: "Try every feature with no restrictions.",
    features: [
      "Full feature access for 7 days",
      "1 device",
      "Community support",
      "All preset library",
    ],
    cta: "Start free trial",
    ctaHref: "/register",
    variant: "secondary" as const,
    popular: false,
  },
  {
    name: "Standard",
    price: "$49",
    period: "/ seat / year",
    description: "For solo motion designers and freelancers.",
    features: [
      "All features unlocked",
      "Up to 2 devices",
      "1 year of free updates",
      "Email support",
      "Lifetime access to current version",
    ],
    cta: "Buy now",
    ctaHref: "/register?plan=standard",
    variant: "cta" as const,
    popular: true,
  },
  {
    name: "Team",
    price: "$39",
    period: "/ seat / year",
    description: "5+ seats. Best for studios and agencies.",
    features: [
      "Everything in Standard",
      "Volume discount (5+ seats)",
      "Up to 2 devices per seat",
      "Priority support",
      "Team license management",
    ],
    cta: "Contact sales",
    ctaHref: "mailto:design@orangetoolz.com",
    variant: "secondary" as const,
    popular: false,
  },
];

const stats = [
  { value: "10,000+", label: "Motion designers" },
  { value: "200+",    label: "Motion presets" },
  { value: "5×",      label: "Faster workflow" },
  { value: "AE 2022+", label: "Compatibility" },
];

// ─── Page ──────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background glow blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(ellipse, var(--color-primary-500), transparent 70%)" }}
          />
          <div
            className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl"
            style={{ background: "radial-gradient(ellipse, var(--color-secondary-500), transparent 70%)" }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-24 text-center">
          <Badge variant="primary" dot className="mb-6 text-xs">
            Now available for After Effects 2022 – 2025
          </Badge>

          <h1 className="text-h2 sm:text-h1 font-heading text-[var(--color-text-primary)] mb-6 max-w-4xl mx-auto leading-tight">
            AI-Powered Motion Design{" "}
            <span className="gradient-text">Inside After Effects</span>
          </h1>

          <p className="text-body-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 font-body">
            Generate keyframes, apply smart easing, and create stunning animations
            with natural language prompts — without leaving After Effects.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="cta" size="xl" rightIcon={<ArrowRight className="h-5 w-5" />} asChild>
              <Link href="/register">Start 7-day free trial</Link>
            </Button>
            <Button variant="secondary" size="xl" leftIcon={<Play className="h-4 w-4" />} asChild>
              <Link href="#demo">Watch demo</Link>
            </Button>
          </div>

          <p className="mt-4 text-xs text-[var(--color-text-muted)] font-body">
            No credit card required &nbsp;·&nbsp; Works inside After Effects &nbsp;·&nbsp; Cancel anytime
          </p>

          {/* Mock plugin preview */}
          <div className="mt-16 mx-auto max-w-3xl rounded-[var(--radius-xl)] border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] p-1 shadow-[var(--shadow-elevated)]">
            <div className="rounded-[var(--radius-lg)] bg-[var(--color-bg-elevated)] aspect-video flex items-center justify-center">
              <div className="text-center">
                <Sparkles className="h-12 w-12 text-[var(--color-primary-600)] mx-auto mb-3 animate-pulse" />
                <p className="text-sm text-[var(--color-text-muted)] font-body">Plugin preview coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-[var(--color-border)] bg-[var(--color-bg-surface)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-h4 font-heading gradient-text">{s.value}</p>
                <p className="text-sm text-[var(--color-text-muted)] font-body mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <Badge variant="primary" className="mb-4">Features</Badge>
            <h2 className="text-h3 font-heading text-[var(--color-text-primary)] mb-4">
              Everything a motion designer needs
            </h2>
            <p className="text-body-lg text-[var(--color-text-secondary)] max-w-xl mx-auto font-body">
              Motion AI integrates directly into your After Effects workflow — no tab-switching, no exports.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="p-6 hover:border-[var(--color-border-soft)] transition-colors group">
                <div className="mb-4 w-10 h-10 rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--color-primary-500)_15%,transparent)] flex items-center justify-center">
                  <f.icon className="h-5 w-5 text-[var(--color-primary-600)]" />
                </div>
                <h3 className="text-h6 font-heading text-[var(--color-text-primary)] mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] font-body leading-relaxed">{f.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 bg-[var(--color-bg-surface)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <Badge variant="primary" className="mb-4">How it works</Badge>
            <h2 className="text-h3 font-heading text-[var(--color-text-primary)] mb-4">
              From prompt to animation in 3 steps
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { step: "01", icon: Download, title: "Install & activate", desc: "Download the plugin, sign in with your account, and enter your license key. Takes under 2 minutes." },
              { step: "02", icon: Brain,    title: "Describe your motion", desc: 'Type a prompt like "bounce in with spring physics" or choose from preset categories.' },
              { step: "03", icon: Zap,      title: "Generate & refine", desc: "Motion AI creates keyframes instantly. Tweak values directly in After Effects as usual." },
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-display font-heading opacity-10 text-[var(--color-primary-600)] leading-none select-none">
                    {item.step}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-[color-mix(in_srgb,var(--color-primary-500)_20%,transparent)] flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-[var(--color-primary-600)]" />
                  </div>
                </div>
                <h3 className="text-h5 font-heading text-[var(--color-text-primary)]">{item.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] font-body leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <Badge variant="primary" className="mb-4">Pricing</Badge>
            <h2 className="text-h3 font-heading text-[var(--color-text-primary)] mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-body-lg text-[var(--color-text-secondary)] max-w-xl mx-auto font-body">
              One year of updates included. After that, keep using your version forever or renew for new features.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                elevated={plan.popular}
                glow={plan.popular ? "cta" : false}
                className={`p-6 flex flex-col ${plan.popular ? "ring-1 ring-[var(--color-cta-500)]" : ""}`}
              >
                {plan.popular && (
                  <Badge variant="primary" className="self-start mb-4">Most popular</Badge>
                )}
                <p className="text-h6 font-heading text-[var(--color-text-primary)]">{plan.name}</p>
                <div className="mt-3 mb-2 flex items-end gap-1">
                  <span className="text-h2 font-heading text-[var(--color-text-primary)]">{plan.price}</span>
                  <span className="text-sm text-[var(--color-text-muted)] font-body mb-2">{plan.period}</span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] font-body mb-6">{plan.description}</p>

                <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)] font-body">
                      <Check className="h-4 w-4 text-[var(--color-primary-600)] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button variant={plan.variant} size="lg" className="w-full" asChild>
                  <Link href={plan.ctaHref}>{plan.cta}</Link>
                </Button>
              </Card>
            ))}
          </div>

          {/* Manual payment note */}
          <p className="mt-8 text-center text-sm text-[var(--color-text-muted)] font-body">
            Bank transfer available for all plans. &nbsp;
            <Link href="/payment/bank" className="text-[var(--color-primary-600)] hover:underline">
              Learn more →
            </Link>
          </p>
        </div>
      </section>

      {/* ── Device info strip ── */}
      <section className="py-12 bg-[var(--color-bg-surface)] border-y border-[var(--color-border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-4">
              <MonitorSmartphone className="h-8 w-8 text-[var(--color-primary-600)] shrink-0" />
              <div>
                <p className="text-h6 font-heading text-[var(--color-text-primary)]">Up to 2 devices per license</p>
                <p className="text-sm text-[var(--color-text-secondary)] font-body">
                  Seamlessly switch between workstations. Manage devices from your dashboard.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-[var(--color-primary-600)] shrink-0" />
              <div>
                <p className="text-h6 font-heading text-[var(--color-text-primary)]">Lifetime access after expiry</p>
                <p className="text-sm text-[var(--color-text-secondary)] font-body">
                  Your purchased version works forever. Renew only for new features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-h2 font-heading text-[var(--color-text-primary)] mb-6">
            Start animating smarter{" "}
            <span className="gradient-text">today</span>
          </h2>
          <p className="text-body-lg text-[var(--color-text-secondary)] mb-10 font-body">
            Join thousands of motion designers already using Motion AI. Free 7-day trial, no credit card required.
          </p>
          <Button variant="cta" size="xl" rightIcon={<ArrowRight className="h-5 w-5" />} asChild>
            <Link href="/register">Get started for free</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
