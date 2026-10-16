"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CreditCard, Building2, Minus, Plus, Check, Upload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { checkoutAction } from "@/app/actions/checkout";
import type { Pricing } from "@/lib/types";
import { clientApiFetch } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";

const DEFAULT_PRICING: Pricing = {
  price_per_seat_year: 49,
  team_price_per_seat_year: 39,
  team_threshold: 5,
  trial_days: 7,
};

export default function BillingPage() {
  const [pricing, setPricing] = useState<Pricing>(DEFAULT_PRICING);
  const [pricingLoaded, setPricingLoaded] = useState(false);
  const [seats, setSeats] = useState(1);
  const [years, setYears] = useState(1);
  const [method, setMethod] = useState<"card" | "bank_transfer">("card");
  const [txRef, setTxRef] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    clientApiFetch<Pricing>(endpoints.pricing)
      .then((data) => {
        setPricing(data);
        setPricingLoaded(true);
      })
      .catch(() => {
        setPricingLoaded(true);
      });
  }, []);

  const pricePerSeat = seats >= pricing.team_threshold ? pricing.team_price_per_seat_year : pricing.price_per_seat_year;
  const totalPrice = seats * years * pricePerSeat;

  function adjustSeats(delta: number) {
    setSeats((s) => Math.max(1, Math.min(100, s + delta)));
  }

  async function handleCheckout() {
    setLoading(true);
    try {
      const result = await checkoutAction({ seats, years, method, bank_tx_ref: method === "bank_transfer" ? txRef : undefined });

      if (method === "card" && result.url) {
        window.location.href = result.url;
      } else if (method === "bank_transfer") {
        if (result.success) {
          toast.success("Payment request submitted! Admin will verify and activate your license within 24 hours.");
        } else {
          toast.error(result.error ?? "Submission failed.");
        }
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!pricingLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-muted)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-h3 font-heading text-[var(--color-text-primary)]">Purchase License</h1>
        <p className="text-sm text-[var(--color-text-muted)] font-body mt-1">
          Configure your seats and duration, then choose a payment method.
        </p>
      </div>

      {/* ── Configurator ── */}
      <Card>
        <CardHeader>
          <h2 className="text-h6 font-heading text-[var(--color-text-primary)]">Configure your license</h2>
        </CardHeader>
        <CardContent>
          {/* Seats */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-[var(--color-text-secondary)] font-body mb-3">
              Number of seats (users)
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => adjustSeats(-1)}
                className="w-8 h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-primary)] hover:border-[var(--color-primary-500)] transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-h4 font-heading text-[var(--color-text-primary)] w-12 text-center">
                {seats}
              </span>
              <button
                onClick={() => adjustSeats(1)}
                className="w-8 h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-primary)] hover:border-[var(--color-primary-500)] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              {seats >= pricing.team_threshold && (
                <Badge variant="success">Team discount applied</Badge>
              )}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] font-body mt-2">
              Each seat allows up to 2 authorized devices.
            </p>
          </div>

          {/* Years */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-[var(--color-text-secondary)] font-body mb-3">
              Duration (years)
            </p>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3].map((y) => (
                <button
                  key={y}
                  onClick={() => setYears(y)}
                  className={`px-4 py-2 rounded-[var(--radius-md)] border text-sm font-body transition-colors ${
                    years === y
                      ? "border-[var(--color-primary-500)] bg-[color-mix(in_srgb,var(--color-primary-500)_10%,transparent)] text-[var(--color-primary-700)]"
                      : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-soft)]"
                  }`}
                >
                  {y} year{y > 1 ? "s" : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Price summary */}
          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border-soft)]">
            <div className="flex justify-between text-sm font-body text-[var(--color-text-secondary)]">
              <span>{seats} seat{seats > 1 ? "s" : ""} x {years} year{years > 1 ? "s" : ""} x ${pricePerSeat}/seat/year</span>
              <span className="text-h5 font-heading text-[var(--color-text-primary)]">${totalPrice}</span>
            </div>
            <ul className="mt-3 flex flex-col gap-1.5">
              {["Full feature access", `${years} year${years > 1 ? "s" : ""} of updates`, "Lifetime use of current version", "Up to 2 devices per seat"].map((f) => (
                <li key={f} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] font-body">
                  <Check className="h-3 w-3 text-[var(--color-primary-600)]" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* ── Payment Method ── */}
      <Card>
        <CardHeader>
          <h2 className="text-h6 font-heading text-[var(--color-text-primary)]">Payment method</h2>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-6 flex-wrap">
            <button
              onClick={() => setMethod("card")}
              className={`flex-1 min-w-36 flex items-center gap-2 p-3 rounded-[var(--radius-md)] border text-sm font-body transition-colors ${
                method === "card"
                  ? "border-[var(--color-primary-500)] bg-[color-mix(in_srgb,var(--color-primary-500)_10%,transparent)] text-[var(--color-primary-700)]"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-soft)]"
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Card payment
            </button>
            <button
              onClick={() => setMethod("bank_transfer")}
              className={`flex-1 min-w-36 flex items-center gap-2 p-3 rounded-[var(--radius-md)] border text-sm font-body transition-colors ${
                method === "bank_transfer"
                  ? "border-[var(--color-primary-500)] bg-[color-mix(in_srgb,var(--color-primary-500)_10%,transparent)] text-[var(--color-primary-700)]"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-soft)]"
              }`}
            >
              <Building2 className="h-4 w-4" />
              Bank transfer
            </button>
          </div>

          {method === "card" && (
            <p className="text-sm text-[var(--color-text-secondary)] font-body">
              You will be redirected to a secure checkout page (Stripe). Domestic and international cards accepted.
            </p>
          )}

          {method === "bank_transfer" && (
            <div className="flex flex-col gap-4">
              {/* Bank details */}
              <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm font-body">
                <p className="font-semibold text-[var(--color-text-primary)] mb-2">Bank transfer details</p>
                <div className="grid grid-cols-2 gap-y-1.5 text-[var(--color-text-secondary)]">
                  <span className="text-[var(--color-text-muted)]">Bank name</span>  <span>Demo Bank Ltd.</span>
                  <span className="text-[var(--color-text-muted)]">Account name</span> <span>OrangeToolz Ltd.</span>
                  <span className="text-[var(--color-text-muted)]">Account no.</span> <span>1234567890</span>
                  <span className="text-[var(--color-text-muted)]">Routing/SWIFT</span> <span>DEMO0000XXX</span>
                  <span className="text-[var(--color-text-muted)]">Amount</span> <span className="text-[var(--color-primary-700)] font-semibold">${totalPrice} USD</span>
                </div>
              </div>

              <Input
                label="Transaction reference / ID"
                placeholder="e.g. TXN-20241014-XXXXXX"
                value={txRef}
                onChange={(e) => setTxRef(e.target.value)}
                hint="Enter the reference number from your bank transfer."
              />

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-[var(--color-text-secondary)] font-body">
                  Upload payment receipt (optional)
                </span>
                <div className="border border-dashed border-[var(--color-border-soft)] rounded-[var(--radius-md)] p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-[var(--color-primary-500)] transition-colors">
                  <Upload className="h-5 w-5 text-[var(--color-text-muted)]" />
                  <span className="text-xs text-[var(--color-text-muted)] font-body">
                    Click or drag &amp; drop (JPG, PNG, PDF - max 5 MB)
                  </span>
                </div>
              </label>

              <p className="text-xs text-[var(--color-text-muted)] font-body">
                After submitting, admin will review and activate your license within 24 hours.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <Button
        variant="cta"
        size="lg"
        className="self-start"
        loading={loading}
        onClick={handleCheckout}
        disabled={method === "bank_transfer" && !txRef}
      >
        {method === "card" ? `Pay $${totalPrice} →` : "Submit payment request"}
      </Button>
    </div>
  );
}
