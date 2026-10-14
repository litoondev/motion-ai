import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { PaymentActions } from "@/components/admin/payment-actions";

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true, name: true } } },
  });

  const statusVariant: Record<string, "warning" | "success" | "error" | "muted"> = {
    PENDING:  "warning",
    APPROVED: "success",
    REJECTED: "error",
    REFUNDED: "muted",
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h3 font-heading text-[var(--color-text-primary)]">Payments</h1>

      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <table className="w-full text-sm font-body min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                {["User", "Method", "Amount", "Seats/Years", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} className="text-left pb-2 pr-4 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-3 pr-4 text-[var(--color-text-primary)]">
                    <div>{p.user.name ?? "—"}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">{p.user.email}</div>
                  </td>
                  <td className="py-3 pr-4 text-[var(--color-text-secondary)]">{p.method}</td>
                  <td className="py-3 pr-4 text-[var(--color-text-primary)] font-semibold">
                    ${p.amount} {p.currency}
                  </td>
                  <td className="py-3 pr-4 text-[var(--color-text-muted)]">
                    {p.seatCount} seat{p.seatCount > 1 ? "s" : ""} / {p.yearCount} yr{p.yearCount > 1 ? "s" : ""}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={statusVariant[p.status]} dot>{p.status}</Badge>
                  </td>
                  <td className="py-3 pr-4 text-[var(--color-text-muted)]">{formatDate(p.createdAt)}</td>
                  <td className="py-3">
                    {p.status === "PENDING" && p.method === "BANK_TRANSFER" && (
                      <PaymentActions paymentId={p.id} txRef={p.bankTxRef} />
                    )}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--color-text-muted)]">
                    No payments yet.
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
