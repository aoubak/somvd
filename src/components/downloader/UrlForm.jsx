import { LuClipboardPaste, LuLink, LuTriangleAlert } from 'react-icons/lu';
import { pasteShortcut } from '../../lib/keyboard';
import videoDownloadService from '../../services/videoDownloadService';
import Button from '../ui/Button';
import Kbd from '../ui/Kbd';
import PlatformIcon from '../ui/PlatformIcon';

const canReadClipboard = typeof navigator !== 'undefined' && Boolean(navigator.clipboard?.readText);

export default function UrlForm({ inputRef, url, onUrlChange, onSubmit, loading, locked, error }) {
  const platform = videoDownloadService.detectPlatform(url);

  const pasteFromClipboard = async () => {
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (!text) return;
      onUrlChange(text);
      if (videoDownloadService.validateUrl(text)) onSubmit(text);
    } catch {
      // Permission denied: let the user paste by hand
      inputRef.current?.focus();
    }
  };

  return (
    <form noValidate onSubmit={(event) => { event.preventDefault(); onSubmit(url); }}>
      <label htmlFor="video-url" className="sr-only">Video link</label>
      <div
        className={`flex items-center gap-2 rounded-xl border bg-surface p-1.5 pl-3.5 transition-[border-color,box-shadow] duration-150 focus-within:border-lime/50 focus-within:shadow-[0_0_0_4px_rgb(198_244_50/0.10)] ${error ? 'border-danger/50' : 'border-line-strong'}`}
      >
        {platform
          ? <PlatformIcon name={platform.name} className="size-4 shrink-0 text-ink-2" />
          : <LuLink className="size-4 shrink-0 text-ink-4" aria-hidden="true" />}

        <input
          ref={inputRef}
          id="video-url"
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="Paste a video link…"
          value={url}
          onChange={(event) => onUrlChange(event.target.value)}
          disabled={loading || locked}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'video-url-error' : undefined}
          className="min-w-0 flex-1 bg-transparent py-2 font-mono text-[13px] text-ink placeholder:text-ink-4 focus-visible:outline-none disabled:opacity-60 sm:text-sm"
        />

        {!url && canReadClipboard && (
          <Button variant="ghost" size="sm" onClick={pasteFromClipboard} className="sm:hidden">
            <LuClipboardPaste className="size-4" aria-hidden="true" />
            Paste
          </Button>
        )}
        {!url && <Kbd className="hidden sm:inline">{pasteShortcut}</Kbd>}

        <Button type="submit" loading={loading} disabled={locked || !url.trim()}>
          {loading ? 'Fetching' : 'Fetch'}
        </Button>
      </div>

      {error && (
        <p id="video-url-error" role="alert" className="mt-3 flex items-start gap-2 text-[13px] leading-snug text-danger">
          <LuTriangleAlert className="mt-px size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </form>
  );
}
