import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LuMenu, LuX } from 'react-icons/lu';
import Container from './ui/Container';
import Logo from './ui/Logo';

const NAV = [
  { to: '/#how', label: 'How it works' },
  { to: '/#features', label: 'Features' },
  { to: '/#faq', label: 'FAQ' }
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const solid = scrolled || open;

  return (
    <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-200 ${solid ? 'border-line bg-canvas/80' : 'border-transparent bg-canvas/0'}`}>
      <Container className="flex h-14 items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-7 text-[13px] text-ink-3 md:flex">
          {NAV.map(item => (
            <Link key={item.to} to={item.to} className="transition-colors hover:text-ink">{item.label}</Link>
          ))}
        </nav>

        <span className="hidden rounded-full border border-line-strong px-2.5 py-1 font-mono text-[11px] text-ink-3 md:inline-flex">
          Free · No sign-up
        </span>

        <button
          type="button"
          className="-mr-2 grid size-10 place-items-center rounded-lg text-ink-2 hover:bg-raised hover:text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen(o => !o)}
        >
          {open ? <LuX className="size-5" aria-hidden="true" /> : <LuMenu className="size-5" aria-hidden="true" />}
        </button>
      </Container>

      {/* Floats over the page instead of pushing it down; tap outside or press Escape to close */}
      {open && (
        <>
          <div aria-hidden="true" className="absolute inset-x-0 top-full h-dvh bg-black/60 md:hidden" onClick={() => setOpen(false)} />
          <nav id="mobile-nav" aria-label="Main" className="absolute inset-x-0 top-full border-y border-line bg-canvas shadow-[0_24px_48px_rgb(0_0_0/0.5)] md:hidden">
            <Container className="flex flex-col py-2">
              {NAV.map(item => (
                <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="py-3 text-[15px] text-ink-2 hover:text-ink">
                  {item.label}
                </Link>
              ))}
            </Container>
          </nav>
        </>
      )}
    </header>
  );
}
