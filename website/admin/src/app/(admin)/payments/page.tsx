"use client";

import { useEffect, useState, useCallback } from "react";
import { Eye, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/data-table";
import { SearchFilter } from "@/components/admin/search-filter";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getPayments,
  approvePayment,
  rejectPayment,
  refundPayment,
  getPaymentSlip,
} from "@/services/admin";
import { getAuthToken } from "@/lib/auth-cookie";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Payment, PaginatedResponse } from "@/lib/types";
import toast from "react-hot-toast";

const METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Bank Transfer",
  bkash: "bKash",
  payoneer: "Payoneer",
  wise: "Wise",
  card: "Card",
};

const statusVariant: Record<string, "warning" | "success" | "error" | "muted"> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
  refunded: "muted",
};

export default function PaymentsPage() {
  const [data, setData] = useState<PaginatedResponse<Payment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [confirmAction, setConfirmAction] = useState<{
    type: "approve" | "reject" | "refund";
    payment: Payment;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) return;
      const params: Record<string, string> = { page: String(page) };
      if (search) params.search = search;
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await getPayments(token, params);
      setData(res);
    } catch {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleConfirm(note?: string) {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) return;
      const { type, payment } = confirmAction;
      if (type === "approve") {
        await approvePayment(token, payment.id, note);
        toast.success("Payment approved");
      } else if (type === "reject") {
        await rejectPayment(token, payment.id, note);
        toast.success("Payment rejected");
      } else if (type === "refund") {
        await refundPayment(token, payment.id, note);
        toast.success("Payment refunded");
      }
      setConfirmAction(null);
      fetchData();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  }

  async function viewSlip(paymentId: number) {
    try {
      const token = await getAuthToken();
      if (!token) return;
      const { url } = await getPaymentSlip(token, paymentId);
      window.open(url, "_blank");
    } catch (err) {
      toast.error("Failed to load slip");
    }
  }

  const columns: Column<Payment>[] = [
    {
      key: "user",
      label: "User",
      render: (p) => (
        <div>
          <p className="text-[var(--color-text-primary)]">{p.user?.name ?? "---"}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{p.user?.email}</p>
        </div>
      ),
    },
    {
      key: "method",
      label: "Method",
      render: (p) => (
        <span className="text-[var(--color-text-secondary)]">{METHOD_LABELS[p.method] ?? p.method}</span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (p) => (
        <span className="text-[var(--color-text-primary)] font-semibold">
          {formatCurrency(p.amount, p.currency)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (p) => (
        <Badge variant={statusVariant[p.status]} dot>{p.status}</Badge>
      ),
    },
    {
      key: "txRef",
      label: "TX Ref",
      render: (p) => (
        <span className="text-xs text-[var(--color-text-muted)] font-mono">
          {p.bankTxRef ?? "---"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (p) => (
        <span className="text-[var(--color-text-muted)]">{formatDate(p.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (p) => (
        <div className="flex items-center gap-1 flex-wrap">
          {p.slipUrl && (
            <Button variant="ghost" size="sm" onClick={() => viewSlip(p.id)}
              leftIcon={<Eye className="h-3.5 w-3.5" />}>
              Slip
            </Button>
          )}
          {p.status === "pending" && (
            <>
              <Button variant="ghost" size="sm"
                onClick={() => setConfirmAction({ type: "approve", payment: p })}
                leftIcon={<CheckCircle className="h-3.5 w-3.5 text-[var(--color-success)]" />}>
                Approve
              </Button>
              <Button variant="ghost" size="sm"
                onClick={() => setConfirmAction({ type: "reject", payment: p })}
                leftIcon={<XCircle className="h-3.5 w-3.5 text-[var(--color-error)]" />}>
                Reject
              </Button>
            </>
          )}
          {p.status === "approved" && (
            <Button variant="ghost" size="sm"
              onClick={() => setConfirmAction({ type: "refund", payment: p })}
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}>
              Refund
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payments"
        description="Review and manage payment transactions."
        breadcrumbs={[{ label: "Payments" }]}
      />

      <SearchFilter
        searchPlaceholder="Search by TX ref or email..."
        filters={[
          {
            key: "status",
            label: "All Statuses",
            options: [
              { label: "Pending", value: "pending" },
              { label: "Approved", value: "approved" },
              { label: "Rejected", value: "rejected" },
              { label: "Refunded", value: "refunded" },
            ],
          },
          {
            key: "method",
            label: "All Methods",
            options: [
              { label: "Bank Transfer", value: "bank_transfer" },
              { label: "bKash", value: "bkash" },
              { label: "Payoneer", value: "payoneer" },
              { label: "Wise", value: "wise" },
              { label: "Card", value: "card" },
            ],
          },
        ]}
        onSearch={(q) => { setSearch(q); setPage(1); }}
        onFilter={(f) => { setFilters(f); setPage(1); }}
      />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        loading={loading}
        emptyMessage="No payments found."
        currentPage={data?.meta?.currentPage ?? 1}
        totalPages={data?.meta?.lastPage ?? 1}
        total={data?.meta?.total}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={!!confirmAction}
        title={
          confirmAction?.type === "approve" ? "Approve Payment" :
          confirmAction?.type === "reject" ? "Reject Payment" :
          "Refund Payment"
        }
        description={
          confirmAction?.type === "approve"
            ? `Approve payment of ${formatCurrency(confirmAction.payment.amount, confirmAction.payment.currency)} from ${confirmAction.payment.user?.email}?`
            : confirmAction?.type === "reject"
            ? `Reject this payment? The user will be notified.`
            : `Refund ${formatCurrency(confirmAction?.payment.amount ?? 0, confirmAction?.payment.currency ?? "USD")} to ${confirmAction?.payment.user?.email}?`
        }
        confirmLabel={
          confirmAction?.type === "approve" ? "Approve" :
          confirmAction?.type === "reject" ? "Reject" :
          "Refund"
        }
        confirmVariant={confirmAction?.type === "approve" ? "cta" : "danger"}
        loading={actionLoading}
        withNote
        notePlaceholder="Add a note (optional)..."
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
