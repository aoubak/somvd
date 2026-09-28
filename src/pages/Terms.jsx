import LegalLayout, { LegalSection } from '../components/LegalLayout';
import TextLink from '../components/ui/TextLink';

const LIST = 'list-disc space-y-2 pl-5 marker:text-ink-4';

export default function Terms() {
  return (
    <LegalLayout
      title="Terms of Service"
      updated="September 2026"
      intro="Welcome to SOMVD (Somali Video Downloader). By accessing or using our website, you agree to these Terms of Service. Please read them carefully."
    >
      <LegalSection title="1. Acceptance of Terms">
        <p>By using SOMVD, you agree to follow these Terms. If you do not agree, please do not use our service.</p>
      </LegalSection>
      <LegalSection title="2. Service Description">
        <p>SOMVD provides a tool that allows users to download publicly available videos and audio from supported platforms. SOMVD is free to use and is provided on a non‑profit basis.</p>
      </LegalSection>
      <LegalSection title="3. User Responsibilities">
        <ul className={LIST}>
          <li>You agree to use SOMVD only for personal and non-commercial purposes.</li>
          <li>You are solely responsible for ensuring that downloading or using content complies with the laws of your country and the Terms of Service of the platform from which the content is downloaded.</li>
          <li>You must not use SOMVD to download or distribute copyrighted content illegally.</li>
        </ul>
      </LegalSection>
      <LegalSection title="4. Copyright Disclaimer">
        <p>SOMVD is not affiliated with YouTube, TikTok, Facebook, Instagram, Twitter (X), or any other platform. We respect the rights of content creators. Downloaded videos should only be used for personal, offline use unless you have permission from the copyright owner.</p>
      </LegalSection>
      <LegalSection title="5. Limitation of Liability">
        <p>SOMVD provides the service “as is” with no guarantees of accuracy, reliability, or availability. We are not responsible for any damages, losses, or legal issues that may result from using this service.</p>
      </LegalSection>
      <LegalSection title="6. Changes to the Service">
        <p>We may update or change SOMVD at any time, including adding or removing features, without prior notice.</p>
      </LegalSection>
      <LegalSection title="7. Termination">
        <p>We reserve the right to block or restrict access to SOMVD if a user is found to be violating these Terms or abusing the service.</p>
      </LegalSection>
      <LegalSection title="8. Changes to the Terms">
        <p>We may update these Terms of Service at any time. Updates will be posted on this page with a new “Last updated” date.</p>
      </LegalSection>
      <LegalSection title="9. Contact Us">
        <p>Email <TextLink href="mailto:support@somvdapp.com">support@somvdapp.com</TextLink> or visit <TextLink href="https://somvdapp.com" target="_blank" rel="noopener noreferrer">somvdapp.com</TextLink>.</p>
      </LegalSection>
    </LegalLayout>
  );
}
