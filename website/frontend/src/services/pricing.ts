import { apiFetch } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import type { Pricing } from "@/lib/types";

export const DEFAULT_PRICING: Pricing = {
  price_per_seat_year: 49,
  team_price_per_seat_year: 39,
  team_threshold: 5,
  trial_days: 7,
};

export const pricingService = {
  get: () => apiFetch<Pricing>(endpoints.pricing, { auth: false }),
};
