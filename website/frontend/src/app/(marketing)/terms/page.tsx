import type { Metadata } from "next";
import { ContentPage, ContentSection } from "@/components/layout/content-page";
import { SUPPORT_EMAIL } from "@/lib/config";

export const metadata: Metadata = { title: "Terms of Service – Motion AI" };

export default function TermsPage() {
  return (
    <ContentPage title="Terms of Service" intro="The basic rules for using Motion AI and your license.">
      <ContentSection title="License">
        <p>A license lets the purchaser use the plugin on up to 2 devices per seat. Licenses are personal to the account that holds them and may not be shared or resold.</p>
      </ContentSection>
      <ContentSection title="Updates">
        <p>A paid license includes updates for the purchased period. After that, the version you already have continues to work. Newer versions require a renewal.</p>
      </ContentSection>
      <ContentSection title="Trials">
        <p>Each account can activate one free trial. A trial license stops working when the trial period ends.</p>
      </ContentSection>
      <ContentSection title="Account misuse">
        <p>We may suspend or revoke a license, or block an account, if the license is shared beyond its seat limit, obtained by fraudulent payment, or used to abuse the service.</p>
      </ContentSection>
      <ContentSection title="Contact">
        <p>Questions about these terms: <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[var(--color-primary-600)] hover:underline">{SUPPORT_EMAIL}</a>.</p>
      </ContentSection>
    </ContentPage>
  );
}
