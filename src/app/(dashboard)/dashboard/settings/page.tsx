export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { User, Mail, Calendar, Shield, LogOut } from "lucide-react";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id:        true,
      name:      true,
      email:     true,
      role:      true,
      createdAt: true,
      image:     true,
      _count: { select: { licenses: true, devices: true } },
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-h3 font-heading text-[var(--color-text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--color-text-secondary)] font-body mt-1">
          Manage your account and preferences.
        </p>
      </div>

      {/* Profile card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user.name ?? ""} className="w-16 h-16 rounded-full object-cover border border-[var(--color-border)]" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[var(--color-primary-500)]/10 flex items-center justify-center border border-[var(--color-border)]">
                <User className="h-8 w-8 text-[var(--color-primary-600)]" />
              </div>
            )}
            <div>
              <p className="text-h5 font-heading text-[var(--color-text-primary)]">{user.name ?? "—"}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={user.role === "ADMIN" ? "error" : "primary"}>
                  {user.role === "ADMIN" ? (
                    <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Admin</span>
                  ) : "User"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Row icon={<Mail className="h-4 w-4" />}  label="Email"    value={user.email} />
            <Row icon={<Calendar className="h-4 w-4" />} label="Member since" value={formatDate(user.createdAt)} />
            <Row icon={<Shield className="h-4 w-4" />} label="Account ID"
              value={<code className="text-xs font-mono text-[var(--color-text-muted)]">{user.id}</code>} />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-2xl font-heading text-[var(--color-text-primary)]">{user._count.licenses}</p>
            <p className="text-sm text-[var(--color-text-muted)] font-body mt-1">License{user._count.licenses !== 1 ? "s" : ""}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-2xl font-heading text-[var(--color-text-primary)]">{user._count.devices}</p>
            <p className="text-sm text-[var(--color-text-muted)] font-body mt-1">Device{user._count.devices !== 1 ? "s" : ""} linked</p>
          </CardContent>
        </Card>
      </div>

      {/* Sign out */}
      <Card>
        <CardContent className="pt-6 pb-6">
          <p className="text-sm font-semibold text-[var(--color-text-primary)] font-body mb-1">Sign out</p>
          <p className="text-xs text-[var(--color-text-muted)] font-body mb-4">
            You will be redirected to the login page.
          </p>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[var(--color-error)] border border-[var(--color-error)]/30 rounded-[var(--radius-md)] hover:bg-[var(--color-error)]/10 transition-colors font-body"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[var(--color-border)] last:border-0">
      <span className="text-[var(--color-text-muted)]">{icon}</span>
      <span className="text-sm text-[var(--color-text-muted)] font-body w-28 shrink-0">{label}</span>
      <span className="text-sm text-[var(--color-text-primary)] font-body">{value}</span>
    </div>
  );
}
