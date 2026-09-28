import Container from './ui/Container';
import SectionHeader from './ui/SectionHeader';

const STEPS = [
  { n: '01', title: 'Paste the link', body: 'Copy a video URL from YouTube, TikTok, Instagram, Facebook or X and paste it above.' },
  { n: '02', title: 'Pick a quality', body: 'Choose anything from 240p up to 4K, or keep just the audio track.' },
  { n: '03', title: 'Save it', body: 'The file streams straight to your device. We never keep a copy.' }
];

export default function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="border-t border-line py-20 sm:py-28">
      <Container>
        <SectionHeader id="how-title" eyebrow="How it works" title="Three steps." muted="No detours." />
        <ol className="mt-10 grid divide-y divide-line overflow-hidden rounded-2xl border border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {STEPS.map(step => (
            <li key={step.n} className="p-6">
              <span className="font-mono text-[11px] text-lime">{step.n}</span>
              <h3 className="mt-5 text-[15px] font-medium tracking-[-0.01em] text-ink">{step.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
