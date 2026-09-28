// Keyboard hint styled like a physical key
export default function Kbd({ children, className = '' }) {
  return (
    <kbd className={`rounded-[5px] border border-b-2 border-line-strong px-1.5 py-px font-mono text-[11px] text-ink-3 ${className}`}>
      {children}
    </kbd>
  );
}
