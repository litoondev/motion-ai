'use server';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {apiFetch} from '@/lib/api';
import {endpoints} from '@/lib/endpoints';
import type {AuthResponse} from '@/lib/types';

export async function setAuthCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
    });
}

export async function clearAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
}

export async function getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get('auth_token')?.value || null;
}

export async function loginAction(data: { email: string; password: string }): Promise<{
    success: boolean;
    error?: string
}> {
    try {


        console.log(endpoints.auth, " endpoints.auth")

        const result = await apiFetch<AuthResponse>(endpoints.auth.login, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        await setAuthCookie(result.token);
        return {success: true};
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        return {success: false, error: message};
    }
}

export async function registerAction(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const result = await apiFetch<AuthResponse>(endpoints.auth.register, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        await setAuthCookie(result.token);
        return {success: true};
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed';
        return {success: false, error: message};
    }
}

export async function googleAuthAction(data: { id_token: string }): Promise<{ success: boolean; error?: string }> {
    try {
        const result = await apiFetch<AuthResponse>(endpoints.auth.google, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        await setAuthCookie(result.token);
        return {success: true};
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Google sign-in failed';
        return {success: false, error: message};
    }
}

export async function logoutAction() {
    try {
        await apiFetch<null>(endpoints.auth.logout, {method: 'POST'});
    } catch {
        // Ignore errors — clear cookie regardless
    }
    await clearAuthCookie();
    redirect('/login');
}

export async function forgotPasswordAction(data: { email: string }): Promise<{ success: boolean; error?: string }> {
    try {
        await apiFetch<null>(endpoints.auth.forgotPassword, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return {success: true};
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send reset email';
        return {success: false, error: message};
    }
}

export async function resetPasswordAction(data: {
    email: string;
    password: string;
    password_confirmation: string;
    token: string;
}): Promise<{ success: boolean; error?: string }> {
    try {
        await apiFetch<null>(endpoints.auth.resetPassword, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return {success: true};
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to reset password';
        return {success: false, error: message};
    }
}
