import { Badge } from "@/components/ui/badge";
import { formatDate, formatMoney } from "@/lib/utils";
import type { Payment } from "@/lib/types";

const statusVariant = {
  pending: "warning",
  approved: "success",
  rejected: "error",
  refunded: "muted",
} as const;

export function PaymentStatusBadge({ status }: { status: Payment["status"] }) {
  return (
    <Badge variant={statusVariant[status]} dot>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export function PaymentsTable({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return <p className="text-sm text-[var(--color-text-muted)] font-body">No payments yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-body">
        <thead>
          <tr className="text-left text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
            <th className="py-2 pr-4 font-semibold">Date</th>
            <th className="py-2 pr-4 font-semibold">Method</th>
            <th className="py-2 pr-4 font-semibold">Plan</th>
            <th className="py-2 pr-4 font-semibold">Amount</th>
            <th className="py-2 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0 align-top">
              <td className="py-3 pr-4 text-[var(--color-text-secondary)] whitespace-nowrap">{formatDate(p.created_at)}</td>
              <td className="py-3 pr-4 text-[var(--color-text-secondary)] whitespace-nowrap">
                {p.method === "bank_transfer" ? "Bank Transfer" : p.method === "bkash" ? "bKash" : p.method === "payoneer" ? "Payoneer" : p.method === "wise" ? "Wise" : p.method}
              </td>
              <td className="py-3 pr-4 text-[var(--color-text-secondary)] whitespace-nowrap">
                {p.seat_count} seat{p.seat_count > 1 ? "s" : ""} × {p.year_count} yr
              </td>
              <td className="py-3 pr-4 font-semibold text-[var(--color-text-primary)] whitespace-nowrap">
                {formatMoney(p.amount, p.currency)}
              </td>
              <td className="py-3">
                <PaymentStatusBadge status={p.status} />
                {p.admin_note && (
                  <p className="mt-1 text-xs text-[var(--color-text-muted)] max-w-56">{p.admin_note}</p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
