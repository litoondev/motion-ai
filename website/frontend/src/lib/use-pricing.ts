"use client";
import { useEffect, useState } from "react";
import { DEFAULT_PRICING, pricingService } from "@/services/pricing";
import type { Pricing } from "@/lib/types";

/** Public pricing from the API; falls back to defaults if the API is unreachable. */
export function usePricing() {
  const [pricing, setPricing] = useState<Pricing>(DEFAULT_PRICING);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    pricingService
      .get()
      .then((p) => {
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
