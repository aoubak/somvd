// value: 0..1 for a known size, null while the total size is unknown
export default function ProgressBar({ value, label }) {
  const determinate = typeof value === 'number';
  const percent = determinate ? Math.min(100, Math.round(value * 100)) : undefined;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={determinate ? 0 : undefined}
      aria-valuemax={determinate ? 100 : undefined}
      aria-valuenow={percent}
      className="h-1 w-full overflow-hidden rounded-full bg-line"
    >
      {determinate
        ? <div className="h-full rounded-full bg-lime transition-[width] duration-150 ease-out" style={{ width: `${percent}%` }} />
        : <div className="h-full w-1/3 animate-indeterminate rounded-full bg-lime" />}
    </div>
  );
}
