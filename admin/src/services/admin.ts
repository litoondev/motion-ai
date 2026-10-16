import { apiFetch, apiUpload } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import type {
  User,
  License,
  Device,
  Payment,
  Setting,
  AuditLog,
  Stats,
  PaginatedResponse,
} from "@/lib/types";

// ─── Stats ─────────────────────────────────────────────────
export async function getStats(token: string): Promise<Stats> {
  return apiFetch<Stats>(endpoints.admin.stats, { token });
}

// ─── Users ─────────────────────────────────────────────────
export async function getUsers(
  token: string,
  params?: Record<string, string>
): Promise<PaginatedResponse<User>> {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return apiFetch<PaginatedResponse<User>>(endpoints.admin.users.list + qs, { token });
}

export async function getUser(token: string, id: number): Promise<User> {
  return apiFetch<User>(endpoints.admin.users.show(id), { token });
}

export async function blockUser(token: string, id: number): Promise<User> {
  return apiFetch<User>(endpoints.admin.users.block(id), { method: "POST", token });
}

export async function unblockUser(token: string, id: number): Promise<User> {
  return apiFetch<User>(endpoints.admin.users.unblock(id), { method: "POST", token });
}

export async function changeUserRole(
  token: string,
  id: number,
  role: string
): Promise<User> {
  return apiFetch<User>(endpoints.admin.users.changeRole(id), {
    method: "PUT",
    token,
    body: JSON.stringify({ role }),
  });
}

// ─── Licenses ──────────────────────────────────────────────
export async function getLicenses(
  token: string,
  params?: Record<string, string>
): Promise<PaginatedResponse<License>> {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return apiFetch<PaginatedResponse<License>>(endpoints.admin.licenses.list + qs, { token });
}

export async function getLicense(token: string, id: number): Promise<License> {
  return apiFetch<License>(endpoints.admin.licenses.show(id), { token });
}

export async function generateLicense(
  token: string,
  payload: { email: string; type: string; seatCount: number; yearCount: number | null }
): Promise<License> {
  return apiFetch<License>(endpoints.admin.licenses.generate, {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function suspendLicense(token: string, id: number): Promise<License> {
  return apiFetch<License>(endpoints.admin.licenses.suspend(id), { method: "POST", token });
}

export async function revokeLicense(token: string, id: number): Promise<License> {
  return apiFetch<License>(endpoints.admin.licenses.revoke(id), { method: "POST", token });
}

export async function reactivateLicense(token: string, id: number): Promise<License> {
  return apiFetch<License>(endpoints.admin.licenses.reactivate(id), { method: "POST", token });
}

export async function extendLicense(
  token: string,
  id: number,
  years: number
): Promise<License> {
  return apiFetch<License>(endpoints.admin.licenses.extend(id), {
    method: "POST",
    token,
    body: JSON.stringify({ years }),
  });
}

export async function changeLicenseSeats(
  token: string,
  id: number,
  seatCount: number
): Promise<License> {
  return apiFetch<License>(endpoints.admin.licenses.changeSeats(id), {
    method: "PUT",
    token,
    body: JSON.stringify({ seatCount }),
  });
}

// ─── Devices ───────────────────────────────────────────────
export async function getDevices(
  token: string,
  params?: Record<string, string>
): Promise<PaginatedResponse<Device>> {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return apiFetch<PaginatedResponse<Device>>(endpoints.admin.devices.list + qs, { token });
}

export async function forceUnlinkDevice(token: string, id: number): Promise<void> {
  await apiFetch<void>(endpoints.admin.devices.forceUnlink(id), {
    method: "POST",
    token,
  });
}

// ─── Payments ──────────────────────────────────────────────
export async function getPayments(
  token: string,
  params?: Record<string, string>
): Promise<PaginatedResponse<Payment>> {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return apiFetch<PaginatedResponse<Payment>>(endpoints.admin.payments.list + qs, { token });
}

export async function getPayment(token: string, id: number): Promise<Payment> {
  return apiFetch<Payment>(endpoints.admin.payments.show(id), { token });
}

export async function getPaymentSlip(token: string, id: number): Promise<{ url: string }> {
  return apiFetch<{ url: string }>(endpoints.admin.payments.slip(id), { token });
}

export async function approvePayment(
  token: string,
  id: number,
  note?: string
): Promise<Payment> {
  return apiFetch<Payment>(endpoints.admin.payments.approve(id), {
    method: "POST",
    token,
    body: JSON.stringify({ note }),
  });
}

export async function rejectPayment(
  token: string,
  id: number,
  note?: string
): Promise<Payment> {
  return apiFetch<Payment>(endpoints.admin.payments.reject(id), {
    method: "POST",
    token,
    body: JSON.stringify({ note }),
  });
}

export async function refundPayment(
  token: string,
  id: number,
  note?: string
): Promise<Payment> {
  return apiFetch<Payment>(endpoints.admin.payments.refund(id), {
    method: "POST",
    token,
    body: JSON.stringify({ note }),
  });
}

// ─── Settings ──────────────────────────────────────────────
export async function getSettings(token: string): Promise<Setting[]> {
  return apiFetch<Setting[]>(endpoints.admin.settings.get, { token });
}

export async function updateSettings(
  token: string,
  settings: Record<string, string>
): Promise<Setting[]> {
  return apiFetch<Setting[]>(endpoints.admin.settings.update, {
    method: "PUT",
    token,
    body: JSON.stringify(settings),
  });
}

export async function uploadPlugin(token: string, file: File): Promise<{ url: string; version: string }> {
  const formData = new FormData();
  formData.append("plugin", file);
  return apiUpload<{ url: string; version: string }>(endpoints.admin.settings.uploadPlugin, formData, token);
}

// ─── Audit Logs ────────────────────────────────────────────
export async function getAuditLogs(
  token: string,
  params?: Record<string, string>
): Promise<PaginatedResponse<AuditLog>> {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return apiFetch<PaginatedResponse<AuditLog>>(endpoints.admin.auditLogs + qs, { token });
}
