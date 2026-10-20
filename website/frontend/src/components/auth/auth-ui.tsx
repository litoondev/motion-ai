"use client";
import { useId } from "react";

export function AuthCard({ caption, title, subtitle, children }: {
  caption: string;
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="sp-achieve w-full max-w-[560px]">
      <div className="sp-achieve__inner sm:!px-12 sm:!py-12">
        <div className="relative mb-8 text-center">
          <span className="sp-caption mb-4">{caption}</span>
          <h1 className="font-body text-[28px] sm:text-[32px] font-medium leading-[1.3] tracking-[-0.042em] text-[#f3f3f3]">{title}</h1>
          <p className="mt-2 font-body text-[16px] leading-[1.6] tracking-[-0.031em] text-[#818089]">{subtitle}</p>
        </div>
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}

interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  action?: React.ReactNode;
}

export function AuthField({ label, error, hint, action, className, ...props }: AuthFieldProps) {
  const id = useId();
  const msgId = `${id}-msg`;
  const message = error ?? hint;
  return (
    <div className="font-body">
      <label htmlFor={id} className="sp-field-label">{label}</label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? msgId : undefined}
          className={["sp-field", action && "sp-field--icon", className].filter(Boolean).join(" ")}
          {...props}
        />
        {action}
      </div>
      {message && (
        <p id={msgId} role={error ? "alert" : undefined} className={`mt-2 text-[13px] leading-[1.5] ${error ? "text-[#f87171]" : "text-[#818089]"}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export function AuthCardSkeleton() {
  return <div className="sp-achieve w-full max-w-[560px] h-[560px] animate-pulse" aria-hidden />;
}
