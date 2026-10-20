"use client";

import { useState } from "react";
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
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import type { User } from "@/lib/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
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

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const isActive =
    item.href === "/"
      ? pathname === "/"
      : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex items-center gap-3 px-3 py-2 text-sm rounded-[var(--radius-md)] transition-all duration-150 font-body",
        collapsed && "justify-center px-2",
        isActive
          ? "bg-[var(--color-primary-50)] text-[var(--color-primary-700)] font-semibold"
          : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-[var(--color-primary-600)]" />
      )}
      <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-[var(--color-primary-600)]")} />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

function UserFooter({ user, collapsed, onLogout }: { user: User; collapsed: boolean; onLogout: () => void }) {
  const initials = (user.name || user.email)
    .split(/[\s@]/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className={cn(
      "border-t border-[var(--color-border-soft)] pt-3 mt-3",
      collapsed ? "flex flex-col items-center gap-2" : "flex items-center gap-3"
    )}>
      {user.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatar}
          alt=""
          referrerPolicy="no-referrer"
          className="w-8 h-8 rounded-full object-cover border border-[var(--color-border-soft)] shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center shrink-0">
          <span className="text-xs font-semibold text-[var(--color-primary-700)] font-body">{initials}</span>
        </div>
      )}
      {!collapsed && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text-primary)] font-body truncate">
            {user.name || "Admin"}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] font-body truncate">
            {user.email}
          </p>
        </div>
      )}
      <button
        onClick={onLogout}
        title="Sign out"
        className={cn(
          "p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-bg)] transition-colors",
          collapsed && "mt-1"
        )}
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Sidebar({ user }: { user: User }) {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        "hidden sm:flex flex-col shrink-0 border-r border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] transition-all duration-200",
        collapsed ? "w-[68px]" : "w-[252px]"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "h-16 flex items-center gap-2.5 px-4 border-b border-[var(--color-border-soft)]",
        collapsed && "justify-center px-2"
      )}>
        <div className="w-8 h-8 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] flex items-center justify-center shrink-0">
          <Zap className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-[var(--color-text-primary)] font-heading leading-tight">Motion AI</p>
            <p className="text-[10px] text-[var(--color-text-muted)] font-body leading-tight">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="flex flex-col gap-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-disabled)] font-body">
                  {group.title}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <NavLink key={item.href} item={item} collapsed={collapsed} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* User footer */}
      <div className="px-3 pb-3">
        <UserFooter user={user} collapsed={collapsed} onLogout={logout} />
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="h-10 flex items-center justify-center border-t border-[var(--color-border-soft)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
