"use client";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-body font-semibold transition-all duration-150 cursor-pointer disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary: [
          "bg-[var(--color-primary-500)] text-[var(--color-text-inverse)]",
          "hover:bg-[var(--color-primary-600)]",
          "shadow-[var(--shadow-glow-primary)] active:scale-[0.98]",
        ],
        cta: [
          "bg-[var(--color-cta-500)] text-[var(--color-text-inverse)]",
          "hover:bg-[var(--color-cta-600)]",
          "shadow-[var(--shadow-glow-cta)] active:scale-[0.98]",
        ],
        secondary: [
          "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]",
          "border border-[var(--color-border)]",
          "hover:border-[var(--color-primary-600)] hover:text-[var(--color-primary-700)]",
          "shadow-[var(--shadow-xs)] active:scale-[0.98]",
        ],
        ghost: [
          "bg-transparent text-[var(--color-text-secondary)]",
          "hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]",
        ],
        danger: [
          "bg-[var(--color-error)] text-white",
          "hover:bg-[var(--color-error-dim)] active:scale-[0.98]",
        ],
        link: [
          "bg-transparent text-[var(--color-primary-700)] underline-offset-4",
          "hover:underline hover:text-[var(--color-primary-600)]",
          "p-0 h-auto",
        ],
      },
      size: {
        sm:   "h-8  px-3 text-xs  rounded-[var(--radius-sm)]",
        md:   "h-10 px-5 text-sm  rounded-[var(--radius-md)]",
        lg:   "h-12 px-7 text-base rounded-[var(--radius-md)]",
        xl:   "h-14 px-9 text-lg  rounded-[var(--radius-lg)]",
        icon: "h-10 w-10         rounded-[var(--radius-md)]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, asChild, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className);
    const content = (
      <>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </>
    );

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
      return React.cloneElement(child, {
        ...props,
        className: cn(classes, child.props.className),
        children: (
          <>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
            {child.props.children}
            {!loading && rightIcon}
          </>
        ),
      });
    }

    return (
      <button ref={ref} className={classes} disabled={disabled || loading} {...props}>
        {content}
      </button>
    );
  }
);
Button.displayName = "Button";
