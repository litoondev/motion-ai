"use client";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import {
  ArrowRight, Layers, Zap, Clock, Scissors, Anchor,
  Palette, Sparkles, Cpu,
  Link2, Download, MessageSquare, Wand2, Plug2,
  Copy, Crop,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SpButton } from "@/components/marketing/sp-button";

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

type Feature = {
  icon: React.ElementType;
  name: string;
  nameEn: string;
  tagline: string;
  bullets: string[];
  img?: string;
  img2?: string;
  ai?: boolean;
  isNew?: boolean;
  wide?: boolean;
};

const categories = [
  { id: "composition", label: "Composition" },
  { id: "animation",   label: "Animation"   },
  { id: "layers",      label: "Layers"      },
  { id: "color",       label: "Color"       },
  { id: "shapes",      label: "Shapes"      },
  { id: "crop",        label: "Crop"        },
  { id: "import",      label: "Import"      },
  { id: "ai",          label: "AI Tools"    },
];

const featuresByCategory: Record<string, { label: string; caption: string; features: Feature[] }> = {
  composition: {
    label: "Composition & Project",
    caption: "Set up, duplicate, and organise everything before the first keyframe.",
    features: [
      {
        icon: Layers, name: "Composition Setup", nameEn: "Comp",
        tagline: "Create comps with exact dimensions, frame rate, and duration — all inside the panel.",
        img: "39.png", img2: "38.png",
        bullets: [
          "Live aspect-ratio preview as you type width & height",
          "Searchable size, duration, and frame-rate presets — save your own",
          "Apply to the active comp without creating a new one",
          "Aspect-ratio lock + common ratio shortcuts (16:9, 9:16, 1:1…)",
        ],
      },
      {
        icon: Copy, name: "True Comp Duplicator", nameEn: "Duplicator",
        tagline: "Duplicate compositions with fully independent copies of every nested sub-comp.",
        img: "37.png",
        bullets: [
          "Each nested comp gets its own copy — no shared state with the original",
          "Rename via prefix / suffix, find & replace, or auto-increment",
          "Update comp() and layer() expressions to point at the new comps",
          "Live preview tree shows exactly which comps will be copied",
        ],
      },
    ],
  },

  animation: {
    label: "Animation & Easing",
    caption: "Precision timing control and expressive curves without leaving the panel.",
    features: [
      {
        icon: Zap, name: "Easing Curve Editor", nameEn: "Ease",
        tagline: "Drag a live speed curve and watch selected keyframes update in real time.",
        img: "25.png", img2: "22.png",
        bullets: [
          "Drag anywhere on the curve — peak follows the cursor live",
          "Shift: adjust strength keeping the curve centred",
          "Alt: edit only the In or Out side independently",
          "Draggable, groupable presets with right-click menu",
        ],
      },
      {
        icon: Clock, name: "Keystone — Keyframe Retimer", nameEn: "Keystone",
        tagline: "Full control over keyframe and layer timing without losing easing curves.",
        img: "30.png",
        bullets: [
          "Align first / last keyframe to playhead or layer in / out point",
          "Stagger, distribute, stretch, flip, copy/paste keyframes",
          "Ease, Hold, tangent, roving — all preserved on every move",
          "Layer tab: align, distribute, stagger, reorder layers",
        ],
      },
      {
        icon: Scissors, name: "Trim to Keys", nameEn: "Trim",
        tagline: "Snap a layer's In / Out points to its first and last keyframe.",
        img: "31.png",
        bullets: [
          "Timeline strip preview shows how much will be trimmed",
          "Trim only the start, only the end, or both sides",
        ],
      },
      {
        icon: Clock, name: "Time & Decomp", nameEn: "Time",
        tagline: "Timeline scrubbing and pre-comp management in one panel.",
        img: "36.png",
        bullets: [
          "Slider scrubs to any frame; current frame & time shown live",
          "Jump −15/−10/−5/+5/+10/+15 frames in one click",
          "Enter: open a pre-comp without disturbing the parent comp",
          "Decompose: unzip a pre-comp, all timing & parenting preserved",
        ],
      },
    ],
  },

  layers: {
    label: "Layer & Transform",
    caption: "Precision positioning and layer management After Effects doesn't give you.",
    features: [
      {
        icon: Anchor, name: "Anchor Point Snap", nameEn: "Anchor",
        tagline: "Move the anchor point to any of 9 positions without shifting the layer.",
        img: "26.png",
        bullets: [
          "3×3 grid — top-left through bottom-right in one click",
          "Custom X% / Y% for any exact position",
        ],
      },
    ],
  },

  color: {
    label: "Color & Gradient",
    caption: "A full colour suite that writes directly to AE shape layer properties.",
    features: [
      {
        icon: Palette, name: "Color Editor", nameEn: "Color",
        tagline: "Edit Fill and Stroke colours with a full picker and save swatches.",
        img: "24.png",
        bullets: [
          "Hex, HSL, RGB; hue rail and opacity rail",
          "Stroke width 0–200 px slider (up to 10,000 px manually)",
          "Stroke cap: Butt, Round, Square",
          "Swatch library for quick colour recall",
        ],
      },
      {
        icon: Sparkles, name: "Gradient Editor", nameEn: "Gradients",
        tagline: "Build multi-stop gradients and apply them as native AE gradients.",
        img: "23.png",
        bullets: [
          "Drag stops anywhere; Linear, Radial, and Conic types",
          "Reverse, save to library, one-click reapply",
          "Solid ↔ Gradient toggle on any shape layer",
          "Generates a native .ffx preset — no plugin needed at render time",
        ],
      },
    ],
  },

  shapes: {
    label: "Shape & Vector Operations",
    caption: "Power tools for working with shape layers and Illustrator files.",
    features: [
      {
        icon: Wand2, name: "Explode Shapes", nameEn: "Explode",
        tagline: "Six shape and vector operations in one panel — every button always active.",
        img: "34.png", wide: true,
        bullets: [
          "Explode: each top-level group becomes its own layer",
          "Merge: combine multiple shape layers (paths, fills, strokes, expressions, keyframes all preserved)",
          "Convert: .ai / .pdf → native AE layers including editable text and images",
          "Remove Artboard: delete the invisible bounding rect Illustrator imports add",
          "Select Fills / Select Strokes: batch-select every fill or stroke in the comp",
        ],
      },
    ],
  },

  crop: {
    label: "Composition Cropping",
    caption: "Resize the canvas to fit exactly what you need.",
    features: [
      {
        icon: Crop, name: "Auto Crop", nameEn: "Auto Crop",
        tagline: "Trim the canvas to the real content bounds with three detection modes.",
        img: "35.png", wide: true,
        bullets: [
          "Crop to Content: current frame only",
          "Crop to Duration: scans every keyframe and layer in/out point across the full animation",
          "Crop to Mask: crop to a specific selected mask shape",
          "Measures actual rendered pixels — effects, track mattes, blend modes all included",
          "3D layers: measured through the camera; pre-compose offered to avoid shifting",
        ],
      },
    ],
  },

  import: {
    label: "Import & Connectivity",
    caption: "Bring artwork from any app into AE as fully editable native layers.",
    features: [
      {
        icon: Link2, name: "Link — Illustrator, Photoshop & Figma", nameEn: "Link",
        tagline: "Import and stay live-linked to artwork in Illustrator, Photoshop, and Figma.",
        img: "33.png",
        bullets: [
          "Illustrator: shapes, editable text, paths, gradients, dashes, clipping masks",
          "Photoshop: shape → AE shape; text → AE text; blend modes, clipping masks as track mattes",
          "Figma: Motion keyframes and Smart Animate → AE keyframes with matching easing",
          "Update: edit in source app, hit Update in AE — keyframes and transforms survive",
        ],
      },
      {
        icon: Download, name: "Smart Import", nameEn: "Smart Import",
        tagline: "Lottie, SVG, and HTML banners become native AE comps with real keyframes.",
        img: "32.png", isNew: true,
        bullets: [
          "Lottie: comps, shapes, text, masks, effects, expressions, keyframes with correct easing",
          "SVG: groups, paths, fills, gradients; SMIL / CSS animations → keyframes",
          "HTML page / ZIP banner: GSAP / CSS / JS animations → keyframes",
          "Smart reduction: minimum keyframes while preserving the easing",
        ],
      },
    ],
  },

  ai: {
    label: "AI-Powered Tools",
    caption: "Three tools that use AI to handle the work that used to take the longest.",
    features: [
      {
        icon: MessageSquare, ai: true,
        name: "Auto Captions & Style Sync", nameEn: "Captions",
        tagline: "Transcribe audio to styled, synced caption layers inside After Effects.",
        img: "29.png", wide: true,
        bullets: [
          "Transcribes the comp's audio automatically — 30+ languages",
          "Bengali.AI specialist Whisper model for Bengali",
          "Split by words: one layer per spoken word, precisely timed",
          "26 built-in styles: subtitles, karaoke, neon, blur-in, word reveal, and more",
          "Sync All: restyle one caption and all others update to match",
          "Local offline engine (no API key needed) or OpenAI / Groq / custom server",
        ],
      },
      {
        icon: Cpu, ai: true,
        name: "AI Matte — Background Removal", nameEn: "AI Matte",
        tagline: "Hair-accurate background removal that runs on your GPU as a native AE effect.",
        img: "27.png",
        bullets: [
          "Auto (AI): subject detected frame-by-frame automatically",
          "Clean Plate: uses a background reference shot — no AI model needed",
          "Person · Fast (MODNet): ~30 ms/frame",
          "Best · BiRefNet: ~200 ms/frame for fine hair and fur",
          "Footage is never re-encoded or uploaded anywhere",
        ],
      },
      {
        icon: Plug2, ai: true,
        name: "AI Connect — MCP", nameEn: "AI Connect",
        tagline: "Let Claude or ChatGPT control After Effects directly through Motion AI.",
        img: "28.png",
        bullets: [
          "Claude Desktop: one-click installer",
          "Claude Code: runs claude mcp add automatically",
          "ChatGPT: secure tunnel URL → paste in ChatGPT connector",
          "AI can read the project, run any Motion AI tool, set keyframes and expressions",
          "Every AI change is one undo step in Edit > History",
        ],
      },
    ],
  },
};

// ─── Feature Card ──────────────────────────────────────────────────
function FeatureCard({ feature, index, visible, wide }: {
  feature: Feature; index: number; visible: boolean; wide?: boolean
}) {
  const isAI = !!feature.ai;

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-[24px] overflow-hidden border fade-in-up",
        "bg-[var(--color-bg-surface)]",
        isAI
          ? "border-[var(--color-primary-500)]/25 shadow-[0_0_0_1px_rgba(115,80,255,0.1)]"
          : "border-[var(--color-border)]",
        wide && "md:col-span-2",
        visible && "visible",
        `delay-${Math.min(index + 1, 5)}`
      )}
    >
      {/* Screenshot */}
      {feature.img && (
        <div className={cn(
          "relative overflow-hidden bg-[#030010]",
          feature.img2 && !wide ? "grid grid-cols-2" : ""
        )}>
          {isAI && (
            <div
              className="pointer-events-none absolute inset-0 opacity-10 z-10"
              style={{ background: "radial-gradient(ellipse at 50% 0%, #7350ff, transparent 70%)" }}
            />
          )}
          <Image
            src={`/plugin-ui/${feature.img}`}
            alt={feature.name}
            width={1456}
            height={816}
            className="w-full h-auto object-cover"
            quality={90}
          />
          {feature.img2 && !wide && (
            <Image
              src={`/plugin-ui/${feature.img2}`}
              alt={`${feature.name} — presets`}
              width={1456}
              height={816}
              className="w-full h-auto object-cover"
              quality={90}
            />
          )}
        </div>
      )}

      {/* Text */}
      <div className="flex flex-col flex-1 p-6 pt-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              isAI
                ? "bg-[var(--color-primary-500)]/10 border border-[var(--color-primary-500)]/20 icon-glow"
                : "bg-white/[0.05] border border-white/10"
            )}
          >
            <feature.icon className={cn("h-4 w-4", isAI ? "text-[var(--color-primary-400)]" : "text-white/70")} />
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {isAI && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--color-primary-500)]/15 border border-[var(--color-primary-500)]/30 text-[10px] font-bold text-[var(--color-primary-400)] font-body tracking-wide uppercase">
                <Sparkles className="h-2.5 w-2.5" /> AI
              </span>
            )}
            {feature.isNew && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 font-body tracking-wide uppercase">
                New
              </span>
            )}
            <span className="text-[10px] font-mono text-white/20">{feature.nameEn}</span>
          </div>
        </div>

        <h3 className="text-[16px] font-heading font-medium text-white leading-snug mb-1.5">
          {feature.name}
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] font-body leading-relaxed mb-4">
          {feature.tagline}
        </p>

        <ul className="flex flex-col gap-1.5 mt-auto">
          {feature.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-[13px] font-body text-[var(--color-text-muted)] leading-snug">
              <span className="mt-[5px] w-1 h-1 rounded-full shrink-0" style={{ background: isAI ? "#7350ff" : "rgba(255,255,255,0.3)" }} />
              {b}
            </li>
          ))}
        </ul>
      </div>

      {isAI && (
        <div
          className="absolute bottom-0 left-8 right-8 h-px opacity-40"
          style={{ background: "linear-gradient(90deg, transparent, #7350ff, transparent)" }}
        />
      )}
    </div>
  );
}

// ─── Category Section ──────────────────────────────────────────────
function CategorySection({ id, data }: { id: string; data: typeof featuresByCategory[string] }) {
  const { ref, visible } = useInView(0.06);
  const isAI = id === "ai";

  return (
    <section id={id} className="py-16 lg:py-20 scroll-mt-24">
      <div ref={ref} className={cn("fade-in-up mb-10", visible && "visible")}>
        <div className="flex items-center gap-4 mb-2">
          <span className={cn(
            "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold font-body tracking-wide shrink-0",
            isAI
              ? "border-[var(--color-primary-500)]/30 bg-[var(--color-primary-500)]/10 text-[var(--color-primary-400)]"
              : "border-[var(--color-border)] bg-white/[0.04] text-[var(--color-text-muted)]"
          )}>
            {isAI && <Sparkles className="h-3 w-3" />}
            {data.label}
          </span>
          <div className="flex-1 h-px bg-[var(--color-border)]" />
        </div>
        <p className="text-[var(--color-text-secondary)] font-body text-base max-w-xl">{data.caption}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {data.features.map((f, i) => (
          <FeatureCard key={f.name} feature={f} index={i} visible={visible} wide={f.wide} />
        ))}
      </div>
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────────
export default function FeaturesPage() {
  const [activeId, setActiveId] = useState<string>("composition");
  const hero = useInView(0.1);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveId(e.target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    categories.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-14 lg:pt-28 lg:pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-[0.12] blur-[160px]"
            style={{ background: "radial-gradient(ellipse, #7350ff, transparent 70%)" }}
          />
        </div>

        <div ref={hero.ref} className={cn("relative mx-auto max-w-7xl px-4 sm:px-6 fade-in-up", hero.visible && "visible")}>
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 rounded-full border border-[var(--color-primary-500)]/30 bg-[var(--color-primary-500)]/10 text-xs font-semibold text-[var(--color-primary-400)] font-body mb-6">
              Full Feature Reference
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-[68px] font-heading font-medium text-white leading-[1.05] mb-5 tracking-tight">
              18 tools inside{" "}
              <span className="gradient-text">After Effects</span>
            </h1>
            <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-xl font-body leading-relaxed mb-8">
              Every feature ships in a single panel. No separate apps, no context
              switching — just your workflow, accelerated.
            </p>

            <div className="flex flex-wrap gap-6 mb-10">
              {[
                { num: "18", label: "Features" },
                { num: "3",  label: "AI-powered tools" },
                { num: "AE 2022–2026", label: "Compatible" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-heading font-medium text-white leading-none mb-1">{s.num}</p>
                  <p className="text-xs text-[var(--color-text-muted)] font-body tracking-wide uppercase">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <SpButton href="/register/">
                Start Free Today <ArrowRight className="h-4 w-4" />
              </SpButton>
              <SpButton href="/#pricing" variant="secondary">View Pricing</SpButton>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sticky Category Pill Nav ── */}
      <div className="sticky top-0 z-20 bg-[var(--color-bg-base)]/85 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className={cn(
                "shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold font-body transition-all duration-200",
                activeId === c.id
                  ? "bg-[var(--color-primary-500)] text-white shadow-lg shadow-[var(--color-primary-500)]/20"
                  : "bg-white/[0.05] text-[var(--color-text-muted)] hover:text-white hover:bg-white/[0.08]"
              )}
              onClick={() => setActiveId(c.id)}
            >
              {c.label}
            </a>
          ))}
        </div>
      </div>

      {/* ── Feature Sections ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 divide-y divide-[var(--color-border)]">
        {Object.entries(featuresByCategory).map(([id, data]) => (
          <CategorySection key={id} id={id} data={data} />
        ))}
      </div>

      {/* ── CTA ── */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-[1312px] px-4">
          <div className="sp-cta">
            <div className="mx-auto max-w-[600px] px-6 py-16 sm:py-20 text-center">
              <h2 className="font-body text-[36px] sm:text-[48px] font-medium leading-[1.2] tracking-[-0.031em] text-white mb-4">
                All 18 features,{" "}
                <span className="gradient-text">one free trial</span>
              </h2>
              <p className="font-body text-[16px] sm:text-[18px] leading-[1.6] tracking-[-0.031em] text-[#818089] mb-10 max-w-[480px] mx-auto">
                Every tool is fully available from day one. No paywalls inside the plugin.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <SpButton href="/register/">
                  Get Started for Free <ArrowRight className="h-4 w-4" />
                </SpButton>
                <SpButton href="/docs/" variant="secondary">Read the docs</SpButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
