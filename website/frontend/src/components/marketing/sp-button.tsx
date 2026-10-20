import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "md" | "sm";
  block?: boolean;
  className?: string;
  onClick?: () => void;
}

export function SpSubmitButton({ children, loading, loadingText }: { children: React.ReactNode; loading?: boolean; loadingText?: string }) {
  const label = loading ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {loadingText ?? "Please wait…"}
    </>
  ) : children;
  return (
    <button type="submit" disabled={loading} aria-busy={loading || undefined} className="sp-btn sp-btn--block">
      <span className="sp-btn__wrap">
        <span className="sp-btn__text">{label}</span>
        <span className="sp-btn__text" aria-hidden="true">{label}</span>
      </span>
    </button>
  );
}

export function SpButton({ href, children, variant = "primary", size = "md", block, className, onClick }: SpButtonProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn("sp-btn", variant === "secondary" && "sp-btn--secondary", size === "sm" && "sp-btn--sm", block && "sp-btn--block", className)}
    >
      <span className="sp-btn__wrap">
        <span className="sp-btn__text">{children}</span>
        <span className="sp-btn__text" aria-hidden="true">{children}</span>
      </span>
    </Link>
  );
}
