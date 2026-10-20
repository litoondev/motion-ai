"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { authService } from "@/services/auth";
import { errorMessage, fieldErrors } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailError, setEmailError] = useState<string>();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setEmailError(undefined);
    try {
      await authService.forgotPassword({ email: email.trim() });
      setSent(true);
    } catch (err) {
      const fields = fieldErrors(err);
      if (fields.email) setEmailError(fields.email);
      else toast.error(errorMessage(err, "Failed to send reset email."));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <Card className="w-full max-w-md p-8 text-center">
        <Mail className="h-10 w-10 text-[var(--color-primary-600)] mx-auto mb-4" />
        <h1 className="text-h4 font-heading text-[var(--color-text-primary)] mb-2">Check your email</h1>
        <p className="text-sm text-[var(--color-text-secondary)] font-body">
          If an account exists for <strong>{email}</strong>, we sent a password reset link. Check your inbox and spam folder.
        </p>
        <Link href="/login/" className="mt-6 inline-flex items-center gap-1 text-sm text-[var(--color-primary-600)] hover:underline font-body">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-8">
        <div className="mb-8 text-center">
          <Badge variant="primary" className="mb-3">Password reset</Badge>
          <h1 className="text-h3 font-heading text-[var(--color-text-primary)]">Forgot your password?</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)] font-body">
            Enter your email address and we will send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Email address" type="email" placeholder="you@example.com" value={email}
            onChange={(e) => setEmail(e.target.value)} autoComplete="email" error={emailError} required />
          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}
            rightIcon={<ArrowRight className="h-4 w-4" />}>
            Send reset link
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--color-text-muted)] font-body">
          <Link href="/login/" className="text-[var(--color-primary-600)] hover:underline">Back to sign in</Link>
        </p>
      </CardContent>
    </Card>
  );
}
