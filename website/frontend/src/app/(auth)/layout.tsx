"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { safeCallbackUrl, stripTrailingSlash } from "@/lib/utils";
import { SpButton } from "@/components/marketing/sp-button";

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

  const onRegister = pathname === "/register";

  return (
    <div className="marketing-dark relative min-h-screen flex flex-col overflow-hidden bg-[#030014] font-body">
      <div className="sp-auth-glow" aria-hidden />

      <header className="relative z-10">
        <div className="mx-auto flex max-w-[1312px] items-center justify-between px-4 py-6">
          <Link href="/" className="flex items-center gap-2.5 h-[34px]">
            <span className="w-[34px] h-[34px] rounded-[8px] bg-gradient-to-br from-[#7350ff] to-[#863aff] flex items-center justify-center">
              <Zap className="h-[18px] w-[18px] text-white" aria-hidden />
            </span>
            <span className="text-[26px] leading-none font-medium tracking-[-0.04em] text-white">
              Motion<span className="font-normal text-white/90"> AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-[15px] text-[#818089]">
              {onRegister ? "Already have an account?" : "New to Motion AI?"}
            </span>
            <SpButton href={onRegister ? "/login/" : "/register/"} variant="secondary" size="sm">
              {onRegister ? "Sign in" : "Create account"}
            </SpButton>
          </div>
        </div>
        <div className="sp-header-divider" aria-hidden />
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12 sm:py-16">{children}</main>

      <footer className="relative z-10 py-6 text-center text-[14px] text-[#818089]">
        &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> Motion AI
        <span className="mx-2 text-white/20" aria-hidden>|</span>
        <Link href="/privacy/" className="sp-footer-link">Privacy</Link>
        <span className="mx-2 text-white/20" aria-hidden>|</span>
        <Link href="/terms/" className="sp-footer-link">Terms</Link>
      </footer>
    </div>
  );
}
