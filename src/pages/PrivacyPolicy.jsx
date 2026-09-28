import LegalLayout, { LegalSection } from '../components/LegalLayout';
import TextLink from '../components/ui/TextLink';

const LIST = 'list-disc space-y-2 pl-5 marker:text-ink-4';

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="September 2026"
      intro="At SOMVD (Somali Video Downloader), your privacy is very important to us. This Privacy Policy explains how we handle your information when you use our website."
    >
      <LegalSection title="1. Information We Collect">
        <ul className={LIST}>
          <li>We do not collect personal information when you use SOMVD, and there are no accounts.</li>
          <li>We do not track your downloads or browsing history, and we do not use your IP address for advertising.</li>
          <li>Our server keeps standard technical logs (such as IP address and the requested link) only as long as needed to run the service and prevent abuse.</li>
          <li>If you email us, we use your name and email address only to reply.</li>
        </ul>
      </LegalSection>
      <LegalSection title="2. How We Use Information">
        <p>We use any information you provide only to:</p>
        <ul className={LIST}>
          <li>Provide a better user experience.</li>
          <li>Improve our services and fix errors.</li>
          <li>Respond to your support requests.</li>
        </ul>
      </LegalSection>
      <LegalSection title="3. Cookies and Tracking">
        <p>SOMVD does not use cookies, analytics or advertising trackers.</p>
      </LegalSection>
      <LegalSection title="4. Third-Party Content">
        <p>SOMVD allows you to download content from third-party platforms (like YouTube, TikTok, Facebook, etc.). Video thumbnails load directly from those platforms. We are not responsible for the content you download; please follow the Terms of Service of each platform.</p>
      </LegalSection>
      <LegalSection title="5. Data Storage">
        <p>We do not store downloaded videos. Files stream from the source platform through our server straight to your browser and are never written to our disk.</p>
      </LegalSection>
      <LegalSection title="6. Children’s Privacy">
        <p>SOMVD is not designed for children under 13. We do not knowingly collect information from children.</p>
      </LegalSection>
      <LegalSection title="7. Changes to This Policy">
        <p>We may update this Privacy Policy from time to time. Updates will always be posted on this page with a new “Last updated” date.</p>
      </LegalSection>
      <LegalSection title="8. Contact Us">
        <p>Email <TextLink href="mailto:support@somvdapp.com">support@somvdapp.com</TextLink> or visit <TextLink href="https://somvdapp.com" target="_blank" rel="noopener noreferrer">somvdapp.com</TextLink>.</p>
      </LegalSection>
    </LegalLayout>
  );
}
