import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 font-body font-semibold text-xs px-2 py-0.5 rounded-full",
  {
    variants: {
      variant: {
        primary: "bg-[color-mix(in_srgb,var(--color-primary-500)_15%,transparent)] text-[var(--color-primary-700)] border border-[color-mix(in_srgb,var(--color-primary-500)_30%,transparent)]",
        success: "bg-[color-mix(in_srgb,var(--color-success)_15%,transparent)] text-[var(--color-success)] border border-[color-mix(in_srgb,var(--color-success)_30%,transparent)]",
        warning: "bg-[color-mix(in_srgb,var(--color-warning)_15%,transparent)] text-[var(--color-warning)] border border-[color-mix(in_srgb,var(--color-warning)_30%,transparent)]",
        error:   "bg-[color-mix(in_srgb,var(--color-error)_15%,transparent)] text-[var(--color-error)] border border-[color-mix(in_srgb,var(--color-error)_30%,transparent)]",
        info:    "bg-[color-mix(in_srgb,var(--color-info)_15%,transparent)] text-[var(--color-info)] border border-[color-mix(in_srgb,var(--color-info)_30%,transparent)]",
        muted:   "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border)]",
      },
    },
    defaultVariants: { variant: "muted" },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
