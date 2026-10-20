import type { Metadata } from "next";
import { ContentPage, ContentSection } from "@/components/layout/content-page";
import { SUPPORT_EMAIL } from "@/lib/config";

export const metadata: Metadata = { title: "Refund Policy – Motion AI" };

export default function RefundPage() {
  return (
    <ContentPage title="Refund Policy" intro="How refunds work for Motion AI licenses.">
      <ContentSection title="Try before you buy">
        <p>Every account can use a free trial with full features, so you can check that Motion AI works for you before paying.</p>
      </ContentSection>
      <ContentSection title="Requesting a refund">
        <p>Email <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[var(--color-primary-600)] hover:underline">{SUPPORT_EMAIL}</a> from the address on your account and tell us which payment you are asking about.</p>
      </ContentSection>
      <ContentSection title="What happens to the license">
        <p>When a payment is refunded, the license it created is revoked and can no longer be used.</p>
      </ContentSection>
    </ContentPage>
  );
}
