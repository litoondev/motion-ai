"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { AuthCard, AuthCardSkeleton, AuthField } from "@/components/auth/auth-ui";
import { SpSubmitButton } from "@/components/marketing/sp-button";
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
    <AuthCard caption="Sign in" title="Welcome back" subtitle="Sign in to access your license and dashboard.">
      {GOOGLE_ENABLED && (
        <>
          <GoogleButton text="continue_with" onCredential={handleGoogle} onError={(m) => toast.error(m)} />
          <div className="sp-or my-6">or</div>
        </>
      )}

      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        <AuthField
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          error={errors.email}
          required
        />
        <div>
          <AuthField
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            error={errors.password}
            required
            action={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="sp-field-icon"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            }
          />
          <div className="mt-3 flex justify-end">
            <Link href="/forgot-password/" className="sp-link text-[14px]">Forgot password?</Link>
          </div>
        </div>
        <SpSubmitButton loading={loading} loadingText="Signing in…">
          Sign in <ArrowRight className="h-4 w-4" aria-hidden />
        </SpSubmitButton>
      </form>

      <p className="mt-8 text-center text-[14px] text-[#818089]">
        Don&apos;t have an account?{" "}
        <Link href="/register/" className="sp-link font-medium">Create one free</Link>
      </p>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
