"use client";
import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageSpinner } from "@/components/ui/spinner";
import { ActivateTrialButton } from "@/components/dashboard/activate-trial-button";
import { LicenseCard } from "@/components/dashboard/license-card";
import { PaymentsTable } from "@/components/dashboard/payments-table";
import { VerifyEmailBanner } from "@/components/dashboard/verify-email-banner";
import { useAuth } from "@/lib/auth-context";
import { useFetch } from "@/lib/use-fetch";
import { usePricing } from "@/lib/use-pricing";
import { daysUntil, isExpired } from "@/lib/utils";
import { userService } from "@/services/user";
import type { License } from "@/lib/types";

/** Shows a toast for links coming back from e-mail (?verified=1) or Stripe (?payment=success). */
function QueryToasts() {
  const params = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const verified = params.get("verified");
    const payment = params.get("payment");
    if (!verified && !payment) return;

    if (verified === "1") {
      toast.success("Email verified. Thank you!");
      void refreshUser();
    } else if (verified) {
      toast.error("That verification link is invalid or has expired.");
    }
    if (payment === "success") {
      toast.success("Payment received. Your license will appear here shortly.");
    } else if (payment === "cancelled") {
      toast("Payment cancelled. You have not been charged.");
    }
    router.replace("/dashboard/");
  }, [params, router, refreshUser]);

  return null;
}

/** Active & not expired first, then everything else (newest first as returned by the API). */
function sortLicenses(licenses: License[]): License[] {
  const rank = (l: License) => (l.status === "active" && !isExpired(l.expires_at) ? 0 : 1);
  return [...licenses].sort((a, b) => rank(a) - rank(b));
}

export default function DashboardPage() {
  const { data, loading, error, reload } = useFetch(() => userService.dashboard(), [], { cacheKey: "dashboard" });
  const { pricing } = usePricing();

  if (loading) return <PageSpinner label="Loading your dashboard…" />;

  if (error || !data) {
    return (
      <Card className="p-6 flex flex-col items-start gap-3">
        <p className="text-sm font-semibold text-[var(--color-text-primary)] font-body">Could not load your dashboard</p>
        <p className="text-sm text-[var(--color-text-secondary)] font-body">{error}</p>
        <Button variant="secondary" size="sm" onClick={reload}>Try again</Button>
      </Card>
    );
  }

  const { user, recent_payments } = data;
  const licenses = sortLicenses(data.licenses);
  const primary = licenses[0] ?? null;
  const primaryExpired = primary ? isExpired(primary.expires_at) || primary.status === "expired" : false;
  const primaryIsTrial = primary?.type === "trial";
  const primaryDaysLeft = primary?.expires_at ? daysUntil(primary.expires_at) : 0;
  const hasPendingPayment = recent_payments.some((p) => p.status === "pending");

  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={null}>
        <QueryToasts />
      </Suspense>

      <div className="pb-6 border-b border-[var(--color-border-soft)]">
        <h1 className="text-xl font-bold font-heading text-[var(--color-text-primary)] leading-tight">Dashboard</h1>
        <p className="text-sm text-[var(--color-text-muted)] font-body mt-1">
          Welcome back, {user.name || user.email}
        </p>
      </div>

      {!user.email_verified_at && <VerifyEmailBanner email={user.email} />}

      {/* Status banners */}
      {!primary && (
        <Card className="p-4 flex items-center gap-4 flex-wrap border-[var(--color-warning)]">
          <AlertTriangle className="h-5 w-5 text-[var(--color-warning)] shrink-0" />
          <div className="flex-1 min-w-48">
            <p className="text-sm font-semibold text-[var(--color-text-primary)] font-body">No active license</p>
            <p className="text-xs text-[var(--color-text-secondary)] font-body">
              {user.trial_used
                ? "Your free trial has been used. Purchase a license to keep using Motion AI."
                : "Start a free trial or purchase a license to use Motion AI."}
            </p>
          </div>
          {!user.trial_used && <ActivateTrialButton days={pricing.trial_days} onActivated={reload} />}
          <Button variant={user.trial_used ? "cta" : "secondary"} size="sm" asChild>
            <Link href="/dashboard/billing/">Buy a license</Link>
          </Button>
        </Card>
      )}

      {primary && primaryExpired && (
        <Card className="p-4 flex items-center gap-4 flex-wrap border-[var(--color-error)]">
          <AlertTriangle className="h-5 w-5 text-[var(--color-error)] shrink-0" />
          <div className="flex-1 min-w-48">
            <p className="text-sm font-semibold text-[var(--color-text-primary)] font-body">
              {primaryIsTrial ? "Trial expired" : "License expired"}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] font-body">
              {primaryIsTrial
                ? "Your trial has ended. Purchase a license to continue."
                : "Your license has expired. Renew to get updates. Your current version still works."}
            </p>
          </div>
          <Button variant="cta" size="sm" asChild>
            <Link href="/dashboard/billing/">Renew license</Link>
          </Button>
        </Card>
      )}

      {primary && !primaryExpired && primaryIsTrial && primaryDaysLeft <= 3 && (
        <Card className="p-4 flex items-center gap-4 flex-wrap border-[var(--color-warning)]">
          <Clock className="h-5 w-5 text-[var(--color-warning)] shrink-0" />
          <div className="flex-1 min-w-48">
            <p className="text-sm font-semibold text-[var(--color-text-primary)] font-body">
              {primaryDaysLeft} day{primaryDaysLeft !== 1 ? "s" : ""} left in trial
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] font-body">
              Purchase before your trial ends to keep access.
            </p>
          </div>
          <Button variant="cta" size="sm" asChild>
            <Link href="/dashboard/billing/">Buy now</Link>
          </Button>
        </Card>
      )}

      {hasPendingPayment && (
        <Card className="p-4 flex items-center gap-4 flex-wrap border-[var(--color-warning)]">
          <Clock className="h-5 w-5 text-[var(--color-warning)] shrink-0" />
          <div className="flex-1 min-w-48">
            <p className="text-sm font-semibold text-[var(--color-text-primary)] font-body">Payment under review</p>
            <p className="text-xs text-[var(--color-text-secondary)] font-body">
              Your payment is pending approval. Your license will be activated once our team verifies the payment.
            </p>
          </div>
        </Card>
      )}

      {licenses.map((license) => (
        <LicenseCard key={license.id} license={license} onChange={reload} />
      ))}

      {recent_payments.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-h6 font-heading text-[var(--color-text-primary)]">Recent payments</h2>
              <Link href="/dashboard/billing/" className="text-xs text-[var(--color-primary-600)] hover:underline font-body">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <PaymentsTable payments={recent_payments} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
