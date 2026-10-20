"use client";
import { useEffect, useState } from "react";
import { DEFAULT_PRICING, pricingService } from "@/services/pricing";
import type { Pricing } from "@/lib/types";

// Public and identical for every visitor, so one fetch per page load is enough.
let cachedPricing: Pricing | null = null;

/** Public pricing from the API; falls back to defaults if the API is unreachable. */
export function usePricing() {
  const [pricing, setPricing] = useState<Pricing>(cachedPricing ?? DEFAULT_PRICING);
  const [loaded, setLoaded] = useState(cachedPricing !== null);

  useEffect(() => {
    let cancelled = false;
    pricingService
      .get()
      .then((p) => {
        cachedPricing = p;
        if (!cancelled) setPricing(p);
      })
      .catch(() => {
        /* keep defaults */
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { pricing, loaded };
}
