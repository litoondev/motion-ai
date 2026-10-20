"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Users,
  Key,
  MonitorSmartphone,
  CreditCard,
  Settings,
  ScrollText,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

const mobileNavGroups = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    title: "Management",
    items: [
      { label: "Users", href: "/users", icon: Users },
      { label: "Licenses", href: "/licenses", icon: Key },
      { label: "Devices", href: "/devices", icon: MonitorSmartphone },
      { label: "Payments", href: "/payments", icon: CreditCard },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Audit Log", href: "/audit-logs", icon: ScrollText },
    ],
  },
];

export function AdminHeader({ user }: { user: User }) {
  const { logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (user.name || user.email)
    .split(/[\s@]/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <>
      {/* Mobile header only */}
      <header className="sm:hidden sticky top-0 z-40 h-14 flex items-center gap-3 px-4 border-b border-[var(--color-border-soft)] bg-[var(--color-bg-surface)]">
        <button
          className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold font-heading text-[var(--color-text-primary)]">Motion AI</span>
        </div>

        <div className="ml-auto">
          {user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt="" referrerPolicy="no-referrer" className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center">
              <span className="text-[10px] font-semibold text-[var(--color-primary-700)] font-body">{initials}</span>
            </div>
          )}
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 z-30 bg-black/30" onClick={() => setMobileOpen(false)}>
          <nav
            className="absolute top-14 left-0 w-72 bg-[var(--color-bg-surface)] border-r border-[var(--color-border-soft)] h-[calc(100vh-3.5rem)] flex flex-col shadow-[var(--shadow-elevated)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 overflow-y-auto px-3 py-4">
              {mobileNavGroups.map((group) => (
                <div key={group.title} className="mb-5">
                  <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-disabled)] font-body">
                    {group.title}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {group.items.map((item) => {
                      const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "relative flex items-center gap-3 px-3 py-2 text-sm rounded-[var(--radius-md)] transition-colors font-body",
                            isActive
                              ? "bg-[var(--color-primary-50)] text-[var(--color-primary-700)] font-semibold"
                              : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
                          )}
                        >
                          {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-[var(--color-primary-600)]" />
                          )}
                          <item.icon className="h-[18px] w-[18px]" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile user footer */}
            <div className="border-t border-[var(--color-border-soft)] p-3 flex items-center gap-3">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt="" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center">
                  <span className="text-xs font-semibold text-[var(--color-primary-700)] font-body">{initials}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text-primary)] font-body truncate">{user.name || "Admin"}</p>
                <p className="text-xs text-[var(--color-text-muted)] font-body truncate">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-bg)] transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
