"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CreditCard, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn, stripTrailingSlash } from "@/lib/utils";
import { PageSpinner } from "@/components/ui/spinner";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = stripTrailingSlash(usePathname());

  // Route guard (static sites have no server middleware, so it happens in the browser).
  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login/?callbackUrl=${encodeURIComponent(`${pathname}/`)}`);
    }
  }, [loading, user, pathname, router]);

  async function handleSignOut() {
    await signOut();
    router.replace("/login/");
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-base)]">
        <PageSpinner label="Checking your session…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-base)]">
      <header className="sticky top-0 z-40 h-14 flex items-center justify-between px-4 sm:px-6 border-b border-[var(--color-border)] bg-[var(--color-bg-base)]/90 backdrop-blur">
        <Link href="/" className="text-h5 gradient-text font-heading">Motion AI</Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--color-text-muted)] font-body hidden sm:block">{user.email}</span>
          <button
            onClick={handleSignOut}
            className="sm:hidden flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      {/* Mobile tabs */}
      <nav className="sm:hidden flex gap-1 overflow-x-auto border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={`${item.href}/`}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm rounded-[var(--radius-md)] font-body whitespace-nowrap",
              pathname === item.href
                ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]"
                : "text-[var(--color-text-secondary)]"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex flex-1">
        <aside className="hidden sm:flex flex-col w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3 gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={`${item.href}/`}
              aria-current={pathname === item.href ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-sm rounded-[var(--radius-md)] transition-colors font-body",
                pathname === item.href
                  ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <div className="flex-1" />
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-[var(--color-text-muted)] rounded-[var(--radius-md)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-error)] transition-colors font-body"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-8 max-w-5xl">{children}</main>
      </div>
    </div>
  );
}
