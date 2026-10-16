import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "Features",  href: "/#features" },
    { label: "Pricing",   href: "/#pricing" },
    { label: "Changelog", href: "/changelog" },
    { label: "Docs",      href: "/docs" },
  ],
  Account: [
    { label: "Sign in",    href: "/login" },
    { label: "Register",   href: "/register" },
    { label: "Dashboard",  href: "/dashboard" },
  ],
  Legal: [
    { label: "Privacy Policy",  href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy",   href: "/refund" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <p className="text-h5 gradient-text font-heading mb-2">Motion AI</p>
            <p className="text-xs text-[var(--color-text-muted)] font-body max-w-xs leading-relaxed">
              Professional AI-powered motion design plugin for Adobe After Effects. Create stunning animations faster.
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-3 font-body">
                {group}
              </p>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors font-body"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-[var(--color-border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[var(--color-text-muted)] font-body">
            &copy; {new Date().getFullYear()} Motion AI. All rights reserved.
          </p>
          <p className="text-xs text-[var(--color-text-muted)] font-body">
            Built for Adobe After Effects
          </p>
        </div>
      </div>
    </footer>
  );
}
