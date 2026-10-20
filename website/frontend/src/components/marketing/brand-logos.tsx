// Placeholder logomarks — replace with real customer logos you have permission to display.
type Logo = { name: string; mark: React.ReactNode };

const logos: Logo[] = [
  {
    name: "Keyline",
    mark: <path d="M4 20 12 4l8 16M8 13h8" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    name: "Framewise",
    mark: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <path d="M3 9h18M9 9v12" />
      </>
    ),
  },
  {
    name: "Lumen",
    mark: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" strokeLinecap="round" />
      </>
    ),
  },
  {
    name: "Orbitly",
    mark: (
      <>
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-30 12 12)" />
      </>
    ),
  },
  {
    name: "Vectra",
    mark: <path d="M3 5h5l4 11 4-11h5l-7 15h-4z" strokeLinejoin="round" />,
  },
  {
    name: "Motionlab",
    mark: <path d="M3 17c3-8 6-8 9 0s6 8 9 0" strokeLinecap="round" />,
  },
];

export function BrandLogo({ logo }: { logo: Logo }) {
  return (
    <span className="flex items-center gap-2.5 text-white/45 select-none">
      <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        {logo.mark}
      </svg>
      <span className="text-[22px] font-semibold tracking-[-0.03em] font-body whitespace-nowrap">{logo.name}</span>
    </span>
  );
}

export const BRAND_LOGOS = logos;
