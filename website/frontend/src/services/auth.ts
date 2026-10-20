import { apiFetch } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import type { AuthResponse, User } from "@/lib/types";

export const authService = {
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    apiFetch<AuthResponse>(endpoints.auth.register, { method: "POST", body: data, auth: false }),

  login: (data: { email: string; password: string }) =>
    apiFetch<AuthResponse>(endpoints.auth.login, { method: "POST", body: data, auth: false }),

  google: (data: { id_token: string }) =>
    apiFetch<AuthResponse>(endpoints.auth.google, { method: "POST", body: data, auth: false }),

  logout: () => apiFetch<null>(endpoints.auth.logout, { method: "POST" }),

  me: () => apiFetch<User>(endpoints.auth.me),

  forgotPassword: (data: { email: string }) =>
    apiFetch<null>(endpoints.auth.forgotPassword, { method: "POST", body: data, auth: false }),

  resetPassword: (data: { email: string; password: string; password_confirmation: string; token: string }) =>
    apiFetch<null>(endpoints.auth.resetPassword, { method: "POST", body: data, auth: false }),

  resendVerification: () => apiFetch<null>(endpoints.auth.resendVerification, { method: "POST" }),
};
