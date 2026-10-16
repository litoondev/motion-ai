"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, LogOut, Menu, X, LayoutDashboard, Users, Key, MonitorSmartphone, CreditCard, Settings, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

const mobileNavItems = [
  { label: "Dashboard",   href: "/",             icon: LayoutDashboard },
  { label: "Users",       href: "/users",         icon: Users },
  { label: "Licenses",    href: "/licenses",      icon: Key },
  { label: "Devices",     href: "/devices",       icon: MonitorSmartphone },
  { label: "Payments",    href: "/payments",      icon: CreditCard },
  { label: "Settings",    href: "/settings",      icon: Settings },
  { label: "Audit Log",   href: "/audit-logs",    icon: ScrollText },
];

export function AdminHeader({ user }: { user: User }) {
  const { logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 h-14 flex items-center gap-3 px-4 sm:px-6 border-b border-[var(--color-border)] bg-[var(--color-bg-base)]/90 backdrop-blur">
        <button
          className="sm:hidden p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Shield className="h-4 w-4 text-[var(--color-primary-600)]" />
        <span className="text-h6 font-heading text-[var(--color-text-primary)]">Motion AI Admin</span>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-[var(--color-text-muted)] font-body hidden sm:inline">
            {user.email}
          </span>
          <Button variant="ghost" size="sm" onClick={logout} leftIcon={<LogOut className="h-3.5 w-3.5" />}>
            Logout
          </Button>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 z-30 bg-black/30" onClick={() => setMobileOpen(false)}>
          <nav
            className="absolute top-14 left-0 w-64 bg-[var(--color-bg-surface)] border-r border-[var(--color-border)] h-[calc(100vh-3.5rem)] p-3 flex flex-col gap-1 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {mobileNavItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 text-sm rounded-[var(--radius-md)] transition-colors font-body",
                    isActive
                      ? "bg-[var(--color-bg-highlight)] text-[var(--color-primary-700)] font-semibold"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
