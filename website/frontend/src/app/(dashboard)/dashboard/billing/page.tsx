"use client";
import { useRef, useState } from "react";
import { Building2, Check, CreditCard, Minus, Plus, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { PageSpinner } from "@/components/ui/spinner";
import { PaymentsTable } from "@/components/dashboard/payments-table";
import { errorMessage, fieldErrors } from "@/lib/api";
import { BANK_DETAILS, BANK_TRANSFER_ENABLED, SUPPORT_EMAIL } from "@/lib/config";
import { useFetch } from "@/lib/use-fetch";
import { usePricing } from "@/lib/use-pricing";
import { cn, formatMoney } from "@/lib/utils";
import { userService } from "@/services/user";

type Method = "card" | "bank_transfer";

const MAX_SLIP_BYTES = 5 * 1024 * 1024;
const SLIP_TYPES = ["image/jpeg", "image/png", "application/pdf"];

const optionClass = (active: boolean) =>
  cn(
    "border transition-colors font-body text-sm rounded-[var(--radius-md)]",
    active
      ? "border-[var(--color-primary-500)] bg-[color-mix(in_srgb,var(--color-primary-500)_10%,transparent)] text-[var(--color-primary-700)]"
      : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-soft)]"
  );

export default function BillingPage() {
  const { pricing, loaded } = usePricing();
  const [seats, setSeats] = useState(1);
  const [years, setYears] = useState(1);
  const [method, setMethod] = useState<Method>("card");
  const [txRef, setTxRef] = useState("");
  const [slip, setSlip] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const [page, setPage] = useState(1);
  const payments = useFetch(() => userService.payments(page), [page]);

  const pricePerSeat = seats >= pricing.team_threshold ? pricing.team_price_per_seat_year : pricing.price_per_seat_year;
  const totalPrice = seats * years * pricePerSeat;
  const hasPending = payments.data?.data.some((p) => p.status === "pending" && p.method === "bank_transfer");

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

  async function handleCheckout() {
    setLoading(true);
    setErrors({});
    try {
      if (method === "card") {
        const { checkout_url } = await userService.checkoutCard({ seats, years });
        window.location.href = checkout_url; // Stripe-hosted checkout
        return; // keep the button in its loading state while the browser navigates away
      }

      await userService.checkoutBank({ seats, years, txRef: txRef.trim(), slip });
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
          <div className="mb-6">
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
          </div>

          <div className="mb-6">
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
          </div>

          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border-soft)]">
            <div className="flex justify-between gap-3 text-sm font-body text-[var(--color-text-secondary)]">
              <span>
                {seats} seat{seats > 1 ? "s" : ""} × {years} year{years > 1 ? "s" : ""} × {formatMoney(pricePerSeat)}/seat/year
              </span>
              <span className="text-h5 font-heading text-[var(--color-text-primary)]">{formatMoney(totalPrice)}</span>
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
          <div className="flex gap-3 mb-6 flex-wrap">
            <button type="button" onClick={() => setMethod("card")} aria-pressed={method === "card"}
              className={cn("flex-1 min-w-36 flex items-center gap-2 p-3", optionClass(method === "card"))}>
              <CreditCard className="h-4 w-4" /> Card payment
            </button>
            {BANK_TRANSFER_ENABLED && (
              <button type="button" onClick={() => setMethod("bank_transfer")} aria-pressed={method === "bank_transfer"}
                className={cn("flex-1 min-w-36 flex items-center gap-2 p-3", optionClass(method === "bank_transfer"))}>
                <Building2 className="h-4 w-4" /> Bank transfer
              </button>
            )}
          </div>

          {method === "card" && (
            <p className="text-sm text-[var(--color-text-secondary)] font-body">
              You will be redirected to a secure checkout page (Stripe). Domestic and international cards accepted.
            </p>
          )}

          {method === "bank_transfer" && BANK_TRANSFER_ENABLED && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm font-body">
                <p className="font-semibold text-[var(--color-text-primary)] mb-2">Bank transfer details</p>
                <dl className="grid grid-cols-2 gap-y-1.5 text-[var(--color-text-secondary)]">
                  {BANK_DETAILS.bankName && (<><dt className="text-[var(--color-text-muted)]">Bank name</dt><dd>{BANK_DETAILS.bankName}</dd></>)}
                  {BANK_DETAILS.accountName && (<><dt className="text-[var(--color-text-muted)]">Account name</dt><dd>{BANK_DETAILS.accountName}</dd></>)}
                  <dt className="text-[var(--color-text-muted)]">Account no.</dt><dd>{BANK_DETAILS.accountNumber}</dd>
                  {BANK_DETAILS.swift && (<><dt className="text-[var(--color-text-muted)]">Routing/SWIFT</dt><dd>{BANK_DETAILS.swift}</dd></>)}
                  <dt className="text-[var(--color-text-muted)]">Amount</dt>
                  <dd className="text-[var(--color-primary-700)] font-semibold">{formatMoney(totalPrice)} USD</dd>
                </dl>
              </div>

              <Input
                label="Transaction reference / ID"
                placeholder="e.g. TXN-20241014-XXXXXX"
                value={txRef}
                onChange={(e) => setTxRef(e.target.value)}
                hint="Enter the reference number from your bank transfer."
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
          )}
        </CardContent>
      </Card>

      <Button
        variant="cta"
        size="lg"
        className="self-start"
        loading={loading}
        onClick={handleCheckout}
        disabled={method === "bank_transfer" && !txRef.trim()}
      >
        {method === "card" ? `Pay ${formatMoney(totalPrice)}` : "Submit payment request"}
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
