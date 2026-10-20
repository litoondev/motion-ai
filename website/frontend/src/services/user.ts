import { apiFetch, downloadPluginFile } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import type {
  CardCheckoutResult,
  DashboardData,
  License,
  PaginatedResponse,
  Payment,
  User,
} from "@/lib/types";

export const userService = {
  dashboard: () => apiFetch<DashboardData>(endpoints.user.dashboard),

  licenses: (page = 1) =>
    apiFetch<PaginatedResponse<License>>(`${endpoints.licenses}?page=${page}`),

  payments: (page = 1) =>
    apiFetch<PaginatedResponse<Payment>>(`${endpoints.payments}?page=${page}`),

  unlinkDevice: (id: number) => apiFetch<null>(endpoints.devices.unlink(id), { method: "POST" }),

  /** The API returns the new license directly in `data`. */
  activateTrial: () => apiFetch<License>(endpoints.trial.activate, { method: "POST" }),

  updateProfile: (data: {
    name?: string;
    email?: string;
    current_password?: string;
    new_password?: string;
    new_password_confirmation?: string;
  }) => apiFetch<User>(endpoints.user.profile, { method: "PATCH", body: data }),

  /** Card: returns a Stripe checkout URL to redirect to. */
  checkoutCard: (data: { seats: number; years: number }) =>
    apiFetch<CardCheckoutResult>(endpoints.checkout, {
      method: "POST",
      body: { ...data, method: "card" },
    }),

  /** Bank transfer: multipart so the receipt file can be attached. */
  checkoutBank: (data: { seats: number; years: number; txRef: string; slip?: File | null }) => {
    const form = new FormData();
    form.append("seats", String(data.seats));
    form.append("years", String(data.years));
    form.append("method", "bank_transfer");
    form.append("tx_ref", data.txRef);
    if (data.slip) form.append("slip", data.slip);
    return apiFetch<Payment>(endpoints.checkout, { method: "POST", body: form });
  },

  downloadPlugin: () => downloadPluginFile(endpoints.download),
};
