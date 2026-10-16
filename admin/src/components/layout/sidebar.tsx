"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Key,
  MonitorSmartphone,
  CreditCard,
  Settings,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard",   href: "/",             icon: LayoutDashboard },
  { label: "Users",       href: "/users",         icon: Users },
  { label: "Licenses",    href: "/licenses",      icon: Key },
  { label: "Devices",     href: "/devices",       icon: MonitorSmartphone },
  { label: "Payments",    href: "/payments",      icon: CreditCard },
  { label: "Settings",    href: "/settings",      icon: Settings },
  { label: "Audit Log",   href: "/audit-logs",    icon: ScrollText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden sm:flex flex-col w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3 gap-1">
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
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
    </aside>
  );
}
