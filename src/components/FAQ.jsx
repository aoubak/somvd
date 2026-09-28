import { LuPlus } from 'react-icons/lu';
import Container from './ui/Container';
import SectionHeader from './ui/SectionHeader';
import TextLink from './ui/TextLink';

const FAQS = [
  { q: 'Is SOMVD free?', a: 'Yes. There are no fees, no ads and no premium tier.' },
  { q: 'Do I need an account?', a: 'No. Paste a link and download. There is nothing to sign up for.' },
  { q: 'Do you store my videos?', a: 'No. Files stream from the platform through our server straight to your device and are never written to our disk.' },
  { q: 'Which platforms work?', a: 'YouTube, TikTok, Instagram, Facebook and X (Twitter). Public videos only.' },
  { q: 'Why is a quality missing?', a: "We only list what the platform offers for that video. If it was uploaded in 720p, there's no 1080p to download." },
  { q: "Why don't I see an audio option?", a: 'Some videos come without a separate audio track. Download the video instead.' },
  { q: 'Can I download private videos?', a: "No. Private, age-restricted and login-only videos can't be fetched." },
  {
    q: 'Is it legal?',
    a: (
      <>
        Downloading is fine for your own videos, openly licensed content, or anything you have permission to save. Respect copyright and each platform's terms. See our <TextLink to="/terms">Terms of Service</TextLink>.
      </>
    )
  }
];

export default function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="py-20 sm:py-28">
      <Container className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
        <div>
          <SectionHeader id="faq-title" eyebrow="FAQ" title="Questions," muted="answered." />
          <p className="mt-4 text-[14px] text-ink-3">
            Still stuck? <TextLink href="mailto:support@somvdapp.com">support@somvdapp.com</TextLink>
          </p>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {FAQS.map(({ q, a }, i) => (
            <details key={q} className="group" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] text-ink [&::-webkit-details-marker]:hidden">
                {q}
                <LuPlus className="size-4 shrink-0 text-ink-4 transition-transform duration-200 group-open:rotate-45" aria-hidden="true" />
              </summary>
              <p className="pb-5 pr-8 text-[14px] leading-relaxed text-ink-3">{a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
