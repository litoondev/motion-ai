"use client";

import { useEffect, useState, useCallback } from "react";
import { Unlink } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/data-table";
import { SearchFilter } from "@/components/admin/search-filter";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDevices, forceUnlinkDevice } from "@/services/admin";
import { getAuthToken } from "@/app/actions/auth";
import { formatDate, maskLicenseKey } from "@/lib/utils";
import type { Device, PaginatedResponse } from "@/lib/types";
import toast from "react-hot-toast";

export default function DevicesPage() {
  const [data, setData] = useState<PaginatedResponse<Device> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [unlinkTarget, setUnlinkTarget] = useState<Device | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) return;
      const params: Record<string, string> = { page: String(page) };
      if (search) params.search = search;
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await getDevices(token, params);
      setData(res);
    } catch {
      toast.error("Failed to load devices");
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleUnlink() {
    if (!unlinkTarget) return;
    setActionLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) return;
      await forceUnlinkDevice(token, unlinkTarget.id);
      toast.success("Device unlinked");
      setUnlinkTarget(null);
      fetchData();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  }

  const columns: Column<Device>[] = [
    {
      key: "deviceId",
      label: "Device ID",
      render: (d) => (
        <code className="text-xs font-mono text-[var(--color-text-secondary)]">
          {d.deviceId.slice(0, 12)}...
        </code>
      ),
    },
    {
      key: "deviceName",
      label: "Name",
      render: (d) => <span className="text-[var(--color-text-primary)]">{d.deviceName}</span>,
    },
    {
      key: "platform",
      label: "Platform",
      render: (d) => <span className="text-[var(--color-text-muted)]">{d.platform}</span>,
    },
    {
      key: "aeVersion",
      label: "AE Version",
      render: (d) => <span className="text-[var(--color-text-muted)]">{d.aeVersion}</span>,
    },
    {
      key: "user",
      label: "User",
      render: (d) => (
        <span className="text-[var(--color-text-secondary)]">{d.user?.email ?? "---"}</span>
      ),
    },
    {
      key: "licenseKey",
      label: "License Key",
      render: (d) => (
        <code className="text-xs font-mono text-[var(--color-primary-700)]">
          {d.license?.licenseKey ? maskLicenseKey(d.license.licenseKey) : "---"}
        </code>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (d) => (
        <Badge variant={d.isActive ? "success" : "muted"} dot>
          {d.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "lastSeenAt",
      label: "Last Seen",
      sortable: true,
      render: (d) => (
        <span className="text-[var(--color-text-muted)]">{formatDate(d.lastSeenAt)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (d) =>
        d.isActive ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUnlinkTarget(d)}
            leftIcon={<Unlink className="h-3.5 w-3.5" />}
          >
            Unlink
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h3 font-heading text-[var(--color-text-primary)]">Devices</h1>

      <SearchFilter
        searchPlaceholder="Search by device name or ID..."
        filters={[
          {
            key: "active",
            label: "All Statuses",
            options: [
              { label: "Active", value: "true" },
              { label: "Inactive", value: "false" },
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
        emptyMessage="No devices found."
        currentPage={data?.meta?.currentPage ?? 1}
        totalPages={data?.meta?.lastPage ?? 1}
        total={data?.meta?.total}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={!!unlinkTarget}
        title="Force Unlink Device"
        description={`Force unlink "${unlinkTarget?.deviceName}" (${unlinkTarget?.deviceId.slice(0, 12)}...)? This will deactivate the device immediately.`}
        confirmLabel="Unlink"
        confirmVariant="danger"
        loading={actionLoading}
        onConfirm={handleUnlink}
        onCancel={() => setUnlinkTarget(null)}
      />
    </div>
  );
}
