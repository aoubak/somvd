import Button from './ui/Button';
import Container from './ui/Container';

const GLOW = { backgroundImage: 'radial-gradient(70% 90% at 50% 100%, rgb(198 244 50 / 0.09), transparent 70%)' };

export default function ClosingCta() {
  const focusDownloader = () => {
    const input = document.getElementById('video-url');
    input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    input?.focus({ preventScroll: true });
  };

  return (
    <section aria-labelledby="cta-title" className="pb-20 sm:pb-28">
      <Container>
        <div className="rounded-[18px] border border-line bg-surface px-6 py-14 text-center sm:py-16" style={GLOW}>
          <h2 id="cta-title" className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            Paste a link. <span className="text-ink-4">That's it.</span>
          </h2>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button onClick={focusDownloader}>Start downloading</Button>
            <Button variant="secondary" to="/#faq">Read the FAQ</Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
