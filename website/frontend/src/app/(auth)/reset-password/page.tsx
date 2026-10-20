"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { authService } from "@/services/auth";
import { errorMessage, fieldErrors } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();

  const token = params.get("token") ?? "";
  const emailParam = params.get("email") ?? "";

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    if (password !== passwordConfirm) next.password_confirmation = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await authService.resetPassword({ email: email.trim(), password, password_confirmation: passwordConfirm, token });
      setSuccess(true);
    } catch (err) {
      const fields = fieldErrors(err);
      setErrors(fields);
      toast.error(errorMessage(err, "Failed to reset password."));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md p-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-[var(--color-success)] mx-auto mb-4" />
        <h1 className="text-h4 font-heading text-[var(--color-text-primary)] mb-2">Password reset!</h1>
        <p className="text-sm text-[var(--color-text-secondary)] font-body mb-6">
          Your password has been reset successfully. You can now sign in with your new password.
        </p>
        <Button variant="primary" size="lg" onClick={() => router.push("/login/")}>Sign in</Button>
      </Card>
    );
  }

  if (!token) {
    return (
      <Card className="w-full max-w-md p-8 text-center">
        <h1 className="text-h4 font-heading text-[var(--color-text-primary)] mb-2">Invalid reset link</h1>
        <p className="text-sm text-[var(--color-text-secondary)] font-body mb-6">
          This password reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password/" className="text-sm text-[var(--color-primary-600)] hover:underline font-body">
          Request a new reset link
        </Link>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-8">
        <div className="mb-8 text-center">
          <Badge variant="primary" className="mb-3">Reset password</Badge>
          <h1 className="text-h3 font-heading text-[var(--color-text-primary)]">Set new password</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)] font-body">
            Choose a strong password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Email address" type="email" placeholder="you@example.com" value={email}
            onChange={(e) => setEmail(e.target.value)} autoComplete="email" error={errors.email} required />
          <Input
            label="New password"
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            error={errors.password}
            required
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          <Input
            label="Confirm new password"
            type={showPassword ? "text" : "password"}
            placeholder="Repeat your new password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            autoComplete="new-password"
            error={errors.password_confirmation}
            required
          />
          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}
            rightIcon={<ArrowRight className="h-4 w-4" />}>
            Reset password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-96 card animate-shimmer rounded-[var(--radius-lg)]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
