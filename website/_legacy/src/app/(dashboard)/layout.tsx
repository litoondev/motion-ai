export const dynamic = "force-dynamic";

import Link from "next/link";
import { LayoutDashboard, Settings, CreditCard, LogOut, Shield } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const navItems = [
  { label: "Dashboard",  href: "/dashboard",         icon: LayoutDashboard },
  { label: "Billing",    href: "/dashboard/billing",  icon: CreditCard      },
  { label: "Settings",   href: "/dashboard/settings", icon: Settings        },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/dashboard");

  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-base)]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 h-14 flex items-center justify-between px-4 sm:px-6 border-b border-[var(--color-border)] bg-[var(--color-bg-base)]/90 backdrop-blur">
        <Link href="/" className="text-h5 gradient-text font-heading">Motion AI</Link>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link href="/admin" className="text-xs text-[var(--color-primary-600)] hover:underline font-body flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" /> Admin
            </Link>
          )}
          <span className="text-sm text-[var(--color-text-muted)] font-body hidden sm:block">
            {session.user.email}
          </span>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden sm:flex flex-col w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3 gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--color-text-secondary)] rounded-[var(--radius-md)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] transition-colors font-body"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <div className="flex-1" />
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-[var(--color-text-muted)] rounded-[var(--radius-md)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-error)] transition-colors font-body"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </aside>

        {/* Main */}
        <main className="flex-1 p-4 sm:p-8 max-w-5xl">
          {children}
        </main>
      </div>
    </div>
  );
}
