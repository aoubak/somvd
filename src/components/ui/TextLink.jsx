import { Link } from 'react-router-dom';

const CLASSES = 'text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-lime';

export default function TextLink({ to, href, children, ...props }) {
  if (to) return <Link to={to} className={CLASSES} {...props}>{children}</Link>;
  return <a href={href} className={CLASSES} {...props}>{children}</a>;
}
