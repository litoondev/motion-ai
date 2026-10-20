"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { safeCallbackUrl, stripTrailingSlash } from "@/lib/utils";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = stripTrailingSlash(usePathname());

  // Already signed in -> no reason to see login / register again.
  // (The reset-password page stays reachable: people open that link from their inbox.)
  useEffect(() => {
    if (loading || !user || pathname === "/reset-password") return;
    const callback = new URLSearchParams(window.location.search).get("callbackUrl");
    router.replace(safeCallbackUrl(callback));
  }, [loading, user, pathname, router]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-base)]">
      <header className="flex h-14 items-center px-6 border-b border-[var(--color-border)]">
        <Link href="/" className="text-h5 gradient-text font-heading">
          Motion AI
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">{children}</main>
    </div>
  );
}
