"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable, type Column } from "@/components/admin/data-table";
import { SearchFilter } from "@/components/admin/search-filter";
import { PageHeader } from "@/components/admin/page-header";
import { getAuditLogs } from "@/services/admin";
import { getAuthToken } from "@/lib/auth-cookie";
import { formatDate } from "@/lib/utils";
import type { AuditLog, PaginatedResponse } from "@/lib/types";
import toast from "react-hot-toast";

export default function AuditLogsPage() {
  const [data, setData] = useState<PaginatedResponse<AuditLog> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) return;
      const params: Record<string, string> = { page: String(page) };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await getAuditLogs(token, params);
      setData(res);
    } catch {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns: Column<AuditLog>[] = [
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (log) => (
        <span className="text-[var(--color-text-muted)]">{formatDate(log.createdAt)}</span>
      ),
    },
    {
      key: "admin",
      label: "Admin",
      render: (log) => (
        <span className="text-[var(--color-text-secondary)]">{log.admin?.email ?? "---"}</span>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (log) => (
        <span className="text-[var(--color-text-primary)] font-semibold">{log.action}</span>
      ),
    },
    {
      key: "target",
      label: "Target",
      render: (log) => (
        <span className="text-[var(--color-text-secondary)]">{log.target}</span>
      ),
    },
    {
      key: "ip",
      label: "IP",
      render: (log) => (
        <code className="text-xs font-mono text-[var(--color-text-muted)]">{log.ip}</code>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Audit Log"
        description="Track admin actions and system events."
        breadcrumbs={[{ label: "Audit Log" }]}
      />

      <SearchFilter
        searchPlaceholder=""
        filters={[
          {
            key: "action",
            label: "All Actions",
            options: [
              { label: "User Blocked", value: "user.blocked" },
              { label: "User Unblocked", value: "user.unblocked" },
              { label: "Role Changed", value: "user.role_changed" },
              { label: "License Generated", value: "license.generated" },
              { label: "License Suspended", value: "license.suspended" },
              { label: "License Revoked", value: "license.revoked" },
              { label: "Payment Approved", value: "payment.approved" },
              { label: "Payment Rejected", value: "payment.rejected" },
              { label: "Payment Refunded", value: "payment.refunded" },
              { label: "Settings Updated", value: "settings.updated" },
              { label: "Plugin Uploaded", value: "plugin.uploaded" },
            ],
          },
        ]}
        onSearch={() => {}}
        onFilter={(f) => { setFilters(f); setPage(1); }}
      />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        loading={loading}
        emptyMessage="No audit logs found."
        currentPage={data?.meta?.currentPage ?? 1}
        totalPages={data?.meta?.lastPage ?? 1}
        total={data?.meta?.total}
        onPageChange={setPage}
      />
    </div>
  );
}
