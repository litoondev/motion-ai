import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage, ContentSection } from "@/components/layout/content-page";
import { SUPPORT_EMAIL } from "@/lib/config";

export const metadata: Metadata = { title: "Docs – Motion AI" };

export default function DocsPage() {
  return (
    <ContentPage title="Documentation" intro="Everything you need to get Motion AI running and keep your license in order.">
      <ContentSection id="getting-started" title="Getting started">
        <ol className="list-decimal pl-5 flex flex-col gap-1.5">
          <li><Link href="/register/" className="text-[var(--color-primary-600)] hover:underline">Create an account</Link> or sign in.</li>
          <li>Start the free trial from your dashboard, or buy a license on the Billing page.</li>
          <li>Download the plugin from your dashboard and follow the install notes included in the download.</li>
          <li>Open Motion AI inside After Effects and enter your license key. The machine is linked to your license automatically.</li>
        </ol>
      </ContentSection>

      <ContentSection id="license" title="Your license key">
        <p>Your key is shown on the dashboard as soon as a trial is started or a payment is approved. Use the copy button to avoid typing mistakes.</p>
        <p>If a license is suspended, revoked or expired, the key is hidden and the plugin will report why it cannot be used.</p>
      </ContentSection>

      <ContentSection id="devices" title="Devices">
        <p>Each seat can be used on up to 2 devices at the same time. A license with 3 seats therefore allows 6 devices.</p>
        <p>To move to a new machine, open the dashboard, unlink an old device, then enter your key on the new one. An unlinked device cannot use the plugin until it is linked again.</p>
      </ContentSection>

      <ContentSection id="updates" title="Updates and expiry">
        <p>A paid license includes updates for the period you purchased. When it ends you can keep using the version you have, for as long as you like. Renew to receive newer versions.</p>
        <p>Trial licenses stop working when the trial ends.</p>
      </ContentSection>

      <ContentSection id="payments" title="Payments">
        <p><strong>Card:</strong> you are sent to a secure Stripe checkout page. Your license is created automatically once the payment succeeds.</p>
        <p><strong>Bank transfer:</strong> make the transfer, then submit the transaction reference (and a receipt if you have one) on the Billing page. We review it and activate your license, usually within 24 hours. The status of each payment is shown in your payment history.</p>
      </ContentSection>

      <ContentSection id="support" title="Need help?">
        <p>Email <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[var(--color-primary-600)] hover:underline">{SUPPORT_EMAIL}</a> and include the email address of your account.</p>
      </ContentSection>
    </ContentPage>
  );
}
