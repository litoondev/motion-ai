import type { ReactNode } from "react";

export function ContentPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20">
      <h1 className="text-h3 font-heading text-[var(--color-text-primary)] mb-3">{title}</h1>
      {intro && <p className="text-body-lg text-[var(--color-text-secondary)] font-body mb-10">{intro}</p>}
      <div className="flex flex-col gap-10">{children}</div>
    </div>
  );
}

export function ContentSection({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-h5 font-heading text-[var(--color-text-primary)] mb-3">{title}</h2>
      <div className="flex flex-col gap-3 text-sm text-[var(--color-text-secondary)] font-body leading-relaxed">
        {children}
      </div>
    </section>
  );
}
