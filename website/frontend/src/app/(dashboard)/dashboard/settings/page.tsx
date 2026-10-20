"use client";
import { useState } from "react";
import { Calendar, LogOut, Mail, Shield, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageSpinner } from "@/components/ui/spinner";
import { errorMessage, fieldErrors } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useFetch } from "@/lib/use-fetch";
import { formatDate } from "@/lib/utils";
import { userService } from "@/services/user";
import type { User } from "@/lib/types";

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[var(--color-border)] last:border-0">
      <span className="text-[var(--color-text-muted)]">{icon}</span>
      <span className="text-sm text-[var(--color-text-muted)] font-body w-28 shrink-0">{label}</span>
      <span className="text-sm text-[var(--color-text-primary)] font-body break-all">{value}</span>
    </div>
  );
}

function ProfileForm({ user, onSaved }: { user: User; onSaved: () => void }) {
  const { setUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const changed = name.trim() !== user.name || email.trim() !== user.email;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      <CardHeader><h2 className="text-h6 font-heading text-[var(--color-text-primary)]">Profile</h2></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} autoComplete="name" required />
          <Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoComplete="email" required />
          <Button type="submit" variant="primary" size="md" className="self-start" loading={loading} disabled={!changed}>
            Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const local: Record<string, string> = {};
    if (next.length < 8) local.new_password = "Password must be at least 8 characters.";
    if (next !== confirm) local.new_password_confirmation = "Passwords do not match.";
    setErrors(local);
    if (Object.keys(local).length > 0) return;

    setLoading(true);
    try {
      await userService.updateProfile({
        current_password: current,
        new_password: next,
        new_password_confirmation: confirm,
      });
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

  return (
    <Card>
      <CardHeader><h2 className="text-h6 font-heading text-[var(--color-text-primary)]">Change password</h2></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Current password" type="password" value={current} onChange={(e) => setCurrent(e.target.value)}
            error={errors.current_password} autoComplete="current-password" required />
          <Input label="New password" type="password" value={next} onChange={(e) => setNext(e.target.value)}
            error={errors.new_password} hint="At least 8 characters." autoComplete="new-password" required />
          <Input label="Confirm new password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
            error={errors.new_password_confirmation} autoComplete="new-password" required />
          <Button type="submit" variant="primary" size="md" className="self-start" loading={loading}
            disabled={!current || !next || !confirm}>
            Update password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { data, loading, error, reload } = useFetch(() => userService.dashboard());

  if (loading) return <PageSpinner />;
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

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-h3 font-heading text-[var(--color-text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--color-text-secondary)] font-body mt-1">Manage your account and preferences.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt="" referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover border border-[var(--color-border)]" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[var(--color-primary-500)]/10 flex items-center justify-center border border-[var(--color-border)]">
                <UserIcon className="h-8 w-8 text-[var(--color-primary-600)]" />
              </div>
            )}
            <div>
              <p className="text-h5 font-heading text-[var(--color-text-primary)]">{user.name || "—"}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={user.role === "admin" ? "error" : "primary"}>
                  {user.role === "admin" ? (<span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Admin</span>) : "User"}
                </Badge>
                <Badge variant={user.email_verified_at ? "success" : "warning"} dot>
                  {user.email_verified_at ? "Email verified" : "Email not verified"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <Row icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} />
            <Row icon={<Calendar className="h-4 w-4" />} label="Member since" value={formatDate(user.created_at)} />
            <Row icon={<Shield className="h-4 w-4" />} label="Account ID"
              value={<code className="text-xs font-mono text-[var(--color-text-muted)]">{user.id}</code>} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="pt-5 pb-5">
          <p className="text-2xl font-heading text-[var(--color-text-primary)]">{licenses.length}</p>
          <p className="text-sm text-[var(--color-text-muted)] font-body mt-1">License{licenses.length !== 1 ? "s" : ""}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5 pb-5">
          <p className="text-2xl font-heading text-[var(--color-text-primary)]">{deviceCount}</p>
          <p className="text-sm text-[var(--color-text-muted)] font-body mt-1">Device{deviceCount !== 1 ? "s" : ""} linked</p>
        </CardContent></Card>
      </div>

      <ProfileForm key={`${user.name}|${user.email}`} user={user} onSaved={reload} />
      <PasswordForm />

      <Card>
        <CardContent className="pt-6 pb-6">
          <p className="text-sm font-semibold text-[var(--color-text-primary)] font-body mb-1">Sign out</p>
          <p className="text-xs text-[var(--color-text-muted)] font-body mb-4">You will be redirected to the login page.</p>
          <Button
            variant="secondary"
            size="md"
            className="text-[var(--color-error)] border-[var(--color-error)]/30"
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
    </div>
  );
}
