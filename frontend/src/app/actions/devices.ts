'use server';
import { apiFetch } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';

export async function unlinkDevice(deviceId: number): Promise<{ success: boolean; error?: string }> {
  try {
    await apiFetch<null>(endpoints.devices.unlink(deviceId), { method: 'POST' });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to unlink device';
    return { success: false, error: message };
  }
}
