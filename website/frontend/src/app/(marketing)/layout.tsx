import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-dark bg-[var(--color-bg-base)] text-[var(--color-text-primary)] min-h-screen">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
