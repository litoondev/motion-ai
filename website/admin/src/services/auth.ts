import { apiFetch } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import type { User } from "@/lib/types";

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(endpoints.auth.login, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function googleLogin(idToken: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(endpoints.auth.google, {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
  });
}

export async function logout(token: string): Promise<void> {
  await apiFetch<void>(endpoints.auth.logout, {
    method: "POST",
    token,
  });
}

export async function getMe(token: string): Promise<User> {
  return apiFetch<User>(endpoints.auth.me, { token });
}
