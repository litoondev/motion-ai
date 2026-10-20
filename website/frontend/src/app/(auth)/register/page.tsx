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
import { isDisposableEmail } from "@/lib/disposable-emails";
import { usePricing } from "@/lib/use-pricing";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { signIn } = useAuth();
  const { pricing } = usePricing();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // "Buy now" on the pricing section links here with ?plan=standard
  const afterSignUp = params.get("plan") === "standard" ? "/dashboard/billing/" : "/dashboard/";

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (isDisposableEmail(email)) next.email = "Temporary or disposable email addresses are not allowed.";
    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    if (password !== passwordConfirm) next.password_confirmation = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      const { token, user } = await authService.register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirm,
      });
      signIn(token, user);
      toast.success("Account created successfully!");
      router.replace(afterSignUp);
    } catch (err) {
      const fields = fieldErrors(err);
      setErrors(fields);
      if (Object.keys(fields).length === 0) toast.error(errorMessage(err, "Registration failed."));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle(idToken: string) {
    try {
      const { token, user } = await authService.google({ id_token: idToken });
      signIn(token, user);
      router.replace(afterSignUp);
    } catch (err) {
      toast.error(errorMessage(err, "Google sign-in failed."));
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-8">
        <div className="mb-8 text-center">
          <Badge variant="success" className="mb-3">{pricing.trial_days}-day free trial</Badge>
          <h1 className="text-h3 font-heading text-[var(--color-text-primary)]">Create your account</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)] font-body">
            No credit card required. Full feature access for {pricing.trial_days} days.
          </p>
        </div>

        {GOOGLE_ENABLED && (
          <>
            <GoogleButton text="signup_with" onCredential={handleGoogle} onError={(m) => toast.error(m)} />
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[var(--color-border)]" />
              <span className="text-xs text-[var(--color-text-muted)] font-body">or</span>
              <div className="flex-1 h-px bg-[var(--color-border)]" />
            </div>
          </>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <Input label="Full name" type="text" placeholder="John Doe" value={name}
            onChange={(e) => setName(e.target.value)} autoComplete="name" error={errors.name} required />
          <Input label="Email address" type="email" placeholder="you@example.com" value={email}
            onChange={(e) => setEmail(e.target.value)} autoComplete="email"
            hint="No disposable or temporary emails." error={errors.email} required />
          <Input
            label="Password"
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
            label="Confirm password"
            type={showPassword ? "text" : "password"}
            placeholder="Repeat your password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            autoComplete="new-password"
            error={errors.password_confirmation}
            required
          />
          <Button type="submit" variant="cta" size="lg" className="w-full" loading={loading}
            rightIcon={<ArrowRight className="h-4 w-4" />}>
            Start free trial
          </Button>
        </form>

        <ul className="mt-6 grid grid-cols-2 gap-2">
          {[`${pricing.trial_days}-day free trial`, "No credit card", "Up to 2 devices", "Keep your version for life"].map((item) => (
            <li key={item} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] font-body">
              <span className="w-1 h-1 rounded-full bg-[var(--color-primary-400)]" />
              {item}
            </li>
          ))}
        </ul>

        <p className="mt-6 text-center text-xs text-[var(--color-text-muted)] font-body">
          Already have an account?{" "}
          <Link href="/login/" className="text-[var(--color-primary-600)] hover:underline">Sign in</Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-96 card animate-shimmer rounded-[var(--radius-lg)]" />}>
      <RegisterForm />
    </Suspense>
  );
}
