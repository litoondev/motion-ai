"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Pause, XCircle, RefreshCw, CalendarPlus, Users as UsersIcon } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/data-table";
import { SearchFilter } from "@/components/admin/search-filter";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getLicenses,
  suspendLicense,
  revokeLicense,
  reactivateLicense,
  extendLicense,
  changeLicenseSeats,
} from "@/services/admin";
import { getAuthToken } from "@/lib/auth-cookie";
import { formatDate, maskLicenseKey, isExpired } from "@/lib/utils";
import type { License, PaginatedResponse } from "@/lib/types";
import toast from "react-hot-toast";

const statusVariant: Record<string, "success" | "warning" | "error" | "muted"> = {
  active: "success",
  expired: "warning",
  suspended: "error",
  revoked: "muted",
};

export default function LicensesPage() {
  const [data, setData] = useState<PaginatedResponse<License> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [confirmAction, setConfirmAction] = useState<{
    type: "suspend" | "revoke" | "reactivate" | "extend" | "seats";
    license: License;
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
      const res = await getLicenses(token, params);
      setData(res);
    } catch {
      toast.error("Failed to load licenses");
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
      const { type, license } = confirmAction;
      switch (type) {
        case "suspend":
          await suspendLicense(token, license.id);
          toast.success("License suspended");
          break;
        case "revoke":
          await revokeLicense(token, license.id);
          toast.success("License revoked");
          break;
        case "reactivate":
          await reactivateLicense(token, license.id);
          toast.success("License reactivated");
          break;
        case "extend":
          await extendLicense(token, license.id, 1);
          toast.success("License extended by 1 year");
          break;
        case "seats":
          await changeLicenseSeats(token, license.id, license.seatCount + 1);
          toast.success("Seat count updated");
          break;
      }
      setConfirmAction(null);
      fetchData();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  }

  const columns: Column<License>[] = [
    {
      key: "user",
      label: "User",
      render: (l) => (
        <span className="text-[var(--color-text-secondary)]">{l.user?.email ?? "---"}</span>
      ),
    },
    {
      key: "key",
      label: "License Key",
      render: (l) => (
        <code className="text-xs font-mono text-[var(--color-primary-700)]">
          {maskLicenseKey(l.licenseKey)}
        </code>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (l) => (
        <Badge variant={l.type === "trial" ? "warning" : "primary"}>{l.type}</Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (l) => {
        const expired = isExpired(l.expiresAt);
        return (
          <Badge variant={expired ? "error" : statusVariant[l.status]} dot>
            {expired ? "expired" : l.status}
          </Badge>
        );
      },
    },
    {
      key: "seats",
      label: "Seats",
      render: (l) => (
        <span className="text-[var(--color-text-muted)]">
          {l.devicesCount ?? 0} / {l.seatCount * 2}
        </span>
      ),
    },
    {
      key: "expiresAt",
      label: "Expires",
      sortable: true,
      render: (l) => (
        <span className="text-[var(--color-text-muted)]">
          {l.expiresAt ? formatDate(l.expiresAt) : "Lifetime"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (l) => (
        <span className="text-[var(--color-text-muted)]">{formatDate(l.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (l) => (
        <div className="flex items-center gap-1 flex-wrap">
          {l.status === "active" && (
            <>
              <Button variant="ghost" size="sm" onClick={() => setConfirmAction({ type: "suspend", license: l })}
                leftIcon={<Pause className="h-3.5 w-3.5" />}>
                Suspend
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmAction({ type: "revoke", license: l })}
                leftIcon={<XCircle className="h-3.5 w-3.5" />}>
                Revoke
              </Button>
            </>
          )}
          {(l.status === "suspended" || l.status === "revoked") && (
            <Button variant="ghost" size="sm" onClick={() => setConfirmAction({ type: "reactivate", license: l })}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
              Reactivate
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setConfirmAction({ type: "extend", license: l })}
            leftIcon={<CalendarPlus className="h-3.5 w-3.5" />}>
            Extend
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmAction({ type: "seats", license: l })}
            leftIcon={<UsersIcon className="h-3.5 w-3.5" />}>
            +Seat
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-h3 font-heading text-[var(--color-text-primary)]">Licenses</h1>
        <Button variant="cta" size="sm" leftIcon={<Plus className="h-4 w-4" />} asChild>
          <Link href="/licenses/generate">Generate Key</Link>
        </Button>
      </div>

      <SearchFilter
        searchPlaceholder="Search by key or email..."
        filters={[
          {
            key: "type",
            label: "All Types",
            options: [
              { label: "Paid", value: "paid" },
              { label: "Trial", value: "trial" },
            ],
          },
          {
            key: "status",
            label: "All Statuses",
            options: [
              { label: "Active", value: "active" },
              { label: "Suspended", value: "suspended" },
              { label: "Revoked", value: "revoked" },
              { label: "Expired", value: "expired" },
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
        emptyMessage="No licenses found."
        currentPage={data?.meta?.currentPage ?? 1}
        totalPages={data?.meta?.lastPage ?? 1}
        total={data?.meta?.total}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={!!confirmAction}
        title={
          confirmAction?.type === "suspend" ? "Suspend License" :
          confirmAction?.type === "revoke" ? "Revoke License" :
          confirmAction?.type === "reactivate" ? "Reactivate License" :
          confirmAction?.type === "extend" ? "Extend License" :
          "Add Seat"
        }
        description={
          confirmAction?.type === "suspend"
            ? `Suspend license for ${confirmAction.license.user?.email}? The plugin will stop working.`
            : confirmAction?.type === "revoke"
            ? `Permanently revoke this license? This action cannot be easily undone.`
            : confirmAction?.type === "reactivate"
            ? `Reactivate this license for ${confirmAction?.license.user?.email}?`
            : confirmAction?.type === "extend"
            ? `Extend this license by 1 year?`
            : `Add 1 seat to this license (current: ${confirmAction?.license.seatCount})?`
        }
        confirmLabel={
          confirmAction?.type === "suspend" ? "Suspend" :
          confirmAction?.type === "revoke" ? "Revoke" :
          confirmAction?.type === "reactivate" ? "Reactivate" :
          confirmAction?.type === "extend" ? "Extend" :
          "Add Seat"
        }
        confirmVariant={confirmAction?.type === "revoke" || confirmAction?.type === "suspend" ? "danger" : "primary"}
        loading={actionLoading}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
