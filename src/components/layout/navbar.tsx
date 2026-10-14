"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, ChevronDown, User, LayoutDashboard, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Features",  href: "/#features"  },
  { label: "Pricing",   href: "/#pricing"   },
  { label: "Changelog", href: "/changelog"  },
  { label: "Docs",      href: "/docs"       },
];

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-bg-base)]/90 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-h5 gradient-text font-heading">Motion AI</span>
          <span className="text-xs font-semibold text-[var(--color-text-muted)] border border-[var(--color-border)] rounded px-1.5 py-0.5">
            for AE
          </span>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
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

        {/* Right side */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {session.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt="" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-[var(--color-primary-700)] flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-[var(--color-primary-700)]" />
                  </div>
                )}
                <span className="max-w-[120px] truncate font-body">
                  {session.user.name ?? session.user.email}
                </span>
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", userMenuOpen && "rotate-180")} />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 top-10 w-52 card py-1 z-50"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-primary-600)] hover:bg-[var(--color-bg-elevated)] transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Shield className="h-4 w-4" /> Admin Panel
                    </Link>
                  )}
                  <div className="my-1 border-t border-[var(--color-border)]" />
                  <button
                    onClick={() => { signOut({ callbackUrl: "/" }); setUserMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-error)] hover:bg-[var(--color-bg-elevated)] transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button variant="cta" size="sm" asChild>
                <Link href="/register">Get started</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 pb-4">
          <ul className="mt-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded py-2 px-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {session ? (
            <div className="mt-3 flex flex-col gap-1 border-t border-[var(--color-border)] pt-3">
              <Link href="/dashboard" className="block py-2 px-2 text-sm text-[var(--color-text-secondary)]" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              {isAdmin && <Link href="/admin" className="block py-2 px-2 text-sm text-[var(--color-primary-600)]" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
              <button onClick={() => signOut({ callbackUrl: "/" })} className="text-left py-2 px-2 text-sm text-[var(--color-error)]">Sign out</button>
            </div>
          ) : (
            <div className="mt-3 flex gap-2 border-t border-[var(--color-border)] pt-3">
              <Button variant="secondary" size="sm" className="flex-1" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button variant="cta" size="sm" className="flex-1" asChild>
                <Link href="/register">Get started</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
