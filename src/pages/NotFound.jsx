import Button from '../components/ui/Button';
import Container from '../components/ui/Container';

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
        Page not found. <span className="text-ink-4">It may have moved.</span>
      </h1>
      <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink-3">
        The page you are looking for doesn't exist. The downloader is on the home page.
      </p>
      <Button to="/" className="mt-8">Back to home</Button>
    </Container>
  );
}
