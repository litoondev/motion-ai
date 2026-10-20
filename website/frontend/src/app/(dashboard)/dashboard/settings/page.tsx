"use client";
import { useState } from "react";
import Link from "next/link";
import { Calendar, ChevronRight, Eye, EyeOff, Key, LogOut, Monitor, Shield, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageSpinner } from "@/components/ui/spinner";
import { errorMessage, fieldErrors } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useFetch } from "@/lib/use-fetch";
import { formatDate } from "@/lib/utils";
import { userService } from "@/services/user";
import type { User } from "@/lib/types";

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10 py-8 border-b border-[var(--color-border-soft)] last:border-0">
      <div>
        <h2 className="text-h6 font-heading text-[var(--color-text-primary)]">{title}</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)] font-body leading-relaxed">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function ProfileForm({ user, onSaved }: { user: User; onSaved: () => void }) {
  const { setUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const changed = name.trim() !== user.name || email.trim() !== user.email;

  function reset() {
    setName(user.name);
    setEmail(user.email);
    setErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!changed) return;
    setLoading(true);
    setErrors({});
    try {
      const updated = await userService.updateProfile({ name: name.trim(), email: email.trim() });
      setUser(updated);
      onSaved();
      toast.success("Profile updated.");
    } catch (err) {
      const fields = fieldErrors(err);
      setErrors(fields);
      if (Object.keys(fields).length === 0) toast.error(errorMessage(err, "Could not update your profile."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 flex flex-col gap-4">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} autoComplete="name" required />
          <Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email}
            hint="Used to sign in and for license and payment emails." autoComplete="email" required />
        </CardContent>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)]/50 rounded-b-[var(--radius-lg)]">
          {changed ? (
            <Button type="button" variant="ghost" size="md" onClick={reset} disabled={loading}>Cancel</Button>
          ) : (
            <span className="mr-auto text-xs text-[var(--color-text-muted)] font-body">Edit a field to save changes.</span>
          )}
          <Button type="submit" variant="primary" size="md" loading={loading} disabled={!changed}>Save changes</Button>
        </div>
      </form>
    </Card>
  );
}

function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const tooShort = next.length > 0 && next.length < 8;
  const mismatch = confirm.length > 0 && next !== confirm;
  const ready = current && next.length >= 8 && next === confirm;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setLoading(true);
    setErrors({});
    try {
      await userService.updateProfile({ current_password: current, new_password: next, new_password_confirmation: confirm });
      toast.success("Password changed.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      const fields = fieldErrors(err);
      setErrors(fields);
      if (Object.keys(fields).length === 0) toast.error(errorMessage(err, "Could not change your password."));
    } finally {
      setLoading(false);
    }
  }

  const toggle = (
    <button type="button" onClick={() => setShow((s) => !s)} className="cursor-pointer hover:text-[var(--color-text-primary)]"
      aria-label={show ? "Hide passwords" : "Show passwords"} aria-pressed={show}>
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
  const type = show ? "text" : "password";

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 flex flex-col gap-4">
          <Input label="Current password" type={type} value={current} onChange={(e) => setCurrent(e.target.value)}
            error={errors.current_password} autoComplete="current-password" rightIcon={toggle} required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="New password" type={type} value={next} onChange={(e) => setNext(e.target.value)}
              error={errors.new_password || (tooShort ? "At least 8 characters." : undefined)}
              hint="At least 8 characters." autoComplete="new-password" required />
            <Input label="Confirm new password" type={type} value={confirm} onChange={(e) => setConfirm(e.target.value)}
              error={errors.new_password_confirmation || (mismatch ? "Passwords do not match." : undefined)}
              autoComplete="new-password" required />
          </div>
        </CardContent>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)]/50 rounded-b-[var(--radius-lg)]">
          {!ready && <span className="mr-auto text-xs text-[var(--color-text-muted)] font-body">Fill in all three fields to update.</span>}
          <Button type="submit" variant="primary" size="md" loading={loading} disabled={!ready}>Update password</Button>
        </div>
      </form>
    </Card>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { data, loading, error, reload } = useFetch(() => userService.dashboard(), [], { cacheKey: "dashboard" });

  if (loading) return <PageSpinner label="Loading your account…" />;
  if (error || !data) {
    return (
      <Card className="p-6 flex flex-col items-start gap-3">
        <p className="text-sm text-[var(--color-text-secondary)] font-body">{error ?? "Could not load your account."}</p>
        <Button variant="secondary" size="sm" onClick={reload}>Try again</Button>
      </Card>
    );
  }

  const { user, licenses } = data;
  const deviceCount = licenses.reduce((sum, l) => sum + (l.active_devices ?? 0), 0);
  const deviceLimit = licenses.reduce((sum, l) => sum + (l.max_devices ?? 0), 0);

  return (
    <div className="flex flex-col">
      <div className="pb-6 border-b border-[var(--color-border-soft)]">
        <h1 className="text-xl font-bold font-heading text-[var(--color-text-primary)] leading-tight">Settings</h1>
        <p className="text-sm text-[var(--color-text-muted)] font-body mt-1">Manage your profile, password and session.</p>
      </div>

      {/* Overview */}
      <Card className="mt-8">
        <CardContent className="pt-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 min-w-0">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt="" referrerPolicy="no-referrer" className="w-14 h-14 rounded-full object-cover border border-[var(--color-border)]" />
            ) : (
              <div className="w-14 h-14 shrink-0 rounded-full bg-[var(--color-primary-500)]/10 flex items-center justify-center border border-[var(--color-border)]">
                <UserIcon className="h-7 w-7 text-[var(--color-primary-600)]" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-h5 font-heading text-[var(--color-text-primary)] truncate">{user.name || "Unnamed account"}</p>
                {user.role === "admin" && (
                  <Badge variant="error"><span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Admin</span></Badge>
                )}
                <Badge variant={user.email_verified_at ? "success" : "warning"} dot>
                  {user.email_verified_at ? "Verified" : "Email not verified"}
                </Badge>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] font-body truncate">{user.email}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] font-body">
                <Calendar className="h-3.5 w-3.5" /> Member since {formatDate(user.created_at)}
                <span aria-hidden>·</span> Account ID {user.id}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:w-[400px] shrink-0">
            <Link href="/dashboard/" className="group flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--color-border)] hover:border-[var(--color-primary-500)] transition-colors">
              <Key className="h-4 w-4 text-[var(--color-primary-600)] shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-heading text-[var(--color-text-primary)] leading-tight">{licenses.length}</span>
                <span className="block text-xs text-[var(--color-text-muted)] font-body">License{licenses.length !== 1 ? "s" : ""}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)] group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/dashboard/" className="group flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--color-border)] hover:border-[var(--color-primary-500)] transition-colors">
              <Monitor className="h-4 w-4 text-[var(--color-primary-600)] shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-heading text-[var(--color-text-primary)] leading-tight">
                  {deviceCount}{deviceLimit > 0 && <span className="text-sm text-[var(--color-text-muted)]"> / {deviceLimit}</span>}
                </span>
                <span className="block text-xs text-[var(--color-text-muted)] font-body whitespace-nowrap">Devices linked</span>
              </span>
              <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </CardContent>
      </Card>

      <Section title="Profile" description="Your name and the email address you sign in with.">
        <ProfileForm key={`${user.name}|${user.email}`} user={user} onSaved={reload} />
      </Section>

      <Section title="Password" description="Use at least 8 characters. You'll stay signed in on this device.">
        <PasswordForm />
      </Section>

      <Section title="Session" description="Sign out of Motion AI on this browser.">
        <Card>
          <CardContent className="pt-6 pb-6 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-[var(--color-text-secondary)] font-body">
              Signed in as <span className="font-semibold text-[var(--color-text-primary)]">{user.email}</span>
            </p>
            <Button
              variant="secondary"
              size="md"
              className="text-[var(--color-error)] border-[var(--color-error)]/30 hover:bg-[var(--color-error-bg)]"
              leftIcon={<LogOut className="h-4 w-4" />}
              onClick={async () => {
                await signOut();
                router.replace("/login/");
              }}
            >
              Sign out
            </Button>
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}
