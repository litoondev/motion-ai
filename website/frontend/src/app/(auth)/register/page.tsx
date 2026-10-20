"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { AuthCard, AuthCardSkeleton, AuthField } from "@/components/auth/auth-ui";
import { SpSubmitButton } from "@/components/marketing/sp-button";
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
    <AuthCard
      caption={`${pricing.trial_days}-day free trial`}
      title="Create your account"
      subtitle={`No credit card required. Full feature access for ${pricing.trial_days} days.`}
    >
      {GOOGLE_ENABLED && (
        <>
          <GoogleButton text="signup_with" onCredential={handleGoogle} onError={(m) => toast.error(m)} />
          <div className="sp-or my-6">or</div>
        </>
      )}

      <form onSubmit={handleRegister} className="flex flex-col gap-5">
        <AuthField label="Full name" type="text" placeholder="John Doe" value={name}
          onChange={(e) => setName(e.target.value)} autoComplete="name" error={errors.name} required />
        <AuthField label="Email address" type="email" placeholder="you@example.com" value={email}
          onChange={(e) => setEmail(e.target.value)} autoComplete="email"
          hint="No disposable or temporary emails." error={errors.email} required />
        <AuthField
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          error={errors.password}
          required
          action={
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="sp-field-icon"
              aria-label={showPassword ? "Hide passwords" : "Show passwords"} aria-pressed={showPassword}>
              {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          }
        />
        <AuthField
          label="Confirm password"
          type={showPassword ? "text" : "password"}
          placeholder="Repeat your password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          autoComplete="new-password"
          error={errors.password_confirmation}
          required
        />
        <SpSubmitButton loading={loading} loadingText="Creating account…">
          Start free trial <ArrowRight className="h-4 w-4" aria-hidden />
        </SpSubmitButton>
      </form>

      <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2.5">
        {[`${pricing.trial_days}-day free trial`, "No credit card", "Up to 2 devices", "Keep your version for life"].map((item) => (
          <li key={item} className="flex items-center gap-2 text-[14px] text-[#818089]">
            <Check className="h-4 w-4 shrink-0 text-[#a78bfa]" aria-hidden />
            {item}
          </li>
        ))}
      </ul>

      <p className="mt-8 text-center text-[14px] text-[#818089]">
        Already have an account?{" "}
        <Link href="/login/" className="sp-link font-medium">Sign in</Link>
      </p>
    </AuthCard>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <RegisterForm />
    </Suspense>
  );
}
