'use server';
import { apiFetch } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import type { Payment } from '@/lib/types';

export async function checkoutAction(data: {
  seats: number;
  years: number;
  method: 'card' | 'bank_transfer';
  bank_tx_ref?: string;
}): Promise<{ success: boolean; url?: string; payment?: Payment; error?: string }> {
  try {
    const result = await apiFetch<{ url?: string; payment?: Payment }>(endpoints.checkout, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { success: true, ...result };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed';
    return { success: false, error: message };
  }
}
