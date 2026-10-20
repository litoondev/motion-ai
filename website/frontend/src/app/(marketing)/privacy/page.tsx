import type { Metadata } from "next";
import { ContentPage, ContentSection } from "@/components/layout/content-page";
import { SUPPORT_EMAIL } from "@/lib/config";

export const metadata: Metadata = { title: "Privacy Policy – Motion AI" };

export default function PrivacyPage() {
  return (
    <ContentPage title="Privacy Policy" intro="What we collect, why we collect it, and how to reach us about it.">
      <ContentSection title="Information we collect">
        <p>Account details: your name, email address and password (stored hashed), or your Google profile name, email and picture if you sign in with Google.</p>
        <p>License and device details: license keys, and for each linked machine its name, operating system, After Effects version and last-seen time.</p>
        <p>Payment details: the amount, method and status of each payment, bank transfer references and any receipt you upload. Card details are entered on Stripe and are never stored by us.</p>
      </ContentSection>
      <ContentSection title="How we use it">
        <p>To run your account, issue and verify licenses, limit the number of linked devices, process payments, and contact you about your account.</p>
      </ContentSection>
      <ContentSection title="Sharing">
        <p>Payments by card are processed by Stripe. Google sign-in is provided by Google. We do not sell your information.</p>
      </ContentSection>
      <ContentSection title="Your choices">
        <p>You can update your name, email and password from Settings. To ask for your data to be exported or deleted, email <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[var(--color-primary-600)] hover:underline">{SUPPORT_EMAIL}</a>.</p>
      </ContentSection>
    </ContentPage>
  );
}
