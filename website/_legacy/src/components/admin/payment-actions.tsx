"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function PaymentActions({
  paymentId,
  txRef,
}: {
  paymentId: string;
  txRef?: string | null;
}) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const router = useRouter();

  async function handle(action: "approve" | "reject") {
    if (!confirm(`${action === "approve" ? "Approve" : "Reject"} this payment?`)) return;

    setLoading(action);
    try {
      const res = await fetch("/api/admin/payments/review", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ paymentId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Payment ${action === "approve" ? "approved" : "rejected"}.`);
        router.refresh();
      } else {
        toast.error(data.error ?? "Action failed.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => handle("approve")}
        disabled={!!loading}
        className="text-[var(--color-success)] border-[var(--color-success)]"
      >
        {loading === "approve"
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <CheckCircle className="h-3.5 w-3.5" />}
        <span className="ml-1">Approve</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handle("reject")}
        disabled={!!loading}
        className="text-[var(--color-error)]"
      >
        {loading === "reject"
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <XCircle className="h-3.5 w-3.5" />}
        <span className="ml-1">Reject</span>
      </Button>
    </div>
  );
}
