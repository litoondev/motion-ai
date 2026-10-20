import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center bg-[var(--color-bg-base)]">
      <p className="text-h1 font-heading gradient-text">404</p>
      <h1 className="text-h5 font-heading text-[var(--color-text-primary)]">Page not found</h1>
      <p className="text-sm text-[var(--color-text-secondary)] font-body max-w-sm">
        The page you are looking for does not exist or has moved.
      </p>
      <Button variant="primary" asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </main>
  );
}
