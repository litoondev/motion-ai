"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// Inner component needs Suspense because of useSearchParams
function LoginForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const verifyMode  = params.get("verify") === "1";
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";

  useEffect(() => {
    if (status === "authenticated" && session) router.replace("/dashboard");
  }, [status, session, router]);

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const res = await signIn("email", { email, redirect: false, callbackUrl });
    setLoading(false);
    if (res?.ok) {
      setEmailSent(true);
    } else {
      toast.error("Unable to send sign-in email. Check that your email is valid.");
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    await signIn("google", { callbackUrl });
  }

  if (verifyMode || emailSent) {
    return (
      <Card className="w-full max-w-md p-8 text-center">
        <Mail className="h-10 w-10 text-[var(--color-primary-600)] mx-auto mb-4" />
        <h1 className="text-h4 font-heading text-[var(--color-text-primary)] mb-2">Check your email</h1>
        <p className="text-sm text-[var(--color-text-secondary)] font-body">
          A sign-in link has been sent to <strong>{email || "your email"}</strong>. Click the link to continue.
        </p>
        <p className="mt-4 text-xs text-[var(--color-text-muted)] font-body">
          Didn&apos;t receive it? Check spam or{" "}
          <button onClick={() => setEmailSent(false)} className="text-[var(--color-primary-600)] hover:underline">
            try again
          </button>.
        </p>
      </Card>
    );
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

        <Button variant="secondary" size="lg" className="w-full mb-4" leftIcon={<GoogleIcon />}
          loading={loading} onClick={handleGoogleSignIn}>
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[var(--color-border)]" />
          <span className="text-xs text-[var(--color-text-muted)] font-body">or</span>
          <div className="flex-1 h-px bg-[var(--color-border)]" />
        </div>

        <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4">
          <Input label="Email address" type="email" placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          <Button type="submit" variant="primary" size="lg" className="w-full"
            loading={loading} rightIcon={<ArrowRight className="h-4 w-4" />}>
            Send sign-in link
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--color-text-muted)] font-body">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[var(--color-primary-600)] hover:underline">Create one free</Link>
        </p>
        <p className="mt-3 text-center text-xs text-[var(--color-text-muted)] font-body">
          Temporary or disposable email addresses are not accepted.
        </p>

        {/* DEV-ONLY bypass — disabled automatically in production by the API route */}
        {process.env.NODE_ENV !== "production" && (
          <div className="mt-6 border border-dashed border-yellow-500/40 rounded-lg p-4">
            <p className="text-xs text-yellow-400/80 font-mono text-center mb-3">⚠ DEV LOGIN — not visible in production</p>
            <a href="/api/dev/login" className="block w-full">
              <Button variant="secondary" size="sm" className="w-full border-yellow-500/40 text-yellow-300/80 hover:text-yellow-200">
                Login as Admin (litoondev1@gmail.com)
              </Button>
            </a>
            <a href="/api/dev/login?email=test@example.com" className="block w-full mt-2">
              <Button variant="secondary" size="sm" className="w-full border-yellow-500/40 text-yellow-300/80 hover:text-yellow-200">
                Login as Regular User (no license)
              </Button>
            </a>
            <a href="/api/dev/seed-user" className="block w-full mt-2">
              <Button variant="secondary" size="sm" className="w-full border-yellow-500/40 text-yellow-300/80 hover:text-yellow-200">
                Login as Test User (1-year paid license)
              </Button>
            </a>
            <a href="/api/dev/seed-trial" className="block w-full mt-2">
              <Button variant="secondary" size="sm" className="w-full border-yellow-500/40 text-yellow-300/80 hover:text-yellow-200">
                Login as Trial User (7-day trial)
              </Button>
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md h-96 card animate-shimmer rounded-[var(--radius-lg)]" />
    }>
      <LoginForm />
    </Suspense>
  );
}
