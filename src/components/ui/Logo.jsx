import { Link } from 'react-router-dom';

export function LogoMark({ className = 'size-5' }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-md bg-lime text-lime-ink ${className}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" className="size-[62%]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4v11M7 10.5l5 5 5-5M6 20h12" />
      </svg>
    </span>
  );
}

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.02em] text-ink" aria-label="SOMVD home">
      <LogoMark />
      somvd
    </Link>
  );
}
