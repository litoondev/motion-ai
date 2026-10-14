import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      licenses: { take: 1, orderBy: { createdAt: "desc" } },
      devices:  { where: { isActive: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h3 font-heading text-[var(--color-text-primary)]">Users</h1>

      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <table className="w-full text-sm font-body min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                {["Name / Email", "Role", "License", "Devices", "Trial used", "Joined"].map((h) => (
                  <th key={h} className="text-left pb-2 pr-4 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-3 pr-4">
                    <p className="text-[var(--color-text-primary)]">{u.name ?? "—"}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{u.email}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={u.role === "ADMIN" ? "primary" : "muted"}>{u.role}</Badge>
                  </td>
                  <td className="py-3 pr-4">
                    {u.licenses[0]
                      ? <Badge variant={u.licenses[0].type === "TRIAL" ? "warning" : "success"}>{u.licenses[0].type}</Badge>
                      : <span className="text-[var(--color-text-muted)]">None</span>}
                  </td>
                  <td className="py-3 pr-4 text-[var(--color-text-secondary)]">{u.devices.length}</td>
                  <td className="py-3 pr-4">
                    <Badge variant={u.trialUsed ? "muted" : "success"}>{u.trialUsed ? "Yes" : "No"}</Badge>
                  </td>
                  <td className="py-3 text-[var(--color-text-muted)]">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
