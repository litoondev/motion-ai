import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Key, CreditCard, MonitorSmartphone } from "lucide-react";

export default async function AdminOverviewPage() {
  const [userCount, licenseCount, pendingPayments, deviceCount] = await Promise.all([
    prisma.user.count(),
    prisma.license.count({ where: { status: "ACTIVE" } }),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.device.count({ where: { isActive: true } }),
  ]);

  const stats = [
    { label: "Total users",        value: userCount,       icon: Users,           color: "var(--color-primary-400)"   },
    { label: "Active licenses",    value: licenseCount,    icon: Key,             color: "var(--color-success)"        },
    { label: "Pending payments",   value: pendingPayments, icon: CreditCard,      color: "var(--color-warning)"        },
    { label: "Active devices",     value: deviceCount,     icon: MonitorSmartphone, color: "var(--color-secondary-300)" },
  ];

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { licenses: { take: 1, orderBy: { createdAt: "desc" } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h3 font-heading text-[var(--color-text-primary)]">Overview</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <s.icon className="h-4 w-4" style={{ color: s.color }} />
              <p className="text-xs text-[var(--color-text-muted)] font-body">{s.label}</p>
            </div>
            <p className="text-h3 font-heading" style={{ color: s.color }}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Recent users table */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-h6 font-heading text-[var(--color-text-primary)] mb-4">Recent users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                  <th className="text-left pb-2 pr-4 font-semibold">Email</th>
                  <th className="text-left pb-2 pr-4 font-semibold">Role</th>
                  <th className="text-left pb-2 pr-4 font-semibold">License</th>
                  <th className="text-left pb-2 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="py-2.5 pr-4 text-[var(--color-text-primary)]">{u.email}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        u.role === "ADMIN"
                          ? "bg-[color-mix(in_srgb,var(--color-primary-500)_15%,transparent)] text-[var(--color-primary-700)]"
                          : "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-[var(--color-text-muted)]">
                      {u.licenses[0]?.type ?? "—"}
                    </td>
                    <td className="py-2.5 text-[var(--color-text-muted)]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
