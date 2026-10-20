"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Check, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

type LicenseType = "PAID" | "TRIAL";

export default function GenerateLicensePage() {
  const router = useRouter();

  const [email,     setEmail]     = useState("");
  const [type,      setType]      = useState<LicenseType>("PAID");
  const [seats,     setSeats]     = useState(1);
  const [years,     setYears]     = useState<number | null>(1);
  const [loading,   setLoading]   = useState(false);
  const [generated, setGenerated] = useState<string | null>(null);
  const [copied,    setCopied]    = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/licenses/generate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, type, seatCount: seats, yearCount: years }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setGenerated(data.licenseKey);
      toast.success("License key generated!");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function copyKey() {
    if (!generated) return;
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild leftIcon={<ArrowLeft className="h-4 w-4" />}>
          <Link href="/admin/licenses">Back</Link>
        </Button>
        <h1 className="text-h3 font-heading text-[var(--color-text-primary)]">Generate License Key</h1>
      </div>

      {generated ? (
        /* ── Success state ── */
        <Card>
          <CardContent className="pt-8 flex flex-col items-center gap-6 text-center">
            <div className="w-14 h-14 rounded-full bg-[var(--color-cta-500)]/10 flex items-center justify-center">
              <Key className="h-7 w-7 text-[var(--color-cta-500)]" />
            </div>
            <div>
              <Badge variant="success" className="mb-3">License created</Badge>
              <p className="text-sm text-[var(--color-text-secondary)] font-body mb-4">
                Key generated for <strong className="text-[var(--color-text-primary)]">{email}</strong>
              </p>
              <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg px-4 py-3 font-mono text-sm text-[var(--color-primary-700)] tracking-wider break-all">
                {generated}
              </div>
            </div>
            <div className="flex gap-3 w-full">
              <Button variant="cta" size="sm" className="flex-1"
                leftIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                onClick={copyKey}>
                {copied ? "Copied!" : "Copy key"}
              </Button>
              <Button variant="secondary" size="sm" className="flex-1"
                onClick={() => { setGenerated(null); setEmail(""); }}>
                Generate another
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/admin/licenses")}>
              View all licenses
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* ── Form ── */
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label="User email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                helperText="Existing user will receive the key; new email creates a user account."
              />

              {/* License type */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[var(--color-text-primary)] font-body">License type</label>
                <div className="flex gap-3">
                  {(["PAID", "TRIAL"] as LicenseType[]).map((t) => (
                    <button key={t} type="button"
                      onClick={() => setType(t)}
                      className={[
                        "flex-1 py-2 rounded-lg border text-sm font-body font-semibold transition-colors",
                        type === t
                          ? "border-[var(--color-primary-500)] bg-[var(--color-primary-500)]/10 text-[var(--color-primary-600)]"
                          : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-hover)]",
                      ].join(" ")}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seat count */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[var(--color-text-primary)] font-body">
                  Seats <span className="text-[var(--color-text-muted)] font-normal">(max {seats * 2} devices)</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 5].map((n) => (
                    <button key={n} type="button"
                      onClick={() => setSeats(n)}
                      className={[
                        "w-12 h-10 rounded-lg border text-sm font-body font-semibold transition-colors",
                        seats === n
                          ? "border-[var(--color-primary-500)] bg-[var(--color-primary-500)]/10 text-[var(--color-primary-600)]"
                          : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-hover)]",
                      ].join(" ")}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[var(--color-text-primary)] font-body">Duration</label>
                <div className="flex gap-2 flex-wrap">
                  {([
                    { label: "1 year",    value: 1 },
                    { label: "2 years",   value: 2 },
                    { label: "3 years",   value: 3 },
                    { label: "Lifetime",  value: null },
                  ] as { label: string; value: number | null }[]).map((opt) => (
                    <button key={opt.label} type="button"
                      onClick={() => setYears(opt.value)}
                      className={[
                        "px-4 h-10 rounded-lg border text-sm font-body font-semibold transition-colors",
                        years === opt.value
                          ? "border-[var(--color-primary-500)] bg-[var(--color-primary-500)]/10 text-[var(--color-primary-600)]"
                          : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-hover)]",
                      ].join(" ")}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" variant="cta" size="lg" className="w-full mt-2"
                loading={loading} leftIcon={<Key className="h-4 w-4" />}>
                Generate license key
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
