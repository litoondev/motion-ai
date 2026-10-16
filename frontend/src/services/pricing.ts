import { apiFetch } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import type { Pricing } from '@/lib/types';

export const pricingService = {
  get: () => apiFetch<Pricing>(endpoints.pricing),
};
