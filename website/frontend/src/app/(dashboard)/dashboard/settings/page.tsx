import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getApiUrl } from "@/config/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { User, Mail, Calendar, Shield, LogOut } from "lucide-react";
import type { DashboardData } from "@/lib/types";

async function getDashboard(): Promise<DashboardData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  try {
    const response = await fetch(getApiUrl("/me/dashboard"), {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const json = await response.json();
    return json.data;
  } catch {
    return null;
  }
}

export default async function SettingsPage() {
  const data = await getDashboard();
  if (!data) redirect("/login");

  const { user, licenses } = data;
  const licenseCount = licenses.length;
  const deviceCount = licenses.reduce((sum, l) => sum + (l.active_devices ?? 0), 0);

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
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={user.name ?? ""} className="w-16 h-16 rounded-full object-cover border border-[var(--color-border)]" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[var(--color-primary-500)]/10 flex items-center justify-center border border-[var(--color-border)]">
                <User className="h-8 w-8 text-[var(--color-primary-600)]" />
              </div>
            )}
            <div>
              <p className="text-h5 font-heading text-[var(--color-text-primary)]">{user.name ?? "—"}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={user.role === "admin" ? "error" : "primary"}>
                  {user.role === "admin" ? (
                    <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Admin</span>
                  ) : "User"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Row icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} />
            <Row icon={<Calendar className="h-4 w-4" />} label="Member since" value={formatDate(user.created_at)} />
            <Row icon={<Shield className="h-4 w-4" />} label="Account ID"
              value={<code className="text-xs font-mono text-[var(--color-text-muted)]">{user.id}</code>} />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-2xl font-heading text-[var(--color-text-primary)]">{licenseCount}</p>
            <p className="text-sm text-[var(--color-text-muted)] font-body mt-1">License{licenseCount !== 1 ? "s" : ""}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-2xl font-heading text-[var(--color-text-primary)]">{deviceCount}</p>
            <p className="text-sm text-[var(--color-text-muted)] font-body mt-1">Device{deviceCount !== 1 ? "s" : ""} linked</p>
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
          <form>
            <button
              type="submit"
              formAction="/api/auth/logout"
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
