import Container from './ui/Container';

export default function LegalLayout({ title, updated, intro, children }) {
  return (
    <Container size="narrow" className="py-16 sm:py-24">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{title}</h1>
      <p className="mt-3 font-mono text-[12px] text-ink-4">Last updated {updated}</p>
      {intro && <p className="mt-8 text-[15px] leading-relaxed text-ink-2">{intro}</p>}
      <div className="mt-10 space-y-8">{children}</div>
    </Container>
  );
}

export function LegalSection({ title, children }) {
  return (
    <section className="border-t border-line pt-8">
      <h2 className="text-lg font-semibold tracking-[-0.02em] text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink-3">{children}</div>
    </section>
  );
}
