"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GoogleButton, GOOGLE_ENABLED } from "@/components/auth/google-button";
import { authService } from "@/services/auth";
import { useAuth } from "@/lib/auth-context";
import { errorMessage, fieldErrors } from "@/lib/api";
import { safeCallbackUrl } from "@/lib/utils";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const callbackUrl = safeCallbackUrl(params.get("callbackUrl"));

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setErrors({});
    try {
      const { token, user } = await authService.login({ email: email.trim(), password });
      signIn(token, user);
      router.replace(callbackUrl);
    } catch (err) {
      const fields = fieldErrors(err);
      setErrors(fields);
      if (Object.keys(fields).length === 0) toast.error(errorMessage(err, "Login failed."));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle(idToken: string) {
    try {
      const { token, user } = await authService.google({ id_token: idToken });
      signIn(token, user);
      router.replace(callbackUrl);
    } catch (err) {
      toast.error(errorMessage(err, "Google sign-in failed."));
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-8">
        <div className="mb-8 text-center">
          <Badge variant="primary" className="mb-3">Sign in</Badge>
          <h1 className="text-h3 font-heading text-[var(--color-text-primary)]">Welcome back</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)] font-body">
            Sign in to access your license and dashboard.
          </p>
        </div>

        {GOOGLE_ENABLED && (
          <>
            <GoogleButton text="continue_with" onCredential={handleGoogle} onError={(m) => toast.error(m)} />
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[var(--color-border)]" />
              <span className="text-xs text-[var(--color-text-muted)] font-body">or</span>
              <div className="flex-1 h-px bg-[var(--color-border)]" />
            </div>
          </>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            error={errors.email}
            required
          />
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            error={errors.password}
            required
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          <div className="flex justify-end">
            <Link href="/forgot-password/" className="text-xs text-[var(--color-primary-600)] hover:underline font-body">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading} rightIcon={<ArrowRight className="h-4 w-4" />}>
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--color-text-muted)] font-body">
          Don&apos;t have an account?{" "}
          <Link href="/register/" className="text-[var(--color-primary-600)] hover:underline">
            Create one free
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-96 card animate-shimmer rounded-[var(--radius-lg)]" />}>
      <LoginForm />
    </Suspense>
  );
}
