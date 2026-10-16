import { apiFetch } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import type { AuthResponse, User } from '@/lib/types';

export const authService = {
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    apiFetch<AuthResponse>(endpoints.auth.register, { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    apiFetch<AuthResponse>(endpoints.auth.login, { method: 'POST', body: JSON.stringify(data) }),

  google: (data: { id_token: string }) =>
    apiFetch<AuthResponse>(endpoints.auth.google, { method: 'POST', body: JSON.stringify(data) }),

  logout: () =>
    apiFetch<null>(endpoints.auth.logout, { method: 'POST' }),

  me: () =>
    apiFetch<User>(endpoints.auth.me),

  forgotPassword: (data: { email: string }) =>
    apiFetch<null>(endpoints.auth.forgotPassword, { method: 'POST', body: JSON.stringify(data) }),

  resetPassword: (data: { email: string; password: string; password_confirmation: string; token: string }) =>
    apiFetch<null>(endpoints.auth.resetPassword, { method: 'POST', body: JSON.stringify(data) }),

  resendVerification: () =>
    apiFetch<null>(endpoints.auth.resendVerification, { method: 'POST' }),
};
