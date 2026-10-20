"use client";
import Link from "next/link";
import { Fragment, useState, useEffect, useRef, useCallback } from "react";
import {
  Zap, Brain, Layers, RefreshCw, Shield, Download,
  Check, ArrowRight, Play, Sparkles, Clock, MonitorSmartphone,
  ChevronRight, Settings, GitBranch,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { usePricing } from "@/lib/use-pricing";
import { SUPPORT_EMAIL } from "@/lib/config";
import { cn } from "@/lib/utils";
import { SpButton } from "@/components/marketing/sp-button";
import { BrandLogo, BRAND_LOGOS } from "@/components/marketing/brand-logos";
import { LightBeam } from "@/components/marketing/light-beam";
import type { Pricing } from "@/lib/types";

type Currency = "USD" | "BDT";
const BDT_RATE = 121;

// ─── Intersection Observer Hook ────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

// ─── Odometer stat (digits roll into place, ScalePro-style) ───────
const DIGIT_STRIP = Array.from({ length: 20 }, (_, i) => i % 10);

function RollingNumber({ value, active }: { value: string; active: boolean }) {
  let digitIndex = 0;
  return (
    <>
    <span className="sr-only">{value}</span>
    <span className="sp-odo" aria-hidden>
      {[...value].map((ch, i) => {
        if (!/\d/.test(ch)) return <span key={i} aria-hidden>{ch}</span>;
        const target = active ? 10 + Number(ch) : 0;
        const d = digitIndex++;
        return (
          <span key={i} className="sp-odo__col" aria-hidden>
            <span
              className="sp-odo__strip"
              style={{ transform: `translateY(-${(target / DIGIT_STRIP.length) * 100}%)`, transitionDelay: `${d * 90}ms` }}
            >
              {DIGIT_STRIP.map((n, k) => <span key={k}>{n}</span>)}
            </span>
          </span>
        );
      })}
    </span>
    </>
  );
}

function AnimatedStat({ value, label, description, delay }: { value: string; label: string; description: string; delay: number }) {
  const { ref, visible } = useInView(0.3);
  return (
    <div ref={ref} className={cn("sp-stat fade-in-up", visible && "visible", `delay-${delay + 1}`)}>
      <p className="font-body text-[40px] font-medium leading-[52px] tracking-[-0.013em] text-white">
        <RollingNumber value={value} active={visible} />
      </p>
      <div className="relative">
        <h3 className="font-body text-[18px] font-medium leading-[1.6] tracking-[-0.028em] text-white mb-3">{label}</h3>
        <p className="font-body text-[16px] leading-[1.6] tracking-[-0.031em] text-[#818089]">{description}</p>
      </div>
    </div>
  );
}

// ─── Data ──────────────────────────────────────────────────────────

const features = [
  {
    icon: Brain,
    title: "AI Keyframe Generation",
    description: "Describe the motion you want in plain language. Motion AI translates your intent into precise keyframes in seconds.",
    size: "large" as const,
  },
  {
    icon: Zap,
    title: "Smart Easing Engine",
    description: "Automatically applies industry-standard easing curves. Choose from Ease Out Expo, Spring Physics, Custom Bezier, and more.",
    size: "large" as const,
  },
  {
    icon: Layers,
    title: "Layer Intelligence",
    description: "Understands layer hierarchy and relationships. Animate entire compositions coherently with a single prompt.",
    size: "small" as const,
  },
  {
    icon: RefreshCw,
    title: "Motion Variations",
    description: "Generate multiple animation variants instantly. Explore creative directions without starting from scratch.",
    size: "small" as const,
  },
  {
    icon: Download,
    title: "Preset Library",
    description: "Access 200+ curated motion presets optimised for UI, broadcast, and social media formats.",
    size: "small" as const,
  },
];

const stats = [
  { value: "+220%", label: "Workflow Efficiency", description: "Designers complete projects over twice as fast in just two months." },
  { value: "95%", label: "Time Saved on Keyframes", description: "AI-generated keyframes cut manual work by over 90%." },
  { value: "5x", label: "More Creative Output", description: "Motion variations multiply your creative exploration." },
  { value: "10,000+", label: "Motion Designers Trust Us", description: "Our plugin powers motion workflows worldwide." },
];

const benefits = [
  { icon: Brain, title: "Intelligent Execution", description: "AI continuously enhances motion quality with minimal manual input." },
  { icon: Layers, title: "Seamless Control", description: "Manage animations from a centralized, intuitive panel inside AE." },
  { icon: Shield, title: "Non-Destructive", description: "Every generated keyframe is fully editable. Your workflow stays yours." },
  { icon: Zap, title: "Blazing-Fast Setup", description: "No complicated config. Install, activate, and start animating in minutes." },
  { icon: MonitorSmartphone, title: "Multi-Device Access", description: "Use your license on up to 2 devices. Switch workstations seamlessly." },
];

function formatPrice(amount: number, currency: Currency) {
  if (currency === "BDT") return `৳${Math.round(amount * BDT_RATE).toLocaleString()}`;
  return `$${amount}`;
}

function buildPricingPlans(pricing: Pricing, currency: Currency, buyHref: string) {
  return [
    {
      name: "Trial",
      price: "Free",
      period: `${pricing.trial_days} days`,
      description: "Try every feature with no restrictions.",
      features: [
        `Full feature access for ${pricing.trial_days} days`,
        "Up to 2 devices",
        "Community support",
        "All preset library",
      ],
      cta: "Get Started",
      ctaHref: "/register/",
      popular: false,
    },
    {
      name: "Standard",
      price: formatPrice(pricing.price_per_seat_year, currency),
      period: "/ seat / year",
      description: "For solo motion designers and freelancers.",
      features: [
        "All features unlocked",
        "Up to 2 devices",
        "1 year of free updates",
        "Email support",
        "Lifetime access to current version",
      ],
      cta: "Start Animating",
      ctaHref: buyHref,
      popular: true,
    },
    {
      name: "Team",
      price: formatPrice(pricing.team_price_per_seat_year, currency),
      period: "/ seat / year",
      description: `${pricing.team_threshold}+ seats. Best for studios and agencies.`,
      features: [
        "Everything in Standard",
        `Volume discount (${pricing.team_threshold}+ seats)`,
        "Up to 2 devices per seat",
        "Priority support",
        "Team license management",
      ],
      cta: "Contact Sales",
      ctaHref: `mailto:${SUPPORT_EMAIL}`,
      popular: false,
    },
  ];
}

// ─── Page ──────────────────────────────────────────────────────────

export default function LandingPage() {
  const { pricing } = usePricing();
  const { user } = useAuth();
  const [currency, setCurrency] = useState<Currency>("USD");

  const hasActiveLicense = user?.active_license?.status === "active";

  function getBuyHref() {
    if (!user) return "/login/?callbackUrl=/dashboard/billing/";
    if (hasActiveLicense) return "/dashboard/";
    return "/dashboard/billing/";
  }

  const pricingPlans = buildPricingPlans(pricing, currency, getBuyHref());

  // Section refs for scroll animation
  const hero = useInView(0.1);
  const trusted = useInView(0.2);
  const featSection = useInView(0.1);
  const valueSection = useInView(0.1);
  const howSection = useInView(0.1);
  const statsSection = useInView(0.1);
  const benefitsSection = useInView(0.1);
  const pricingSection = useInView(0.1);
  const ctaSection = useInView(0.1);

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[700px] rounded-full opacity-20 blur-[150px]"
            style={{ background: "radial-gradient(ellipse, #7350ff, transparent 70%)" }}
          />
          <div
            className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.07] blur-[120px]"
            style={{ background: "radial-gradient(ellipse, #863aff, transparent 70%)" }}
          />
        </div>

        <div ref={hero.ref} className="relative mx-auto max-w-7xl px-4 sm:px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Text */}
            <div className={cn("fade-in-up", hero.visible && "visible")}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] mb-8">
                <span className="text-xs font-semibold text-[var(--color-primary-400)] font-body">Latest release</span>
                <ChevronRight className="h-3 w-3 text-[var(--color-text-muted)]" />
                <span className="text-xs text-[var(--color-text-secondary)] font-body">Now available for AE 2022–2025</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-heading font-medium text-white leading-[1.05] mb-6 tracking-tight">
                AI-Powered Motion Design{" "}
                <span className="gradient-text">Inside After Effects</span>
              </h1>

              <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-lg mb-8 font-body leading-relaxed">
                Generate keyframes, apply smart easing, and create stunning animations
                with natural language prompts — without leaving After Effects.
              </p>

              {/* Social proof */}
              <div className="flex items-center gap-3 mb-10">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-9 h-9 rounded-full bg-[var(--color-bg-elevated)] border-2 border-[var(--color-bg-base)] flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[var(--color-primary-400)] font-body">
                        {["J", "K", "M"][i - 1]}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-[var(--color-text-muted)] font-body">
                  Join <span className="text-white font-semibold">10,000+</span> motion designers
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <SpButton href="/register/">
                  Start Free Today <ArrowRight className="h-4 w-4" aria-hidden />
                </SpButton>
                <SpButton href="/#features" variant="secondary">
                  <Play className="h-4 w-4" aria-hidden /> Watch Demo
                </SpButton>
              </div>
            </div>

            {/* Right: Dashboard preview */}
            <div className={cn("fade-in-up delay-2", hero.visible && "visible")}>
              <div className="relative">
                <div className="relative rounded-[24px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-1 shadow-[0_0_80px_0_rgba(115,80,255,0.12)]">
                  <div className="rounded-xl bg-[var(--color-bg-elevated)] aspect-[4/3] flex items-center justify-center overflow-hidden">
                    <div className="text-center p-8">
                      <Sparkles className="h-16 w-16 text-[var(--color-primary-500)] mx-auto mb-4 animate-pulse" />
                      <p className="text-sm text-[var(--color-text-muted)] font-body mb-2">Motion AI Panel</p>
                      <p className="text-xs text-[var(--color-text-muted)] font-body opacity-60">Plugin preview coming soon</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] opacity-40 -z-10" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] opacity-30 -z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trusted By (marquee) ── */}
      <section ref={trusted.ref} className={cn("py-12 border-y border-white/[0.06] overflow-hidden fade-in", trusted.visible && "visible")}>
        <p className="text-center text-sm text-white/50 font-body font-medium mb-8 tracking-widest uppercase">
          Trusted by motion designers worldwide
        </p>
        <div className="marquee-mask relative overflow-hidden" role="list" aria-label="Trusted by">
          <div className="flex w-max animate-marquee">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center gap-20 pr-20" aria-hidden={copy === 1 || undefined}>
                {[...BRAND_LOGOS, ...BRAND_LOGOS].map((logo, i) => (
                  <span key={i} role={copy === 0 && i < BRAND_LOGOS.length ? "listitem" : undefined} aria-label={logo.name}>
                    <BrandLogo logo={logo} />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-28 lg:py-36">
        <div ref={featSection.ref} className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className={cn("text-center mb-16 fade-in-up", featSection.visible && "visible")}>
            <span className="inline-block px-4 py-1.5 rounded-full border border-[var(--color-primary-500)]/30 bg-[var(--color-primary-500)]/10 text-xs font-semibold text-[var(--color-primary-400)] font-body mb-5">
              Features
            </span>
            <h2 className="text-4xl sm:text-[48px] font-heading font-medium text-white mb-5 leading-tight tracking-tight">
              Everything You Need to{" "}
              <span className="gradient-text">Animate Faster</span>
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto font-body">
              Power-packed tools built to turn ideas into polished animations inside After Effects.
            </p>
          </div>

          {/* 2 large + 3 small grid like ScalePro */}
          <div className="grid gap-5 sm:grid-cols-2">
            {features.filter(f => f.size === "large").map((f, i) => (
              <div
                key={f.title}
                className={cn(
                  "group p-8 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] hover-lift fade-in-up",
                  featSection.visible && "visible",
                  i === 0 ? "delay-1" : "delay-2"
                )}
              >
                <div className="mb-20 sm:mb-28 relative">
                  <div className="w-14 h-14 rounded-xl bg-[var(--color-primary-500)]/10 border border-[var(--color-primary-500)]/20 flex items-center justify-center icon-glow">
                    <f.icon className="h-6 w-6 text-[var(--color-primary-400)]" />
                  </div>
                </div>
                <h3 className="text-xl font-heading font-medium text-white mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] font-body leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-5 sm:grid-cols-3 mt-5">
            {features.filter(f => f.size === "small").map((f, i) => (
              <div
                key={f.title}
                className={cn(
                  "group p-6 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] hover-lift fade-in-up",
                  featSection.visible && "visible",
                  `delay-${i + 3}`
                )}
              >
                <div className="mb-14 sm:mb-20 relative">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-500)]/10 border border-[var(--color-primary-500)]/20 flex items-center justify-center icon-glow">
                    <f.icon className="h-5 w-5 text-[var(--color-primary-400)]" />
                  </div>
                </div>
                <h3 className="text-lg font-heading font-medium text-white mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] font-body leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Value Proposition with Glow Beam ── */}
      <section className="pt-28 lg:pt-36 relative overflow-x-clip">
        <div ref={valueSection.ref} className={cn("relative mx-auto max-w-5xl px-4 sm:px-6 text-center fade-in-up", valueSection.visible && "visible")}>
          <span className="inline-block px-4 py-1.5 rounded-full border border-[var(--color-primary-500)]/30 bg-[var(--color-primary-500)]/10 text-xs font-semibold text-[var(--color-primary-400)] font-body mb-8">
            Motion AI
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-heading font-medium text-[var(--color-text-secondary)] leading-tight mb-8">
            Our plugin brings{" "}
            <span className="gradient-text">AI keyframes</span>,{" "}
            <span className="text-white font-bold">smart easing</span>, and{" "}
            <span className="gradient-text">motion presets</span>{" "}
            together in one seamless experience — so you can focus on{" "}
            <span className="gradient-text">creating</span>, not clicking.
          </h2>
        </div>

        <div className="mt-10">
          <LightBeam />
        </div>
      </section>

      {/* ── How it works (sits where the beam lands) ── */}
      <section className="relative z-10 pb-28 lg:pb-36">
        <div ref={howSection.ref} className="mx-auto max-w-[1312px] px-4">
          <div className={cn("sp-achieve scale-in", howSection.visible && "visible")}>
            <div className="sp-achieve__inner">
              <h2 className="relative text-center font-body text-2xl sm:text-[32px] font-medium leading-[1.3] tracking-[-0.063em] text-white mb-10 sm:mb-12">
                What can you achieve with Motion AI?
              </h2>
              <div className="relative flex flex-col md:flex-row gap-10 md:gap-16">
                {[
                  { icon: Download, title: "Install & animate instantly", desc: "Download the plugin, sign in, and start generating keyframes in under 2 minutes." },
                  { icon: Brain, title: "Let AI handle the motion", desc: "AI-driven keyframes and easing — no manual effort needed." },
                  { icon: Zap, title: "Know what's working, in real time", desc: "See your animation take shape instantly. Tweak values in After Effects as usual." },
                ].map((item, i) => (
                  <Fragment key={item.title}>
                    {i > 0 && <div className="sp-achieve__line hidden md:block" aria-hidden />}
                    <div className="flex-1 flex flex-col">
                      <item.icon className="h-8 w-8 text-white mb-6" strokeWidth={1.5} aria-hidden />
                      <h3 className="font-body text-[18px] font-medium leading-[1.6] tracking-[-0.036em] text-white mb-3">{item.title}</h3>
                      <p className="font-body text-[16px] font-medium leading-[1.6] tracking-[-0.031em] text-[#818089]">{item.desc}</p>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Statistics ── */}
      <section className="py-[100px]">
        <div ref={statsSection.ref} className="mx-auto max-w-[1312px] px-4">
          <div className={cn("text-center mb-12 sm:mb-16 fade-in-up", statsSection.visible && "visible")}>
            <span className="sp-caption mb-4">Our statistics</span>
            <h2 className="sp-h2">Proven results you can measure</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <AnimatedStat key={s.label} {...s} delay={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits Grid ── */}
      <section className="py-[100px]">
        <div ref={benefitsSection.ref} className="mx-auto max-w-[1312px] px-4">
          <div className={cn("text-center mb-12 sm:mb-16 fade-in-up", benefitsSection.visible && "visible")}>
            <span className="sp-caption mb-4">Designed for Impact</span>
            <h2 className="sp-h2 mx-auto max-w-[640px] mb-4">Built for results. Powered by intelligence.</h2>
            <p className="font-body text-[18px] leading-[1.6] tracking-[-0.028em] text-[#818089] max-w-[640px] mx-auto">
              Delivering faster animation through AI-powered automation and intuitive design.
            </p>
          </div>

          {[benefits.slice(0, 3), benefits.slice(3)].map((row, r) => (
            <Fragment key={r}>
              {r === 1 && <div className="sp-benefits__hr" aria-hidden />}
              <div className={cn("grid", r === 0 ? "md:grid-cols-3" : "md:grid-cols-2 max-w-[960px] mx-auto")}>
                {row.map((b, i) => (
                  <div
                    key={b.title}
                    className={cn("sp-benefit fade-in-up", benefitsSection.visible && "visible", `delay-${r * 3 + i + 1}`)}
                  >
                    <div className="sp-icon-tile mb-9">
                      <b.icon className="h-7 w-7 text-white" strokeWidth={1.5} aria-hidden />
                    </div>
                    <h3 className="font-body text-[20px] font-medium leading-[1.6] tracking-[-0.025em] text-white mb-4">{b.title}</h3>
                    <p className="font-body text-[16px] leading-[1.6] tracking-[-0.031em] text-[#818089] max-w-[300px]">{b.description}</p>
                  </div>
                ))}
              </div>
            </Fragment>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-28 lg:py-36">
        <div ref={pricingSection.ref} className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className={cn("text-center mb-16 fade-in-up", pricingSection.visible && "visible")}>
            <span className="inline-block px-4 py-1.5 rounded-full border border-[var(--color-primary-500)]/30 bg-[var(--color-primary-500)]/10 text-xs font-semibold text-[var(--color-primary-400)] font-body mb-5">
              Pricing
            </span>
            <h2 className="text-4xl sm:text-[48px] font-heading font-medium text-white mb-5 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto font-body">
              One year of updates included. After that, keep using your version forever or renew for new features.
            </p>

            {/* Currency toggle */}
            <div className="mt-8 flex items-center justify-center gap-1 p-1 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] w-fit mx-auto">
              {(["USD", "BDT"] as Currency[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={cn(
                    "px-6 py-2.5 rounded-full text-sm font-medium font-body transition-all duration-300",
                    currency === c
                      ? "bg-[#863aff] text-white shadow-lg shadow-[#863aff]/25"
                      : "text-[var(--color-text-muted)] hover:text-white"
                  )}
                >
                  {c === "USD" ? "$ USD" : "৳ BDT"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3 max-w-5xl mx-auto items-start">
            {pricingPlans.map((plan, i) => (
              <div
                key={plan.name}
                className={cn(
                  "relative rounded-[16px] border p-8 pb-7 flex flex-col fade-in-up",
                  plan.popular
                    ? "pricing-popular border-[rgba(115,80,255,0.4)] bg-[var(--color-bg-surface)] shadow-[0_0_50px_-12px_rgba(115,80,255,0.25)]"
                    : "border-[var(--color-border)] bg-[var(--color-bg-surface)] hover-lift",
                  pricingSection.visible && "visible",
                  `delay-${i + 1}`
                )}
              >
                <div className="flex items-center gap-2 mb-5">
                  <p className="text-lg font-heading font-medium text-white">{plan.name}</p>
                  {plan.popular && (
                    <span className="px-2.5 py-1 rounded-full bg-[#863aff] text-[10px] font-bold text-white uppercase tracking-wider">
                      Most Popular
                    </span>
                  )}
                </div>

                <div className="mb-3 flex items-end gap-1">
                  <span className="text-[32px] font-heading font-medium text-white tracking-tight">{plan.price}</span>
                  <span className="text-sm text-[var(--color-text-muted)] font-body mb-2">{plan.period}</span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] font-body mb-7">{plan.description}</p>

                <ul className="flex flex-col gap-3.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[var(--color-text-secondary)] font-body">
                      <Check className="h-4 w-4 text-[var(--color-primary-400)] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <SpButton href={plan.ctaHref} variant={plan.popular ? "primary" : "secondary"} block>
                  {plan.cta}
                </SpButton>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-[var(--color-text-muted)] font-body">
            Bank transfer, bKash, Payoneer & Wise available.{" "}
            <Link href="/dashboard/billing/" className="text-[var(--color-primary-400)] hover:underline">
              Learn more &rarr;
            </Link>
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-[100px]">
        <div ref={ctaSection.ref} className="mx-auto max-w-[1312px] px-4">
          <div className={cn("sp-cta scale-in", ctaSection.visible && "visible")}>
            <div className="mx-auto max-w-[720px] px-6 py-16 sm:py-[100px] text-center">
              <h2 className="font-body text-[40px] sm:text-[48px] lg:text-[64px] font-medium leading-[1.2] tracking-[-0.031em] text-white mb-4">
                Ready to Accelerate Your <span className="gradient-text">Workflow</span>?
              </h2>
              <p className="font-body text-[16px] sm:text-[18px] leading-[1.6] tracking-[-0.031em] text-[#818089] mb-12 max-w-[600px] mx-auto">
                Generate stunning animations, save hours of keyframing, and scale your creative output — all inside After Effects.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <SpButton href="/register/">
                  Get Started Now <ArrowRight className="h-4 w-4" aria-hidden />
                </SpButton>
                <SpButton href="/#pricing" variant="secondary">
                  View Pricing
                </SpButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
