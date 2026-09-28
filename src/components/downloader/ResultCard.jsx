import { useState } from 'react';
import { LuCheck, LuDownload, LuTriangleAlert } from 'react-icons/lu';
import { formatBytes, formatSpeed, platformLabel, qualityLabel } from '../../lib/format';
import Button from '../ui/Button';
import PlatformIcon from '../ui/PlatformIcon';
import ProgressBar from '../ui/ProgressBar';
import QualityPicker from './QualityPicker';

function Thumbnail({ info }) {
  const [failed, setFailed] = useState(false);
  const hasDuration = info.duration && info.duration !== 'Unknown';

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border border-line bg-raised">
      {info.thumbnail && !failed ? (
        <img src={info.thumbnail} alt="" referrerPolicy="no-referrer" onError={() => setFailed(true)} className="size-full object-cover" />
      ) : (
        <div className="grid size-full place-items-center text-ink-4">
          <PlatformIcon name={info.platform} className="size-6" />
        </div>
      )}
      {hasDuration && (
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1.5 py-0.5 font-mono text-[10px] text-ink">{info.duration}</span>
      )}
    </div>
  );
}

function DownloadProgress({ progress, onCancel }) {
  const { received = 0, total = null, bytesPerSecond = 0 } = progress || {};
  const ratio = total ? received / total : null;
  const amount = total ? `${formatBytes(received)} / ${formatBytes(total)}` : formatBytes(received);
  const detail = received === 0
    ? 'Preparing the file. This can take a few seconds.'
    : [amount, formatSpeed(bytesPerSecond)].filter(Boolean).join(' · ');

  return (
    <div className="flex items-center gap-4">
      <div className="min-w-0 flex-1">
        <ProgressBar value={ratio} label="Download progress" />
        <p className="mt-2 font-mono text-[11px] text-ink-3">{detail}</p>
      </div>
      <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
    </div>
  );
}

export default function ResultCard({ state, onSelectFormat, onDownload, onCancel, onReset }) {
  const { info, formatId, status, progress, error, savedAs } = state;
  const format = info.formats.find(f => f.id === formatId) || null;
  const downloading = status === 'downloading';
  const downloadError = status === 'error' && error?.stage === 'download' ? error.message : null;
  const bestVideo = info.formats.find(f => f.type === 'video' && f.quality !== 'best');
  const meta = [
    platformLabel(info.platform),
    bestVideo && `Up to ${qualityLabel(bestVideo)}`,
    info.duration !== 'Unknown' && info.duration
  ].filter(Boolean).join(' · ');

  return (
    <article aria-labelledby="result-title" className="mt-3 rounded-2xl border border-line bg-surface p-4">
      <div className="grid gap-4 sm:grid-cols-[168px_1fr]">
        <Thumbnail info={info} />
        <div className="min-w-0">
          <h2 id="result-title" title={info.title} className="line-clamp-2 break-words text-[15px] font-medium leading-snug tracking-[-0.01em] text-ink">
            {info.title}
          </h2>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-4">{meta}</p>
          <QualityPicker formats={info.formats} value={formatId} onChange={onSelectFormat} disabled={downloading} />
        </div>
      </div>

      <div className="mt-4 border-t border-line pt-4">
        {downloading ? (
          <DownloadProgress progress={progress} onCancel={onCancel} />
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={onDownload} disabled={!format}>
              <LuDownload className="size-4" aria-hidden="true" />
              Download {qualityLabel(format)}
            </Button>
            <Button variant="secondary" onClick={onReset}>New link</Button>
            {status === 'done' && savedAs && (
              <p className="flex min-w-0 items-center gap-2 text-[13px] text-ink-2">
                <LuCheck className="size-4 shrink-0 text-lime" aria-hidden="true" />
                <span className="truncate">
                  {savedAs.mode === 'native' ? 'Download handed to your browser' : `Saved ${savedAs.filename}`}
                </span>
              </p>
            )}
          </div>
        )}

        {downloadError && (
          <p role="alert" className="mt-3 flex items-start gap-2 text-[13px] leading-snug text-danger">
            <LuTriangleAlert className="mt-px size-4 shrink-0" aria-hidden="true" />
            {downloadError}
          </p>
        )}
      </div>
    </article>
  );
}
