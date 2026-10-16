"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { resetPasswordAction } from "@/app/actions/auth";

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password || !passwordConfirm || !token) return;

    if (password !== passwordConfirm) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const result = await resetPasswordAction({
      email,
      password,
      password_confirmation: passwordConfirm,
      token,
    });
    setLoading(false);

    if (result.success) {
      setSuccess(true);
    } else {
      toast.error(result.error ?? "Failed to reset password.");
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
        <Button variant="primary" size="lg" onClick={() => router.push("/login")}>
          Sign in
        </Button>
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
        <Link href="/forgot-password" className="text-sm text-[var(--color-primary-600)] hover:underline font-body">
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
          <Input label="Email address" type="email" placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          <Input
            label="New password"
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
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
            required
          />
          <Button type="submit" variant="primary" size="lg" className="w-full"
            loading={loading} rightIcon={<ArrowRight className="h-4 w-4" />}>
            Reset password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md h-96 card animate-shimmer rounded-[var(--radius-lg)]" />
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
