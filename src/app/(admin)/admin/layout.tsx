export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, CreditCard, Key, BarChart2, Shield } from "lucide-react";

const adminNav = [
  { label: "Overview",    href: "/admin",                  icon: BarChart2  },
  { label: "Users",       href: "/admin/users",             icon: Users      },
  { label: "Payments",    href: "/admin/payments",          icon: CreditCard },
  { label: "Licenses",    href: "/admin/licenses",          icon: Key        },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Strict admin guard
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-base)]">
      <header className="sticky top-0 z-40 h-14 flex items-center gap-3 px-4 sm:px-6 border-b border-[var(--color-border)] bg-[var(--color-bg-base)]/90 backdrop-blur">
        <Shield className="h-4 w-4 text-[var(--color-primary-600)]" />
        <span className="text-h6 font-heading text-[var(--color-text-primary)]">Admin Panel</span>
        <div className="ml-auto">
          <Link href="/dashboard" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] font-body">
            ← Back to dashboard
          </Link>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden sm:flex flex-col w-52 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3 gap-1">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--color-text-secondary)] rounded-[var(--radius-md)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] transition-colors font-body"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </aside>
        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
