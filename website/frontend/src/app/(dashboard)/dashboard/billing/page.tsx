"use client";
import { useRef, useState } from "react";
import { Building2, Check, Clock, Key, Minus, Plus, Smartphone, Tag, Upload, Wallet, X } from "lucide-react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { PageSpinner } from "@/components/ui/spinner";
import { PaymentsTable } from "@/components/dashboard/payments-table";
import { errorMessage, fieldErrors } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
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

type Method = "bank_transfer" | "bkash" | "payoneer" | "wise";
type Currency = "USD" | "BDT";

const BDT_RATE = 121;

const MAX_SLIP_BYTES = 5 * 1024 * 1024;
const SLIP_TYPES = ["image/jpeg", "image/png", "application/pdf"];

const optionClass = (active: boolean) =>
  cn(
    "border transition-colors font-body text-sm rounded-[var(--radius-md)]",
    active
      ? "border-[var(--color-primary-500)] bg-[color-mix(in_srgb,var(--color-primary-500)_10%,transparent)] text-[var(--color-primary-700)]"
      : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-soft)]"
  );

type Mode = "new" | "add_seats" | "extend";

export default function BillingPage() {
  const { user } = useAuth();
  const { pricing, loaded } = usePricing();
  const dashboard = useFetch(() => userService.dashboard());
  const activeLicense = dashboard.data?.licenses?.find(
    (l) => l.status === "active" && !isExpired(l.expires_at)
  );
  const hasActiveLicense = Boolean(activeLicense);

  const [mode, setMode] = useState<Mode>(hasActiveLicense ? "add_seats" : "new");
  const [seats, setSeats] = useState(1);
  const [years, setYears] = useState(1);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [method, setMethod] = useState<Method>("bank_transfer");
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

  const pricePerSeat = seats >= pricing.team_threshold ? pricing.team_price_per_seat_year : pricing.price_per_seat_year;
  const subtotalUSD = seats * years * pricePerSeat;

  let discountAmount = 0;
  if (appliedCoupon?.valid) {
    if (appliedCoupon.discount_percent > 0) {
      discountAmount = subtotalUSD * (appliedCoupon.discount_percent / 100);
    }
    if (appliedCoupon.discount_flat) {
      discountAmount += appliedCoupon.discount_flat;
    }
    discountAmount = Math.min(discountAmount, subtotalUSD);
  }
  const totalUSD = subtotalUSD - discountAmount;
  const displayTotal = currency === "BDT" ? totalUSD * BDT_RATE : totalUSD;
  const displaySubtotal = currency === "BDT" ? subtotalUSD * BDT_RATE : subtotalUSD;
  const displayDiscount = currency === "BDT" ? discountAmount * BDT_RATE : discountAmount;
  const displayPerSeat = currency === "BDT" ? pricePerSeat * BDT_RATE : pricePerSeat;
  const currencyCode = currency;

  const hasPending = payments.data?.data.some((p) => p.status === "pending");

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
        toast.success(`Coupon "${code}" applied! ${result.discount_percent}% off`);
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
    setLoading(true);
    setErrors({});
    try {
      const coupon = appliedCoupon?.valid ? appliedCoupon.code : undefined;
      await userService.checkoutBank({ seats, years, txRef: txRef.trim(), slip, currency, coupon, method });
      toast.success("Payment request submitted! We will verify it and activate your license within 24 hours.");
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

  if (!loaded) return <PageSpinner />;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="pb-6 border-b border-[var(--color-border-soft)] mb-6">
        <h1 className="text-xl font-bold font-heading text-[var(--color-text-primary)] leading-tight">
          {hasActiveLicense ? "Manage License" : "Purchase License"}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] font-body mt-1">
          {hasActiveLicense
            ? "Add extra seats or extend your license duration."
            : "Configure your seats and duration, then choose a payment method."}
        </p>
      </div>

      {/* ── Current license (upgrade mode) ── */}
      {activeLicense && (
        <Card className="border-[var(--color-primary-500)]">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-[var(--color-primary-600)]" />
                <h2 className="text-h6 font-heading text-[var(--color-text-primary)]">Current License</h2>
              </div>
              <Badge variant="success" dot>Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] font-body">Seats</p>
                <p className="text-sm font-semibold text-[var(--color-text-primary)] font-body">{activeLicense.seat_count}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] font-body">Expires</p>
                <p className="text-sm font-semibold text-[var(--color-text-primary)] font-body">
                  {activeLicense.expires_at ? formatDate(activeLicense.expires_at) : "Never"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] font-body">Devices</p>
                <p className="text-sm font-semibold text-[var(--color-text-primary)] font-body">
                  {activeLicense.active_devices} / {activeLicense.max_devices}
                </p>
              </div>
            </div>

            {hasPending && (
              <div className="flex items-center gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)]">
                <Clock className="h-4 w-4 text-[var(--color-warning)] shrink-0" />
                <p className="text-xs text-[var(--color-warning)] font-body font-semibold">
                  Payment under review — your update will be applied once approved.
                </p>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => setMode("add_seats")}
                className={cn("flex-1 py-2.5 text-center", optionClass(mode === "add_seats"))}
              >
                Add Extra Seats
              </button>
              <button
                type="button"
                onClick={() => setMode("extend")}
                className={cn("flex-1 py-2.5 text-center", optionClass(mode === "extend"))}
              >
                Extend Duration
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Configurator ── */}
      <Card>
        <CardHeader>
          <h2 className="text-h6 font-heading text-[var(--color-text-primary)]">
            {hasActiveLicense
              ? mode === "add_seats" ? "Add extra seats" : mode === "extend" ? "Extend duration" : "Configure your license"
              : "Configure your license"}
          </h2>
        </CardHeader>
        <CardContent>
          {/* Currency selector */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-[var(--color-text-secondary)] font-body mb-3">Currency</p>
            <div className="flex gap-2">
              {(["USD", "BDT"] as Currency[]).map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCurrency(c)}
                  aria-pressed={currency === c}
                  className={cn("px-4 py-2 flex items-center gap-2", optionClass(currency === c))}
                >
                  <span className="font-semibold">{c === "USD" ? "$" : "৳"}</span>
                  {c === "USD" ? "US Dollar" : "Bangladeshi Taka"}
                </button>
              ))}
            </div>
            {currency === "BDT" && (
              <p className="text-xs text-[var(--color-text-muted)] font-body mt-2">
                1 USD = ৳{BDT_RATE} (approximate rate)
              </p>
            )}
          </div>

          {mode !== "extend" && <div className="mb-6">
            <p className="text-sm font-semibold text-[var(--color-text-secondary)] font-body mb-3">Number of seats (users)</p>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                type="button"
                onClick={() => adjustSeats(-1)}
                disabled={seats <= 1}
                aria-label="Remove a seat"
                className="w-8 h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-primary)] hover:border-[var(--color-primary-500)] transition-colors disabled:opacity-40"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-h4 font-heading text-[var(--color-text-primary)] w-12 text-center" aria-live="polite">
                {seats}
              </span>
              <button
                type="button"
                onClick={() => adjustSeats(1)}
                disabled={seats >= 100}
                aria-label="Add a seat"
                className="w-8 h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-primary)] hover:border-[var(--color-primary-500)] transition-colors disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              {seats >= pricing.team_threshold && <Badge variant="success">Team discount applied</Badge>}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] font-body mt-2">
              Each seat allows up to 2 authorized devices.
            </p>
          </div>}

          {mode !== "add_seats" && <div className="mb-6">
            <p className="text-sm font-semibold text-[var(--color-text-secondary)] font-body mb-3">Duration (years)</p>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3].map((y) => (
                <button
                  type="button"
                  key={y}
                  onClick={() => setYears(y)}
                  aria-pressed={years === y}
                  className={cn("px-4 py-2", optionClass(years === y))}
                >
                  {y} year{y > 1 ? "s" : ""}
                </button>
              ))}
            </div>
          </div>}

          {/* Coupon code */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-[var(--color-text-secondary)] font-body mb-3">Coupon code</p>
            {appliedCoupon?.valid ? (
              <div className="flex items-center justify-between gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--color-success-border)] bg-[var(--color-success-bg)]">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[var(--color-success)]" />
                  <span className="text-sm font-semibold text-[var(--color-success)] font-body">{appliedCoupon.code}</span>
                  <Badge variant="success">{appliedCoupon.discount_percent}% off</Badge>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  aria-label="Remove coupon"
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  leftIcon={<Tag className="h-4 w-4" />}
                  className="flex-1"
                />
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || couponLoading}
                  loading={couponLoading}
                >
                  Apply
                </Button>
              </div>
            )}
          </div>

          {/* Price summary */}
          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border-soft)]">
            <div className="flex justify-between gap-3 text-sm font-body text-[var(--color-text-secondary)]">
              <span>
                {seats} seat{seats > 1 ? "s" : ""} × {years} year{years > 1 ? "s" : ""} × {formatMoney(displayPerSeat, currencyCode)}/seat/year
              </span>
              <span className="text-sm font-body text-[var(--color-text-secondary)]">{formatMoney(displaySubtotal, currencyCode)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between gap-3 text-sm font-body mt-2">
                <span className="text-[var(--color-success)]">
                  Coupon discount ({appliedCoupon!.discount_percent}%)
                </span>
                <span className="text-[var(--color-success)] font-semibold">
                  -{formatMoney(displayDiscount, currencyCode)}
                </span>
              </div>
            )}

            <div className="flex justify-between gap-3 mt-2 pt-2 border-t border-[var(--color-border-soft)]">
              <span className="text-sm font-semibold text-[var(--color-text-primary)] font-body">Total</span>
              <span className="text-h5 font-heading text-[var(--color-text-primary)]">{formatMoney(displayTotal, currencyCode)}</span>
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

      {/* ── Payment method ── */}
      <Card>
        <CardHeader>
          <h2 className="text-h6 font-heading text-[var(--color-text-primary)]">Payment method</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {BANK_TRANSFER_ENABLED && (
              <button type="button" onClick={() => setMethod("bank_transfer")} aria-pressed={method === "bank_transfer"}
                className={cn("flex items-center gap-2 p-3", optionClass(method === "bank_transfer"))}>
                <Building2 className="h-4 w-4" /> Bank Transfer
              </button>
            )}
            {BKASH_ENABLED && (
              <button type="button" onClick={() => setMethod("bkash")} aria-pressed={method === "bkash"}
                className={cn("flex items-center gap-2 p-3", optionClass(method === "bkash"))}>
                <Smartphone className="h-4 w-4" /> bKash
              </button>
            )}
            {PAYONEER_ENABLED && (
              <button type="button" onClick={() => setMethod("payoneer")} aria-pressed={method === "payoneer"}
                className={cn("flex items-center gap-2 p-3", optionClass(method === "payoneer"))}>
                <Wallet className="h-4 w-4" /> Payoneer
              </button>
            )}
            {WISE_ENABLED && (
              <button type="button" onClick={() => setMethod("wise")} aria-pressed={method === "wise"}
                className={cn("flex items-center gap-2 p-3", optionClass(method === "wise"))}>
                <Wallet className="h-4 w-4" /> Wise
              </button>
            )}
          </div>

          {/* Bank Transfer details */}
          {method === "bank_transfer" && BANK_TRANSFER_ENABLED && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm font-body">
                <p className="font-semibold text-[var(--color-text-primary)] mb-2">Bank transfer details</p>
                <dl className="grid grid-cols-2 gap-y-1.5 text-[var(--color-text-secondary)]">
                  {BANK_DETAILS.bankName && (<><dt className="text-[var(--color-text-muted)]">Bank name</dt><dd>{BANK_DETAILS.bankName}</dd></>)}
                  {BANK_DETAILS.accountName && (<><dt className="text-[var(--color-text-muted)]">Account name</dt><dd>{BANK_DETAILS.accountName}</dd></>)}
                  {BANK_DETAILS.branch && (<><dt className="text-[var(--color-text-muted)]">Branch</dt><dd>{BANK_DETAILS.branch}</dd></>)}
                  <dt className="text-[var(--color-text-muted)]">Account no.</dt><dd>{BANK_DETAILS.accountNumber}</dd>
                  {BANK_DETAILS.swift && (<><dt className="text-[var(--color-text-muted)]">Routing/SWIFT</dt><dd>{BANK_DETAILS.swift}</dd></>)}
                  <dt className="text-[var(--color-text-muted)]">Amount</dt>
                  <dd className="text-[var(--color-primary-700)] font-semibold">{formatMoney(displayTotal, currencyCode)}</dd>
                </dl>
              </div>
            </div>
          )}

          {/* bKash details */}
          {method === "bkash" && BKASH_ENABLED && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm font-body">
                <p className="font-semibold text-[var(--color-text-primary)] mb-2">bKash payment details</p>
                <dl className="grid grid-cols-2 gap-y-1.5 text-[var(--color-text-secondary)]">
                  <dt className="text-[var(--color-text-muted)]">bKash number</dt><dd>{BKASH_DETAILS.number}</dd>
                  <dt className="text-[var(--color-text-muted)]">Account type</dt><dd>{BKASH_DETAILS.type}</dd>
                  <dt className="text-[var(--color-text-muted)]">Amount</dt>
                  <dd className="text-[var(--color-primary-700)] font-semibold">{formatMoney(displayTotal, currencyCode)}</dd>
                </dl>
                <p className="text-xs text-[var(--color-text-muted)] mt-3">
                  Send the exact amount to the bKash number above, then enter the Transaction ID below.
                </p>
              </div>
            </div>
          )}

          {/* Payoneer details */}
          {method === "payoneer" && PAYONEER_ENABLED && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm font-body">
                <p className="font-semibold text-[var(--color-text-primary)] mb-2">Payoneer payment details</p>
                <dl className="grid grid-cols-2 gap-y-1.5 text-[var(--color-text-secondary)]">
                  <dt className="text-[var(--color-text-muted)]">Payoneer email</dt><dd>{PAYONEER_DETAILS.email}</dd>
                  <dt className="text-[var(--color-text-muted)]">Amount</dt>
                  <dd className="text-[var(--color-primary-700)] font-semibold">{formatMoney(displayTotal, currencyCode)}</dd>
                </dl>
                <p className="text-xs text-[var(--color-text-muted)] mt-3">
                  Send the payment to the Payoneer email above, then enter the Transaction ID below.
                </p>
              </div>
            </div>
          )}

          {/* Wise details */}
          {method === "wise" && WISE_ENABLED && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm font-body">
                <p className="font-semibold text-[var(--color-text-primary)] mb-2">Wise payment details</p>
                <dl className="grid grid-cols-2 gap-y-1.5 text-[var(--color-text-secondary)]">
                  <dt className="text-[var(--color-text-muted)]">Wise email</dt><dd>{WISE_DETAILS.email}</dd>
                  <dt className="text-[var(--color-text-muted)]">Amount</dt>
                  <dd className="text-[var(--color-primary-700)] font-semibold">{formatMoney(displayTotal, currencyCode)}</dd>
                </dl>
                <p className="text-xs text-[var(--color-text-muted)] mt-3">
                  Send the payment to the Wise email above, then enter the Transaction ID below.
                </p>
              </div>
            </div>
          )}

          {/* Common: Transaction ref, receipt upload, submit note */}
          <div className="flex flex-col gap-4 mt-4">
            <Input
              label="Transaction reference / ID"
              placeholder={method === "bkash" ? "e.g. TrxID 2A7K3M9P5R" : "e.g. TXN-20241014-XXXXXX"}
              value={txRef}
              onChange={(e) => setTxRef(e.target.value)}
              hint={`Enter the reference number from your ${method === "bkash" ? "bKash" : method === "payoneer" ? "Payoneer" : method === "wise" ? "Wise" : "bank"} transfer.`}
              error={errors.tx_ref}
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="slip" className="text-sm font-semibold text-[var(--color-text-secondary)] font-body">
                Upload payment receipt (optional)
              </label>
              {slip ? (
                <div className="flex items-center justify-between gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
                  <span className="text-sm font-body text-[var(--color-text-primary)] truncate">{slip.name}</span>
                  <button type="button" onClick={clearSlip} aria-label="Remove receipt" className="text-[var(--color-text-muted)] hover:text-[var(--color-error)]">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label htmlFor="slip" className="border border-dashed border-[var(--color-border-soft)] rounded-[var(--radius-md)] p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-[var(--color-primary-500)] transition-colors">
                  <Upload className="h-5 w-5 text-[var(--color-text-muted)]" />
                  <span className="text-xs text-[var(--color-text-muted)] font-body">Click to choose a file (JPG, PNG, PDF - max 5 MB)</span>
                </label>
              )}
              <input id="slip" ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleSlipChange} className="sr-only" />
              {errors.slip && <p className="text-xs text-[var(--color-error)] font-body">{errors.slip}</p>}
            </div>

            <p className="text-xs text-[var(--color-text-muted)] font-body">
              After submitting, we will review your payment and activate your license within 24 hours.
              {hasPending && " You already have a payment waiting for review."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Button
        variant="cta"
        size="lg"
        className="self-start"
        loading={loading}
        onClick={handleCheckout}
        disabled={!txRef.trim()}
      >
        {hasActiveLicense
          ? mode === "add_seats"
            ? `Add ${seats} seat${seats > 1 ? "s" : ""} — ${formatMoney(displayTotal, currencyCode)}`
            : `Extend ${years} year${years > 1 ? "s" : ""} — ${formatMoney(displayTotal, currencyCode)}`
          : `Submit payment request (${formatMoney(displayTotal, currencyCode)})`}
      </Button>

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
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[var(--color-primary-600)] hover:underline">{SUPPORT_EMAIL}</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
