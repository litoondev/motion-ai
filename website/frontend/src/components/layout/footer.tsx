import Link from "next/link";
import { Zap } from "lucide-react";
import { SUPPORT_EMAIL } from "@/lib/config";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Docs", href: "/docs/" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/login/" },
      { label: "Create account", href: "/register/" },
      { label: "Dashboard", href: "/dashboard/" },
    ],
  },
  {
    title: "Contact Us",
    links: [
      { label: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}` },
      { label: "Help & documentation", href: "/docs/" },
    ],
  },
];

const legal = [
  { label: "Privacy Policy", href: "/privacy/" },
  { label: "Terms of Service", href: "/terms/" },
  { label: "Refund Policy", href: "/refund/" },
];

const socials = [
  {
    label: "Facebook",
    d: "M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H7v4h2v9h4v-9h3l1-4h-4V9c0-.6.4-1 1-1z",
  },
  {
    label: "LinkedIn",
    d: "M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002zM7 8.48H3V21h4V8.48zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68z",
  },
  {
    label: "X",
    d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
];

export function Footer() {
  return (
    <footer className="relative mt-16 border-t border-white/10 bg-[#030014] font-body">
      <div className="sp-footer-horizon" aria-hidden />

      <div className="mx-auto max-w-[1312px] px-4 pt-[100px]">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-12">
          {/* Brand */}
          <div className="lg:max-w-[300px]">
            <Link href="/" className="inline-flex items-center gap-2.5 h-[34px]">
              <span className="w-[34px] h-[34px] rounded-[8px] bg-gradient-to-br from-[#7350ff] to-[#863aff] flex items-center justify-center">
                <Zap className="h-[18px] w-[18px] text-white" aria-hidden />
              </span>
              <span className="text-[26px] leading-none font-medium tracking-[-0.04em] text-white">
                Motion<span className="font-normal text-white/90"> AI</span>
              </span>
            </Link>
            <p className="mt-4 mb-12 text-[16px] leading-[1.6] tracking-[-0.031em] text-[#818089]">
              Smarter keyframes. Faster motion.
            </p>
            <ul className="flex items-center gap-7">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href="#" aria-label={s.label} className="sp-footer-link block">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d={s.d} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Link columns */}
          <nav aria-label="Footer" className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-10 lg:w-[780px]">
            {columns.map((col) => (
              <div key={col.title} className="flex flex-col gap-4">
                <p className="text-[20px] leading-[1.6] font-medium tracking-[-0.025em] text-white">{col.title}</p>
                <ul className="flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="sp-footer-link text-[16px] leading-[1.6] tracking-[-0.031em] break-words">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-16 border-t border-white/10 py-10 text-center text-[16px] leading-[1.6] tracking-[-0.031em] text-[#818089]">
          <p>
            Copyright &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> Motion AI
            {legal.map((l) => (
              <span key={l.href}>
                <span className="mx-2 text-white/20" aria-hidden>|</span>
                <Link href={l.href} className="sp-footer-link">{l.label}</Link>
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
