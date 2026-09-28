import { useEffect, useRef } from 'react';
import { linkFromPaste } from '../../lib/globalPaste';
import { describeStatus } from './downloaderReducer';
import ResultCard from './ResultCard';
import ResultSkeleton from './ResultSkeleton';
import UrlForm from './UrlForm';
import { useDownloader } from './useDownloader';

export default function VideoDownloader() {
  const { state, setUrl, fetchInfo, selectFormat, startDownload, cancelDownload, reset } = useDownloader();
  const inputRef = useRef(null);
  const busy = state.status === 'fetching' || state.status === 'downloading';

  // Ctrl/⌘ V anywhere outside a text field pastes the link and starts fetching
  useEffect(() => {
    if (busy) return undefined;
    const onPaste = (event) => {
      const link = linkFromPaste(event.target, event.clipboardData?.getData('text'));
      if (!link) return;
      event.preventDefault();
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      fetchInfo(link);
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [busy, fetchInfo]);

  const startOver = () => {
    reset();
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const infoError = state.status === 'error' && state.error?.stage === 'info' ? state.error.message : null;
  const selectedFormat = state.info?.formats.find(f => f.id === state.formatId) ?? null;

  return (
    <div className="mx-auto w-full max-w-2xl text-left">
      <UrlForm
        inputRef={inputRef}
        url={state.url}
        onUrlChange={setUrl}
        onSubmit={fetchInfo}
        loading={state.status === 'fetching'}
        locked={state.status === 'downloading'}
        error={infoError}
      />
      <p aria-live="polite" className="sr-only">{describeStatus(state)}</p>

      {state.status === 'fetching' && <ResultSkeleton onCancel={startOver} />}
      {state.info && state.status !== 'fetching' && (
        <ResultCard
          state={state}
          onSelectFormat={selectFormat}
          onDownload={() => startDownload(state.info, selectedFormat)}
          onCancel={cancelDownload}
          onReset={startOver}
        />
      )}
    </div>
  );
}
