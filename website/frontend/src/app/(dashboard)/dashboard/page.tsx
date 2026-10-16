import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getApiUrl } from "@/config/api";
import { formatDate, daysUntil, isExpired, maskLicenseKey } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Key, Download, Calendar, RefreshCw, Monitor,
  AlertTriangle, CheckCircle2, Clock,
} from "lucide-react";
import { CopyLicenseButton } from "@/components/dashboard/copy-license-button";
import { UnlinkDeviceButton } from "@/components/dashboard/unlink-device-button";
import type { DashboardData, License, Device } from "@/lib/types";

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

export default async function DashboardPage() {
  const data = await getDashboard();
  if (!data) redirect("/login");

  const { user, licenses } = data;
  const license: License | null = licenses[0] ?? null;
  const expired = license ? isExpired(license.expires_at) : false;
  const updatesDue = license ? isExpired(license.updated_until) : false;
  const daysLeft = license?.expires_at ? daysUntil(license.expires_at) : 0;
  const activeDevices: Device[] = license?.devices?.filter((d) => d.is_active) ?? [];
  const isTrial = license?.type === "trial";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h3 font-heading text-[var(--color-text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--color-text-muted)] font-body mt-1">
          Welcome back, {user.name ?? user.email}
        </p>
      </div>

      {/* Status banners */}
      {!license && (
        <Card className="p-4 flex items-center gap-4 border-[var(--color-warning)]">
          <AlertTriangle className="h-5 w-5 text-[var(--color-warning)] shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--color-text-primary)] font-body">No active license</p>
            <p className="text-xs text-[var(--color-text-secondary)] font-body">Start a free trial or purchase a license to use Motion AI.</p>
          </div>
          <Button variant="cta" size="sm" asChild>
            <Link href="/#pricing">Get started</Link>
          </Button>
        </Card>
      )}

      {license && expired && (
        <Card className="p-4 flex items-center gap-4 border-[var(--color-error)]">
          <AlertTriangle className="h-5 w-5 text-[var(--color-error)] shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--color-text-primary)] font-body">
              {isTrial ? "Trial expired" : "License expired"}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] font-body">
              {isTrial
                ? "Your trial has ended. Purchase a license to continue."
                : "Your license has expired. Renew to get updates. Your current version still works."}
            </p>
          </div>
          <Button variant="cta" size="sm" asChild>
            <Link href="/dashboard/billing">Renew license</Link>
          </Button>
        </Card>
      )}

      {license && !expired && isTrial && daysLeft <= 3 && (
        <Card className="p-4 flex items-center gap-4 border-[var(--color-warning)]">
          <Clock className="h-5 w-5 text-[var(--color-warning)] shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--color-text-primary)] font-body">
              {daysLeft} day{daysLeft !== 1 ? "s" : ""} left in trial
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] font-body">Purchase before your trial ends to keep access.</p>
          </div>
          <Button variant="cta" size="sm" asChild>
            <Link href="/dashboard/billing">Buy now</Link>
          </Button>
        </Card>
      )}

      {/* License Key card */}
      {license && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-[var(--color-primary-600)]" />
                <h2 className="text-h6 font-heading text-[var(--color-text-primary)]">License Key</h2>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={license.status === "active" ? "success" : "error"} dot>
                  {license.status.charAt(0).toUpperCase() + license.status.slice(1)}
                </Badge>
                <Badge variant={isTrial ? "warning" : "primary"}>
                  {isTrial ? "Trial" : "Paid"}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-elevated)] rounded-[var(--radius-md)] border border-[var(--color-border)] mb-6 flex-wrap">
              <code className="text-sm font-mono text-[var(--color-primary-700)] flex-1 break-all">
                {license.status === "active"
                  ? license.license_key
                  : maskLicenseKey(license.license_key)}
              </code>
              {license.status === "active" && (
                <CopyLicenseButton licenseKey={license.license_key} />
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] font-body mb-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> {isTrial ? "Started" : "Purchased"}
                </p>
                <p className="text-sm font-semibold text-[var(--color-text-primary)] font-body">
                  {license.purchased_at ? formatDate(license.purchased_at) : formatDate(license.created_at)}
                </p>
              </div>
              {license.expires_at && (
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] font-body mb-1 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Expires
                  </p>
                  <p className={`text-sm font-semibold font-body ${expired ? "text-[var(--color-error)]" : "text-[var(--color-text-primary)]"}`}>
                    {formatDate(license.expires_at)}
                    {!expired && ` (${daysLeft}d left)`}
                  </p>
                </div>
              )}
              {!isTrial && (
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] font-body mb-1 flex items-center gap-1">
                    <RefreshCw className="h-3.5 w-3.5" /> Free updates until
                  </p>
                  <p className={`text-sm font-semibold font-body ${updatesDue ? "text-[var(--color-warning)]" : "text-[var(--color-success)]"}`}>
                    {license.updated_until ? formatDate(license.updated_until) : "—"}
                  </p>
                </div>
              )}
            </div>

            {!isTrial && (
              <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-start gap-2 mb-4">
                <CheckCircle2 className="h-4 w-4 text-[var(--color-success)] shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--color-text-secondary)] font-body leading-relaxed">
                  {updatesDue
                    ? "Your update window has ended. You can still use your current version forever. Renew to get new features."
                    : "All updates are free for 1 year after purchase. After expiry, your current version remains usable for life."}
                </p>
              </div>
            )}

            <div className="flex gap-3 flex-wrap">
              {(expired || isTrial) && (
                <Button variant="cta" size="md" asChild>
                  <Link href="/dashboard/billing">
                    {isTrial && !expired ? "Purchase license" : "Renew license"}
                  </Link>
                </Button>
              )}
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}/download`}
                download
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold font-body rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-text-primary)] bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-surface)] transition-colors"
              >
                <Download className="h-4 w-4" />
                Download plugin
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Devices card */}
      {license && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-[var(--color-primary-600)]" />
                <h2 className="text-h6 font-heading text-[var(--color-text-primary)]">Authorized Devices</h2>
              </div>
              <Badge variant="muted">
                {activeDevices.length} / {license.max_devices} devices
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            {activeDevices.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)] font-body">
                No devices linked yet. Open Motion AI inside After Effects and sign in to link this machine.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {activeDevices.map((device) => (
                  <li
                    key={device.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex-wrap"
                  >
                    <div className="flex items-center gap-3">
                      <Monitor className="h-4 w-4 text-[var(--color-text-muted)]" />
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)] font-body">
                          {device.device_name ?? "Unknown device"}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] font-body">
                          {device.platform ?? "Unknown OS"} &nbsp;&middot;&nbsp; AE {device.ae_version ?? "?"} &nbsp;&middot;&nbsp; Last seen {formatDate(device.last_seen_at)}
                        </p>
                      </div>
                    </div>
                    <UnlinkDeviceButton deviceId={device.id} deviceName={device.device_name ?? "this device"} />
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-4 text-xs text-[var(--color-text-muted)] font-body">
              Each license supports up to 2 devices simultaneously. To add a new device, unlink an existing one first.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
