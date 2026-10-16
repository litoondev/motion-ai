import { apiFetch } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import type { DashboardData, License, Device, Payment, PaginatedResponse } from '@/lib/types';

export const userService = {
  dashboard: () =>
    apiFetch<DashboardData>(endpoints.user.dashboard),

  licenses: () =>
    apiFetch<License[]>(endpoints.licenses),

  devices: () =>
    apiFetch<Device[]>(endpoints.devices.list),

  unlinkDevice: (id: number) =>
    apiFetch<null>(endpoints.devices.unlink(id), { method: 'POST' }),

  payments: () =>
    apiFetch<PaginatedResponse<Payment>>(endpoints.payments),

  activateTrial: () =>
    apiFetch<{ license: License }>(endpoints.trial.activate, { method: 'POST' }),

  checkout: (data: { seats: number; years: number; method: 'card' | 'bank_transfer'; bank_tx_ref?: string }) =>
    apiFetch<{ url?: string; payment?: Payment }>(endpoints.checkout, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  downloadUrl: () => endpoints.download,
};
