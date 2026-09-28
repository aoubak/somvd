import { Link } from 'react-router-dom';
import { LuLoaderCircle } from 'react-icons/lu';

const VARIANTS = {
  primary: 'bg-lime font-semibold text-lime-ink hover:brightness-110',
  secondary: 'border border-line-strong text-ink hover:bg-raised',
  ghost: 'text-ink-3 hover:bg-raised hover:text-ink'
};

const SIZES = {
  sm: 'h-8 gap-1.5 px-3 text-[13px]',
  md: 'h-10 gap-2 px-4 text-sm'
};

// Renders a router Link with `to`, an anchor with `href`, otherwise a button
export default function Button({ variant = 'primary', size = 'md', loading = false, to, href, className = '', disabled, children, ...props }) {
  const classes = [
    'inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-lg font-medium transition-[background-color,color,filter] duration-150',
    'disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className
  ].join(' ');

  const content = (
    <>
      {loading && <LuLoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </>
  );

  if (to) return <Link to={to} className={classes} {...props}>{content}</Link>;
  if (href) return <a href={href} className={classes} {...props}>{content}</a>;
  return (
    <button type="button" className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  );
}
