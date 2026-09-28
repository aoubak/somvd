import { Link } from 'react-router-dom';
import Container from './ui/Container';
import Logo from './ui/Logo';

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <Container className="flex flex-col gap-6 py-8 text-[13px] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link to="/terms" className="transition-colors hover:text-ink">Terms</Link>
          <Link to="/privacy" className="transition-colors hover:text-ink">Privacy</Link>
          <a href="mailto:support@somvdapp.com" className="transition-colors hover:text-ink">support@somvdapp.com</a>
        </nav>
        <p className="font-mono text-[11px] text-ink-4">© {new Date().getFullYear()} SOMVD</p>
      </Container>
    </footer>
  );
}
