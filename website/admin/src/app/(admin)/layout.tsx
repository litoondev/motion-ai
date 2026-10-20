"use client";

import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { AdminHeader } from "@/components/layout/admin-header";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary-500)]" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-[var(--color-bg-base)]">
      {/* Mobile header */}
      <AdminHeader user={user} />

      {/* Desktop sidebar */}
      <Sidebar user={user} />

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
