import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-base)]">
      {/* Minimal header */}
      <header className="flex h-14 items-center px-6 border-b border-[var(--color-border)]">
        <Link href="/" className="text-h5 gradient-text font-heading">
          Motion AI
        </Link>
      </header>

      {/* Auth card centred */}
      <main className="flex flex-1 items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
