import { useRef } from 'react';
import { LuMusic } from 'react-icons/lu';
import { qualityLabel } from '../../lib/format';

// Radio group of quality chips; arrow keys move the selection
export default function QualityPicker({ formats, value, onChange, disabled }) {
  const refs = useRef([]);
  const index = Math.max(0, formats.findIndex(f => f.id === value));

  const move = (delta) => {
    const next = (index + delta + formats.length) % formats.length;
    onChange(formats[next].id);
    refs.current[next]?.focus();
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      move(1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      move(-1);
    }
  };

  return (
    <div role="radiogroup" aria-label="Quality" className="mt-4 flex flex-wrap gap-1.5" onKeyDown={disabled ? undefined : onKeyDown}>
      {formats.map((format, i) => {
        const selected = format.id === value;
        const detail = format.type === 'audio'
          ? (format.ext || '').toUpperCase()
          : (format.size && format.size !== 'Unknown' ? format.size : null);

        return (
          <button
            key={format.id}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={i === index ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(format.id)}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[13px] transition-colors duration-150 disabled:opacity-50 ${selected ? 'border-lime bg-lime/[0.07] text-ink' : 'border-line-strong text-ink-2 hover:border-white/20 hover:text-ink'}`}
          >
            {format.type === 'audio' && <LuMusic className="size-3.5" aria-hidden="true" />}
            {qualityLabel(format)}
            {detail && <span className="font-mono text-[11px] text-ink-4">{detail}</span>}
          </button>
        );
      })}
    </div>
  );
}
