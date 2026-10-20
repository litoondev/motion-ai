"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable, type Column } from "@/components/admin/data-table";
import { SearchFilter } from "@/components/admin/search-filter";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUsers, blockUser, unblockUser, changeUserRole } from "@/services/admin";
import { getAuthToken } from "@/lib/auth-cookie";
import { formatDate } from "@/lib/utils";
import type { User, PaginatedResponse } from "@/lib/types";
import { ShieldCheck, Ban, ShieldOff } from "lucide-react";
import toast from "react-hot-toast";

export default function UsersPage() {
  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [confirmAction, setConfirmAction] = useState<{
    type: "block" | "unblock" | "role";
    user: User;
    role?: string;
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
      const res = await getUsers(token, params);
      setData(res);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleConfirm() {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) return;
      const { type, user, role } = confirmAction;
      if (type === "block") {
        await blockUser(token, user.id);
        toast.success(`${user.email} blocked`);
      } else if (type === "unblock") {
        await unblockUser(token, user.id);
        toast.success(`${user.email} unblocked`);
      } else if (type === "role" && role) {
        await changeUserRole(token, user.id, role);
        toast.success(`${user.email} role changed to ${role}`);
      }
      setConfirmAction(null);
      fetchData();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  }

  const columns: Column<User>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (u) => (
        <div>
          <p className="text-[var(--color-text-primary)]">{u.name ?? "---"}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{u.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (u) => (
        <Badge variant={u.role === "admin" ? "primary" : "muted"}>{u.role}</Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (u) => (
        <Badge variant={u.status === "active" ? "success" : "error"} dot>
          {u.status}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (u) => (
        <span className="text-[var(--color-text-muted)]">{formatDate(u.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (u) => (
        <div className="flex items-center gap-1">
          {u.status === "active" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmAction({ type: "block", user: u })}
              leftIcon={<Ban className="h-3.5 w-3.5" />}
            >
              Block
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmAction({ type: "unblock", user: u })}
              leftIcon={<ShieldOff className="h-3.5 w-3.5" />}
            >
              Unblock
            </Button>
          )}
          {u.role !== "admin" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmAction({ type: "role", user: u, role: "admin" })}
              leftIcon={<ShieldCheck className="h-3.5 w-3.5" />}
            >
              Make Admin
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmAction({ type: "role", user: u, role: "user" })}
              leftIcon={<ShieldOff className="h-3.5 w-3.5" />}
            >
              Remove Admin
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users"
        description="Manage user accounts and roles."
        breadcrumbs={[{ label: "Users" }]}
      />

      <SearchFilter
        searchPlaceholder="Search by name or email..."
        filters={[
          {
            key: "role",
            label: "All Roles",
            options: [
              { label: "Admin", value: "admin" },
              { label: "User", value: "user" },
            ],
          },
          {
            key: "status",
            label: "All Statuses",
            options: [
              { label: "Active", value: "active" },
              { label: "Blocked", value: "blocked" },
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
        emptyMessage="No users found."
        currentPage={data?.meta?.currentPage ?? 1}
        totalPages={data?.meta?.lastPage ?? 1}
        total={data?.meta?.total}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={!!confirmAction}
        title={
          confirmAction?.type === "block"
            ? "Block User"
            : confirmAction?.type === "unblock"
            ? "Unblock User"
            : `Change Role to ${confirmAction?.role}`
        }
        description={
          confirmAction?.type === "block"
            ? `Are you sure you want to block ${confirmAction.user.email}? They will not be able to use the plugin.`
            : confirmAction?.type === "unblock"
            ? `Are you sure you want to unblock ${confirmAction?.user.email}?`
            : `Change ${confirmAction?.user.email}'s role to ${confirmAction?.role}?`
        }
        confirmLabel={
          confirmAction?.type === "block" ? "Block" : confirmAction?.type === "unblock" ? "Unblock" : "Change Role"
        }
        confirmVariant={confirmAction?.type === "block" ? "danger" : "primary"}
        loading={actionLoading}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
