"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { login, getMe } from "@/services/auth";
import { setAuthCookie } from "@/app/actions/auth";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    try {
      const { token } = await login({ email, password });

      // Verify admin role
      const user = await getMe(token);
      if (user.role !== "admin") {
        toast.error("Access denied. Admin role required.");
        setLoading(false);
        return;
      }

      await setAuthCookie(token);
      toast.success("Welcome back!");
      router.push("/");
    } catch (err) {
      toast.error((err as Error).message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    // Google OAuth would be implemented here
    toast.error("Google login is not configured yet");
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-h4 font-heading text-[var(--color-text-primary)] mb-2">
          Admin Login
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] font-body">
          Motion AI Plugin Administration
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={loading}
            >
              Sign in
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-[var(--color-border)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-[var(--color-bg-surface)] text-xs text-[var(--color-text-muted)] font-body">
                or
              </span>
            </div>
          </div>

          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
