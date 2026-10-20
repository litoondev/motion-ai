"use client";
import { useState } from "react";
import { MailWarning } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authService } from "@/services/auth";
import { errorMessage } from "@/lib/api";

export function VerifyEmailBanner({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleResend() {
    setLoading(true);
    try {
      await authService.resendVerification();
      setSent(true);
      toast.success("Verification email sent.");
    } catch (err) {
      toast.error(errorMessage(err, "Could not send the verification email."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-4 flex items-center gap-4 flex-wrap border-[var(--color-warning)]">
      <MailWarning className="h-5 w-5 text-[var(--color-warning)] shrink-0" />
      <div className="flex-1 min-w-48">
        <p className="text-sm font-semibold text-[var(--color-text-primary)] font-body">Verify your email address</p>
        <p className="text-xs text-[var(--color-text-secondary)] font-body">
          We sent a link to {email}. Open it to confirm your account.
        </p>
      </div>
      <Button variant="secondary" size="sm" loading={loading} disabled={sent} onClick={handleResend}>
        {sent ? "Email sent" : "Resend email"}
      </Button>
    </Card>
  );
}
