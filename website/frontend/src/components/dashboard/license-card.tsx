"use client";
import Link from "next/link";
import { Calendar, CheckCircle2, Key, Monitor, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CopyLicenseButton } from "@/components/dashboard/copy-license-button";
import { DownloadButton } from "@/components/dashboard/download-button";
import { UnlinkDeviceButton } from "@/components/dashboard/unlink-device-button";
import { daysUntil, formatDate, isExpired, maskLicenseKey } from "@/lib/utils";
import type { License } from "@/lib/types";

export function LicenseCard({ license, onChange }: { license: License; onChange: () => void }) {
  const isTrial = license.type === "trial";
  const isActive = license.status === "active";
  const expired = isExpired(license.expires_at);
  const updatesDue = isExpired(license.updated_until);
  const daysLeft = license.expires_at ? daysUntil(license.expires_at) : 0;
  const activeDevices = license.devices?.filter((d) => d.is_active) ?? [];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-[var(--color-primary-600)]" />
              <h2 className="text-h6 font-heading text-[var(--color-text-primary)]">License Key</h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={isActive ? "success" : "error"} dot>
                {license.status.charAt(0).toUpperCase() + license.status.slice(1)}
              </Badge>
              <Badge variant={isTrial ? "warning" : "primary"}>{isTrial ? "Trial" : "Paid"}</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-elevated)] rounded-[var(--radius-md)] border border-[var(--color-border)] mb-6 flex-wrap">
            <code className="text-sm font-mono text-[var(--color-primary-700)] flex-1 break-all">
              {isActive ? license.license_key : maskLicenseKey(license.license_key)}
            </code>
            {isActive && <CopyLicenseButton licenseKey={license.license_key} />}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-xs text-[var(--color-text-muted)] font-body mb-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {isTrial ? "Started" : "Purchased"}
              </p>
              <p className="text-sm font-semibold text-[var(--color-text-primary)] font-body">
                {formatDate(license.purchased_at ?? license.created_at)}
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
                  {formatDate(license.updated_until)}
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
                <Link href="/dashboard/billing/">
                  {isTrial && !expired ? "Purchase license" : "Renew license"}
                </Link>
              </Button>
            )}
            {isActive && <DownloadButton />}
          </div>
        </CardContent>
      </Card>

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
              No devices linked yet. Open Motion AI inside After Effects and enter your license key to link this machine.
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
                  <UnlinkDeviceButton
                    deviceId={device.id}
                    deviceName={device.device_name ?? "this device"}
                    onUnlinked={onChange}
                  />
                </li>
              ))}
            </ul>
          )}

          <p className="mt-4 text-xs text-[var(--color-text-muted)] font-body">
            Each seat supports up to 2 devices at the same time ({license.max_devices} for this license). To add a new
            device, unlink an existing one first.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
