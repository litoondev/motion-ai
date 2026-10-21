"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, ChevronDown, User, LayoutDashboard, LogOut, Zap } from "lucide-react";
import { SpButton } from "@/components/marketing/sp-button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Features", href: "/features/" },
  { label: "Pricing",  href: "/#pricing"  },
  { label: "Docs",     href: "/docs/"     },
];

export function Navbar() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  async function logout() {
    await signOut();
    router.replace("/login/");
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-[#030014]/85 backdrop-blur-xl">
      <nav aria-label="Main" className="mx-auto grid max-w-[1312px] grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center px-4 py-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 h-[34px] justify-self-start">
          <div className="w-[34px] h-[34px] rounded-[8px] bg-gradient-to-br from-[#7350ff] to-[#863aff] flex items-center justify-center shrink-0">
            <Zap className="h-[18px] w-[18px] text-white" aria-hidden />
          </div>
          <span className="text-[26px] leading-none font-body font-medium tracking-[-0.04em] text-white">
            Motion<span className="font-normal text-white/90"> AI</span>
          </span>
        </Link>

        {/* Desktop nav pill */}
        <div className="hidden md:flex items-center rounded-[99px] border border-white/5 bg-white/5">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="sp-nav-link">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4 justify-self-end">
          {loading ? (
            <div className="hidden md:block h-[46px] w-36" aria-hidden />
          ) : user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-expanded={userMenuOpen}
                className="flex items-center gap-2 text-[16px] font-medium text-white hover:text-[#a78bfa] transition-colors duration-400"
              >
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-[#863aff] flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
                <span className="max-w-[140px] truncate font-body">{user.name ?? user.email}</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", userMenuOpen && "rotate-180")} />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 top-11 w-52 rounded-[12px] bg-[#0b0820] border border-white/10 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] py-1 z-50"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <Link
                    href="/dashboard/"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <div className="my-1 border-t border-white/10" />
                  <button
                    onClick={() => { setUserMenuOpen(false); void logout(); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#f87171] hover:bg-white/5 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-6">
              <Link href="/login/" className="text-[16px] font-medium tracking-[-0.031em] text-white hover:text-[#a78bfa] transition-colors duration-400">
                Sign in
              </Link>
              <SpButton href="/register/" size="sm">Start Free Trial</SpButton>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="md:hidden p-2 rounded-[8px] border border-white/10 bg-white/5 text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <div className="sp-header-divider" aria-hidden />

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#030014] px-4 pb-5">
          <ul className="mt-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-[8px] py-3 px-4 text-[16px] font-medium text-white hover:bg-white/5 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {loading ? null : user ? (
            <div className="mt-3 flex flex-col gap-1 border-t border-white/10 pt-3">
              <Link href="/dashboard/" className="block py-3 px-4 text-[16px] font-medium text-white rounded-[8px] hover:bg-white/5" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => { setMenuOpen(false); void logout(); }} className="text-left py-3 px-4 text-[16px] font-medium text-[#f87171] rounded-[8px] hover:bg-white/5">Sign out</button>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
              <SpButton href="/login/" variant="secondary" size="sm" block onClick={() => setMenuOpen(false)}>Sign in</SpButton>
              <SpButton href="/register/" size="sm" block onClick={() => setMenuOpen(false)}>Start Free Trial</SpButton>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
