"use client";
import { cn } from "@/lib/utils";
import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  helperText?: string;   // alias for hint
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    hint = hint ?? helperText;
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-[var(--color-text-primary)] font-body"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-[var(--color-text-muted)] pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]",
              "border border-[var(--color-border)] rounded-[var(--radius-md)]",
              "h-10 px-3 text-sm font-body",
              "placeholder:text-[var(--color-text-muted)]",
              "transition-colors duration-150",
              "focus:outline-none focus:border-[var(--color-primary-600)] focus:ring-2 focus:ring-[var(--color-primary-600)]/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]",
              leftIcon  && "pl-9",
              rightIcon && "pr-9",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-3 text-[var(--color-text-muted)]">
              {rightIcon}
            </span>
          )}
        </div>

        {error && <p className="text-xs text-[var(--color-error)] font-body">{error}</p>}
        {hint  && !error && <p className="text-xs text-[var(--color-text-muted)] font-body">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
