import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, isExpired, maskLicenseKey } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AdminLicensesPage() {
  const licenses = await prisma.license.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user:    { select: { email: true } },
      devices: { where: { isActive: true } },
    },
    take: 100,
  });

  const statusVariant: Record<string, "success" | "warning" | "error" | "muted"> = {
    ACTIVE:    "success",
    EXPIRED:   "warning",
    SUSPENDED: "error",
    REVOKED:   "muted",
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-h3 font-heading text-[var(--color-text-primary)]">Licenses</h1>
        <Button variant="cta" size="sm" leftIcon={<Plus className="h-4 w-4" />} asChild>
          <Link href="/admin/licenses/generate">Generate key</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <table className="w-full text-sm font-body min-w-[800px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                {["User", "License key", "Type", "Status", "Devices", "Expires", "Created"].map((h) => (
                  <th key={h} className="text-left pb-2 pr-4 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {licenses.map((l) => {
                const expired = isExpired(l.expiresAt);
                return (
                  <tr key={l.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="py-3 pr-4 text-[var(--color-text-secondary)]">{l.user.email}</td>
                    <td className="py-3 pr-4">
                      <code className="text-xs font-mono text-[var(--color-primary-700)]">
                        {maskLicenseKey(l.licenseKey)}
                      </code>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={l.type === "TRIAL" ? "warning" : "primary"}>{l.type}</Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={expired ? "error" : statusVariant[l.status]} dot>
                        {expired ? "Expired" : l.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-[var(--color-text-muted)]">
                      {l.devices.length} / {l.seatCount * 2}
                    </td>
                    <td className="py-3 pr-4 text-[var(--color-text-muted)]">
                      {l.expiresAt ? formatDate(l.expiresAt) : "—"}
                    </td>
                    <td className="py-3 text-[var(--color-text-muted)]">{formatDate(l.createdAt)}</td>
                  </tr>
                );
              })}
              {licenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--color-text-muted)]">
                    No licenses yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
