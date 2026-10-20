import { cn } from "@/lib/utils";

export type PaymentMethodId = "bank_transfer" | "bkash" | "payoneer" | "wise";

// Official marks from public/payments; the tile background keeps each logo legible on any panel colour.
const LOGOS: Record<PaymentMethodId, { src: string; bg: string; pad: string }> = {
  bank_transfer: { src: "/payments/bank.png", bg: "#EEF3FB", pad: "p-0.5" },
  bkash: { src: "/payments/bkash.svg", bg: "#FFFFFF", pad: "p-1" },
  payoneer: { src: "/payments/payoneer.png", bg: "#FFFFFF", pad: "p-0" },
  wise: { src: "/payments/wise.svg", bg: "transparent", pad: "p-0" },
};

export function PaymentMethodIcon({ method, className }: { method: PaymentMethodId; className?: string }) {
  const logo = LOGOS[method];
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-[var(--color-border-soft)]",
        logo.pad,
        className
      )}
      style={{ backgroundColor: logo.bg }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo.src} alt="" width={36} height={36} className="h-full w-full object-contain" draggable={false} />
    </span>
  );
}
