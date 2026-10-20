"use client";
import { useRef, useState } from "react";
import { Check, Clock, Copy, Info, Key, Minus, Plus, Tag, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { PageSpinner } from "@/components/ui/spinner";
import { PaymentsTable } from "@/components/dashboard/payments-table";
import { PaymentMethodIcon, type PaymentMethodId } from "@/components/dashboard/payment-method-icon";
import { copyText } from "@/components/dashboard/copy-license-button";
import { errorMessage, fieldErrors } from "@/lib/api";
import {
  BANK_DETAILS, BANK_TRANSFER_ENABLED,
  BKASH_DETAILS, BKASH_ENABLED,
  PAYONEER_DETAILS, PAYONEER_ENABLED,
  WISE_DETAILS, WISE_ENABLED,
  SUPPORT_EMAIL,
} from "@/lib/config";
import { useFetch } from "@/lib/use-fetch";
import { usePricing } from "@/lib/use-pricing";
import { cn, formatMoney, formatDate, isExpired } from "@/lib/utils";
import { userService } from "@/services/user";
import type { CouponResult } from "@/lib/types";

type Currency = "USD" | "BDT";
type Mode = "new" | "add_seats" | "extend";

const BDT_RATE = 121;
const MAX_SLIP_BYTES = 5 * 1024 * 1024;
const SLIP_TYPES = ["image/jpeg", "image/png", "application/pdf"];

const METHODS: { id: PaymentMethodId; label: string; note: string; enabled: boolean }[] = [
  { id: "bank_transfer", label: "Bank Transfer", note: "Local bank deposit", enabled: BANK_TRANSFER_ENABLED },
  { id: "bkash", label: "bKash", note: "Mobile wallet · BDT", enabled: BKASH_ENABLED },
  { id: "payoneer", label: "Payoneer", note: "International · USD", enabled: PAYONEER_ENABLED },
  { id: "wise", label: "Wise", note: "International · USD", enabled: WISE_ENABLED },
];
const ENABLED_METHODS = METHODS.filter((m) => m.enabled);

const optionClass = (active: boolean) =>
  cn(
    "border transition-colors font-body text-sm rounded-[var(--radius-md)]",
    active
      ? "border-[var(--color-primary-500)] bg-[color-mix(in_srgb,var(--color-primary-500)_10%,transparent)] text-[var(--color-primary-700)]"
      : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]"
  );

function CopyValue({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <span className="inline-flex items-center gap-1.5 min-w-0">
      <span className="truncate text-[var(--color-text-primary)] font-medium">{value}</span>
      <button
        type="button"
        onClick={async () => {
          if (await copyText(value)) {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } else toast.error("Could not copy. Select it and copy manually.");
        }}
        aria-label={`Copy ${label}`}
        title={`Copy ${label}`}
        className="shrink-0 p-1 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-primary-700)] hover:bg-[var(--color-bg-overlay)] transition-colors"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-[var(--color-success)]" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <span className="sr-only" aria-live="polite">{copied ? `${label} copied` : ""}</span>
    </span>
  );
}

function DetailRow({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-[var(--color-border-soft)] last:border-0">
      <dt className="text-[var(--color-text-muted)] shrink-0">{label}</dt>
      <dd className="min-w-0 text-right">
        {copy ? <CopyValue value={value} label={label.toLowerCase()} /> : <span className="text-[var(--color-text-primary)] font-medium">{value}</span>}
      </dd>
    </div>
  );
}

function StepTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary-600)] text-[12px] font-bold text-white font-body">{n}</span>
      <h2 className="text-h6 font-heading text-[var(--color-text-primary)]">{children}</h2>
    </div>
  );
}

export default function BillingPage() {
  const { pricing, loaded } = usePricing();
  const dashboard = useFetch(() => userService.dashboard(), [], { cacheKey: "dashboard" });
  const activeLicense = dashboard.data?.licenses?.find((l) => l.status === "active" && !isExpired(l.expires_at));
  const hasActiveLicense = Boolean(activeLicense);

  // Chosen after the license data loads, so an existing customer never lands in "new purchase" by accident.
  const [modeChoice, setModeChoice] = useState<Exclude<Mode, "new"> | null>(null);
  const mode: Mode = hasActiveLicense ? modeChoice ?? "add_seats" : "new";

  const [seats, setSeats] = useState(1);
  const [years, setYears] = useState(1);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [method, setMethod] = useState<PaymentMethodId>(ENABLED_METHODS[0]?.id ?? "bank_transfer");
  const [txRef, setTxRef] = useState("");
  const [slip, setSlip] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponResult | null>(null);

  const [page, setPage] = useState(1);
  const payments = useFetch(() => userService.payments(page), [page]);

  // Extending renews every seat on the license; adding seats is billed for one year.
  const billedSeats = mode === "extend" && activeLicense ? activeLicense.seat_count : seats;
  const billedYears = mode === "add_seats" ? 1 : years;

  const pricePerSeat = billedSeats >= pricing.team_threshold ? pricing.team_price_per_seat_year : pricing.price_per_seat_year;
  const subtotalUSD = billedSeats * billedYears * pricePerSeat;

  let discountAmount = 0;
  if (appliedCoupon?.valid) {
    if (appliedCoupon.discount_percent > 0) discountAmount = subtotalUSD * (appliedCoupon.discount_percent / 100);
    if (appliedCoupon.discount_flat) discountAmount += appliedCoupon.discount_flat;
    discountAmount = Math.min(discountAmount, subtotalUSD);
  }
  const totalUSD = subtotalUSD - discountAmount;
  const fx = currency === "BDT" ? BDT_RATE : 1;
  const displayTotal = totalUSD * fx;
  const totalText = formatMoney(displayTotal, currency);

  const hasPending = payments.data?.data.some((p) => p.status === "pending");
  const methodInfo = METHODS.find((m) => m.id === method);

  function adjustSeats(delta: number) {
    setSeats((s) => Math.max(1, Math.min(100, s + delta)));
  }

  function handleSlipChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return setSlip(null);
    if (!SLIP_TYPES.includes(file.type)) {
      toast.error("Receipt must be a JPG, PNG or PDF file.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_SLIP_BYTES) {
      toast.error("Receipt must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }
    setSlip(file);
  }

  function clearSlip() {
    setSlip(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleApplyCoupon() {
    const code = couponCode.trim();
    if (!code) return;
    setCouponLoading(true);
    try {
      const result = await userService.validateCoupon(code);
      if (result.valid) {
        setAppliedCoupon(result);
        toast.success(`Coupon "${code}" applied.`);
      } else {
        toast.error(result.message || "Invalid coupon code.");
        setAppliedCoupon(null);
      }
    } catch (err) {
      toast.error(errorMessage(err, "Could not validate coupon."));
      setAppliedCoupon(null);
    }
    setCouponLoading(false);
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
  }

  async function handleCheckout() {
    if (!txRef.trim()) {
      setErrors({ tx_ref: "Enter the transaction ID from your payment." });
      document.getElementById("tx-ref")?.focus();
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const coupon = appliedCoupon?.valid ? appliedCoupon.code : undefined;
      await userService.checkoutBank({ seats: billedSeats, years: billedYears, txRef: txRef.trim(), slip, currency, coupon, method });
      toast.success("Payment submitted! We will verify it and update your license within 24 hours.");
      setTxRef("");
      clearSlip();
      if (page === 1) payments.reload();
      else setPage(1);
    } catch (err) {
      const fields = fieldErrors(err);
      setErrors(fields);
      toast.error(errorMessage(err, "Checkout failed. Please try again."));
    }
    setLoading(false);
  }

  if (!loaded || dashboard.loading) return <PageSpinner label="Loading billing…" />;

  const summaryLine =
    mode === "extend"
      ? `Renew ${billedSeats} seat${billedSeats > 1 ? "s" : ""} for ${billedYears} year${billedYears > 1 ? "s" : ""}`
      : mode === "add_seats"
        ? `${billedSeats} extra seat${billedSeats > 1 ? "s" : ""} · 1 year`
        : `${billedSeats} seat${billedSeats > 1 ? "s" : ""} · ${billedYears} year${billedYears > 1 ? "s" : ""}`;

  const submitLabel =
    mode === "add_seats" ? `Add ${billedSeats} seat${billedSeats > 1 ? "s" : ""}` : mode === "extend" ? "Extend license" : "Submit payment";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold font-heading text-[var(--color-text-primary)] leading-tight">
          {hasActiveLicense ? "Manage License" : "Purchase License"}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] font-body mt-1">
          {hasActiveLicense
            ? "Add extra seats or extend your license, then pay with your preferred method."
            : "Choose your seats and duration, pay with your preferred method, then submit the transaction ID."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
        {/* ── Left: configure + pay ── */}
        <div className="flex flex-col gap-6 min-w-0">
          {activeLicense && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-[var(--color-primary-600)]" />
                    <h2 className="text-h6 font-heading text-[var(--color-text-primary)]">Your current license</h2>
                  </div>
                  <Badge variant="success" dot>Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-3 gap-4">
                  {[
                    ["Seats", String(activeLicense.seat_count)],
                    ["Expires", activeLicense.expires_at ? formatDate(activeLicense.expires_at) : "Never"],
                    ["Devices", `${activeLicense.active_devices} / ${activeLicense.max_devices}`],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs text-[var(--color-text-muted)] font-body">{k}</dt>
                      <dd className="text-sm font-semibold text-[var(--color-text-primary)] font-body">{v}</dd>
                    </div>
                  ))}
                </dl>
                {hasPending && (
                  <div className="mt-4 flex items-center gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)]">
                    <Clock className="h-4 w-4 text-[var(--color-warning)] shrink-0" />
                    <p className="text-xs text-[var(--color-warning)] font-body font-semibold">
                      A payment is under review. Your update will be applied once it is approved.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 1 */}
          <Card>
            <CardHeader>
              <StepTitle n={1}>{hasActiveLicense ? "What would you like to do?" : "Configure your license"}</StepTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {hasActiveLicense && (
                <div role="radiogroup" aria-label="Upgrade type" className="grid sm:grid-cols-2 gap-3">
                  {([
                    ["add_seats", "Add extra seats", "More users or devices on this license"],
                    ["extend", "Extend duration", `Renew all ${activeLicense!.seat_count} seats for longer`],
                  ] as const).map(([id, title, desc]) => (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={mode === id}
                      onClick={() => setModeChoice(id)}
                      className={cn("relative p-4 text-left", optionClass(mode === id))}
                    >
                      <span className="block font-semibold text-[var(--color-text-primary)]">{title}</span>
                      <span className="block text-xs text-[var(--color-text-muted)] mt-0.5">{desc}</span>
                      {mode === id && <Check className="absolute top-3 right-3 h-4 w-4 text-[var(--color-primary-600)]" aria-hidden />}
                    </button>
                  ))}
                </div>
              )}

              {mode !== "extend" && (
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-secondary)] font-body mb-3" id="seats-label">
                    {mode === "add_seats" ? "Extra seats to add" : "Number of seats (users)"}
                  </p>
                  <div className="flex items-center gap-4 flex-wrap" role="group" aria-labelledby="seats-label">
                    <button type="button" onClick={() => adjustSeats(-1)} disabled={seats <= 1} aria-label="Remove a seat"
                      className="w-10 h-10 rounded-[var(--radius-md)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-primary)] hover:border-[var(--color-primary-500)] transition-colors disabled:opacity-40">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-h4 font-heading text-[var(--color-text-primary)] w-12 text-center" aria-live="polite">{seats}</span>
                    <button type="button" onClick={() => adjustSeats(1)} disabled={seats >= 100} aria-label="Add a seat"
                      className="w-10 h-10 rounded-[var(--radius-md)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-primary)] hover:border-[var(--color-primary-500)] transition-colors disabled:opacity-40">
                      <Plus className="h-4 w-4" />
                    </button>
                    {billedSeats >= pricing.team_threshold && <Badge variant="success">Team price applied</Badge>}
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] font-body mt-2">
                    Each seat allows up to 2 devices.{mode === "add_seats" && " Extra seats are billed for 1 year."}
                  </p>
                </div>
              )}

              {mode !== "add_seats" && (
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-secondary)] font-body mb-3">Duration</p>
                  <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label="Duration">
                    {[1, 2, 3].map((y) => (
                      <button key={y} type="button" role="radio" aria-checked={years === y} onClick={() => setYears(y)}
                        className={cn("px-4 py-2", optionClass(years === y))}>
                        {y} year{y > 1 ? "s" : ""}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-[var(--color-text-secondary)] font-body mb-3">Currency</p>
                <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label="Currency">
                  {(["USD", "BDT"] as Currency[]).map((c) => (
                    <button type="button" key={c} role="radio" aria-checked={currency === c} onClick={() => setCurrency(c)}
                      className={cn("px-4 py-2 flex items-center gap-2", optionClass(currency === c))}>
                      <span className="font-semibold">{c === "USD" ? "$" : "৳"}</span>
                      {c === "USD" ? "US Dollar" : "Bangladeshi Taka"}
                    </button>
                  ))}
                </div>
                {currency === "BDT" && (
                  <p className="text-xs text-[var(--color-text-muted)] font-body mt-2">1 USD = ৳{BDT_RATE} (approximate rate)</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card>
            <CardHeader>
              <StepTitle n={2}>Send your payment</StepTitle>
            </CardHeader>
            <CardContent>
              {ENABLED_METHODS.length === 0 ? (
                <p className="text-sm text-[var(--color-text-secondary)] font-body">
                  Online payment isn&apos;t available right now. Email{" "}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[var(--color-primary-700)] underline">{SUPPORT_EMAIL}</a> to purchase.
                </p>
              ) : (
                <>
                  <div role="radiogroup" aria-label="Payment method" className="grid sm:grid-cols-2 gap-3 mb-5">
                    {ENABLED_METHODS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        role="radio"
                        aria-checked={method === m.id}
                        onClick={() => setMethod(m.id)}
                        className={cn("relative flex items-center gap-3 p-3 text-left", optionClass(method === m.id))}
                      >
                        <PaymentMethodIcon method={m.id} />
                        <span className="min-w-0">
                          <span className="block font-semibold text-[var(--color-text-primary)]">{m.label}</span>
                          <span className="block text-xs text-[var(--color-text-muted)]">{m.note}</span>
                        </span>
                        {method === m.id && <Check className="ml-auto h-4 w-4 shrink-0 text-[var(--color-primary-600)]" aria-hidden />}
                      </button>
                    ))}
                  </div>

                  <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm font-body">
                    <div className="flex items-center gap-2.5 mb-2">
                      <PaymentMethodIcon method={method} className="h-7 w-7 [&_svg]:h-4 [&_svg]:w-4 text-[12px]" />
                      <p className="font-semibold text-[var(--color-text-primary)]">Pay with {methodInfo?.label}</p>
                    </div>
                    <dl>
                      {method === "bank_transfer" && (
                        <>
                          {BANK_DETAILS.bankName && <DetailRow label="Bank name" value={BANK_DETAILS.bankName} />}
                          {BANK_DETAILS.accountName && <DetailRow label="Account name" value={BANK_DETAILS.accountName} copy />}
                          {BANK_DETAILS.branch && <DetailRow label="Branch" value={BANK_DETAILS.branch} />}
                          <DetailRow label="Account number" value={BANK_DETAILS.accountNumber} copy />
                          {BANK_DETAILS.swift && <DetailRow label="Routing / SWIFT" value={BANK_DETAILS.swift} copy />}
                        </>
                      )}
                      {method === "bkash" && (
                        <>
                          <DetailRow label="bKash number" value={BKASH_DETAILS.number} copy />
                          <DetailRow label="Account type" value={BKASH_DETAILS.type} />
                        </>
                      )}
                      {method === "payoneer" && <DetailRow label="Payoneer email" value={PAYONEER_DETAILS.email} copy />}
                      {method === "wise" && <DetailRow label="Wise email" value={WISE_DETAILS.email} copy />}
                      <DetailRow label="Amount to send" value={totalText} copy />
                    </dl>
                    <p className="flex items-start gap-1.5 text-xs text-[var(--color-text-muted)] mt-3">
                      <Info className="h-3.5 w-3.5 mt-px shrink-0" aria-hidden />
                      Send the exact amount, then enter the transaction ID below so we can match your payment.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Step 3 */}
          {ENABLED_METHODS.length > 0 && (
            <Card>
              <CardHeader>
                <StepTitle n={3}>Confirm your payment</StepTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Input
                  id="tx-ref"
                  label="Transaction ID"
                  placeholder={method === "bkash" ? "e.g. 2A7K3M9P5R" : "e.g. TXN-20241014-XXXXXX"}
                  value={txRef}
                  onChange={(e) => {
                    setTxRef(e.target.value);
                    if (errors.tx_ref) setErrors((er) => ({ ...er, tx_ref: "" }));
                  }}
                  hint={`Find it in your ${methodInfo?.label} receipt or confirmation message.`}
                  error={errors.tx_ref || undefined}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="slip" className="text-sm font-medium text-[var(--color-text-secondary)] font-body">
                    Payment receipt <span className="text-[var(--color-text-muted)] font-normal">(optional)</span>
                  </label>
                  {slip ? (
                    <div className="flex items-center justify-between gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
                      <span className="text-sm font-body text-[var(--color-text-primary)] truncate">{slip.name}</span>
                      <button type="button" onClick={clearSlip} aria-label="Remove receipt" className="text-[var(--color-text-muted)] hover:text-[var(--color-error)]">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="slip" className="border border-dashed border-[var(--color-border)] rounded-[var(--radius-md)] p-5 flex flex-col items-center gap-2 cursor-pointer hover:border-[var(--color-primary-500)] hover:bg-[var(--color-bg-elevated)] transition-colors focus-within:ring-2 focus-within:ring-[var(--color-primary-600)]/30">
                      <Upload className="h-5 w-5 text-[var(--color-text-muted)]" />
                      <span className="text-xs text-[var(--color-text-muted)] font-body">Click to upload a screenshot or PDF (JPG, PNG, PDF · max 5 MB)</span>
                    </label>
                  )}
                  <input id="slip" ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleSlipChange} className="sr-only" />
                  {errors.slip && <p className="text-xs text-[var(--color-error)] font-body">{errors.slip}</p>}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Right: sticky order summary ── */}
        <aside className="lg:sticky lg:top-6 flex flex-col gap-4" aria-label="Order summary">
          <Card>
            <CardHeader>
              <h2 className="text-h6 font-heading text-[var(--color-text-primary)]">Order summary</h2>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 text-sm font-body">
                <div className="flex justify-between gap-3 text-[var(--color-text-secondary)]">
                  <span>{summaryLine}</span>
                  <span>{formatMoney(subtotalUSD * fx, currency)}</span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {formatMoney(pricePerSeat * fx, currency)} per seat per year
                </p>
                {discountAmount > 0 && (
                  <div className="flex justify-between gap-3 text-[var(--color-success)]">
                    <span>Coupon {appliedCoupon?.code}</span>
                    <span className="font-semibold">-{formatMoney(discountAmount * fx, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline gap-3 pt-3 mt-1 border-t border-[var(--color-border-soft)]">
                  <span className="font-semibold text-[var(--color-text-primary)]">Total</span>
                  <span className="text-h4 font-heading text-[var(--color-text-primary)]">{totalText}</span>
                </div>
              </div>

              {/* Coupon */}
              {appliedCoupon?.valid ? (
                <div className="flex items-center justify-between gap-3 p-2.5 rounded-[var(--radius-md)] border border-[var(--color-success-border)] bg-[var(--color-success-bg)]">
                  <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-success)] font-body">
                    <Tag className="h-4 w-4" /> {appliedCoupon.code}
                  </span>
                  <button type="button" onClick={removeCoupon} aria-label="Remove coupon"
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    aria-label="Coupon code"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    leftIcon={<Tag className="h-4 w-4" />}
                  />
                  <Button variant="secondary" size="md" onClick={handleApplyCoupon} disabled={!couponCode.trim() || couponLoading} loading={couponLoading}>
                    Apply
                  </Button>
                </div>
              )}

              <ul className="flex flex-col gap-1.5">
                {["Full feature access", `${billedYears} year${billedYears > 1 ? "s" : ""} of updates`, "Lifetime use of current version", "Up to 2 devices per seat"].map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] font-body">
                    <Check className="h-3 w-3 text-[var(--color-primary-600)]" /> {f}
                  </li>
                ))}
              </ul>

              {ENABLED_METHODS.length > 0 && (
                <>
                  <Button variant="cta" size="lg" className="w-full" loading={loading} onClick={handleCheckout}>
                    {submitLabel} · {totalText}
                  </Button>
                  <p className="text-xs text-[var(--color-text-muted)] font-body text-center -mt-1">
                    {txRef.trim()
                      ? "We review payments and update your license within 24 hours."
                      : "Send the payment first, then add its transaction ID in step 3."}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* ── History ── */}
      <Card>
        <CardHeader>
          <h2 className="text-h6 font-heading text-[var(--color-text-primary)]">Payment history</h2>
        </CardHeader>
        <CardContent>
          {payments.loading ? (
            <PageSpinner />
          ) : payments.error ? (
            <p className="text-sm text-[var(--color-error)] font-body">{payments.error}</p>
          ) : (
            <>
              <PaymentsTable payments={payments.data?.data ?? []} />
              <Pagination page={page} lastPage={payments.data?.meta.last_page ?? 1} onPage={setPage} />
            </>
          )}
          <p className="mt-4 text-xs text-[var(--color-text-muted)] font-body">
            Questions about a payment? Email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[var(--color-primary-700)] hover:underline">{SUPPORT_EMAIL}</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
