import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      aria-hidden
      className={cn("h-5 w-5 animate-spin text-[var(--color-text-muted)]", className)}
    />
  );
}

export function PageSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-3 py-24">
      <Spinner className="h-6 w-6" />
      <span className="text-sm text-[var(--color-text-muted)] font-body">{label}</span>
    </div>
  );
}
