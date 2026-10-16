"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { isDisposableEmail } from "@/lib/disposable-emails";
import { registerAction, googleAuthAction } from "@/app/actions/auth";

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

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password || !passwordConfirm) return;

    if (isDisposableEmail(email)) {
      toast.error("Temporary/disposable email addresses are not allowed.");
      return;
    }

    if (password !== passwordConfirm) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const result = await registerAction({
      name,
      email,
      password,
      password_confirmation: passwordConfirm,
    });
    setLoading(false);

    if (result.success) {
      toast.success("Account created successfully!");
      router.push("/dashboard");
      router.refresh();
    } else {
      toast.error(result.error ?? "Registration failed.");
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    try {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = () => {
        window.google?.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
          callback: async (response: { credential: string }) => {
            const result = await googleAuthAction({ id_token: response.credential });
            if (result.success) {
              router.push("/dashboard");
              router.refresh();
            } else {
              toast.error(result.error ?? "Google sign-in failed.");
            }
            setLoading(false);
          },
        });
        window.google?.accounts.id.prompt();
      };
      document.body.appendChild(script);
    } catch {
      toast.error("Google sign-in failed.");
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-8">
        <div className="mb-8 text-center">
          <Badge variant="success" className="mb-3">7-day free trial</Badge>
          <h1 className="text-h3 font-heading text-[var(--color-text-primary)]">Create your account</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)] font-body">
            No credit card required. Full feature access for 7 days.
          </p>
        </div>

        <Button
          variant="secondary"
          size="lg"
          className="w-full mb-4"
          leftIcon={<GoogleIcon />}
          loading={loading}
          onClick={handleGoogleSignIn}
        >
          Sign up with Google
        </Button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[var(--color-border)]" />
          <span className="text-xs text-[var(--color-text-muted)] font-body">or</span>
          <div className="flex-1 h-px bg-[var(--color-border)]" />
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <Input label="Full name" type="text" placeholder="John Doe"
            value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            hint="No disposable or temporary emails."
            required
          />
          <Input
            label="Password"
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
            label="Confirm password"
            type={showPassword ? "text" : "password"}
            placeholder="Repeat your password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
          <Button
            type="submit"
            variant="cta"
            size="lg"
            className="w-full"
            loading={loading}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Start free trial
          </Button>
        </form>

        <ul className="mt-6 grid grid-cols-2 gap-2">
          {["7-day free trial", "No credit card", "Up to 2 devices", "Cancel anytime"].map((item) => (
            <li key={item} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] font-body">
              <span className="w-1 h-1 rounded-full bg-[var(--color-primary-400)]" />
              {item}
            </li>
          ))}
        </ul>

        <p className="mt-6 text-center text-xs text-[var(--color-text-muted)] font-body">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--color-primary-600)] hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
