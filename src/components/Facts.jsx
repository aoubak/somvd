import Container from './ui/Container';

// Honest numbers that describe the product, not usage
const FACTS = [
  { value: '5', label: 'Platforms' },
  { value: '4K', label: 'Max quality' },
  { value: '0', label: 'Files stored' },
  { value: '0', label: 'Sign-ups needed' }
];

export default function Facts() {
  return (
    <section aria-label="SOMVD at a glance" className="border-y border-line">
      <Container>
        <dl className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
          {FACTS.map(fact => (
            <div key={fact.label} className="flex flex-col-reverse bg-canvas px-2 py-8 sm:px-6">
              <dt className="mt-1 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-4">{fact.label}</dt>
              <dd className="text-3xl font-semibold tracking-[-0.03em] text-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
