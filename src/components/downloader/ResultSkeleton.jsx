import { useEffect, useState } from 'react';
import Button from '../ui/Button';

const SLOW_AFTER_MS = 6000;

export default function ResultSkeleton({ onCancel }) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mt-3 rounded-2xl border border-line bg-surface p-4">
      <div className="grid gap-4 sm:grid-cols-[168px_1fr]" aria-hidden="true">
        <div className="aspect-video animate-pulse rounded-lg bg-raised" />
        <div className="space-y-3 py-1">
          <div className="h-4 w-3/4 animate-pulse rounded bg-raised" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-raised" />
          <div className="flex gap-1.5 pt-2">
            {[64, 64, 64, 72].map((width, i) => (
              <div key={i} className="h-8 animate-pulse rounded-lg bg-raised" style={{ width }} />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4 border-t border-line pt-3">
        <p className="font-mono text-[11px] text-ink-3">
          {slow ? 'Still working. Some platforms take up to 30 seconds.' : 'Fetching video details…'}
        </p>
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
