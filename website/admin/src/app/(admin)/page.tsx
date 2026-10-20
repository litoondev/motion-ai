"use client";

import { useEffect, useState } from "react";
import { Users, Key, CreditCard, MonitorSmartphone, UserPlus, DollarSign } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { getStats } from "@/services/admin";
import { getAuthToken } from "@/lib/auth-cookie";
import type { Stats } from "@/lib/types";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = await getAuthToken();
        if (!token) return;
        const data = await getStats(token);
        setStats(data);
      } catch (err) {
        toast.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-h3 font-heading text-[var(--color-text-primary)]">Dashboard</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-[var(--radius-lg)] animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users",       value: stats?.totalUsers ?? 0,        icon: Users,             color: "var(--color-primary-500)" },
    { label: "Active Licenses",   value: stats?.activeLicenses ?? 0,    icon: Key,               color: "var(--color-success)" },
    { label: "Pending Payments",  value: stats?.pendingPayments ?? 0,   icon: CreditCard,        color: "var(--color-warning)" },
    { label: "Active Devices",    value: stats?.activeDevices ?? 0,     icon: MonitorSmartphone,  color: "var(--color-secondary-300)" },
    { label: "Recent Signups",    value: stats?.recentSignups ?? 0,     icon: UserPlus,          color: "var(--color-info)" },
    { label: "Revenue",           value: `$${(stats?.revenue ?? 0).toLocaleString()}`, icon: DollarSign, color: "var(--color-cta-500)" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h3 font-heading text-[var(--color-text-primary)]">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
    </div>
  );
}
