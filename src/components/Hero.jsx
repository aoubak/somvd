import { platformLabel } from '../lib/format';
import videoDownloadService from '../services/videoDownloadService';
import VideoDownloader from './downloader/VideoDownloader';
import Container from './ui/Container';
import PlatformIcon from './ui/PlatformIcon';

const GLOW = { background: 'radial-gradient(60% 60% at 50% 0%, rgb(198 244 50 / 0.08), transparent 70%)' };

export default function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[520px]" style={GLOW} />
      {/* Left-aligned everywhere: stacked up to tablet, text left and downloader right from lg up */}
      <Container className="relative grid grid-cols-[minmax(0,1fr)] gap-y-9 pb-20 pt-10 text-left sm:pb-28 sm:pt-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:grid-rows-[auto_1fr] lg:gap-x-14 lg:gap-y-10 lg:pt-28">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs text-ink-2">
            <span className="size-1.5 rounded-full bg-lime shadow-[0_0_10px_var(--color-lime)]" aria-hidden="true" />
            Private by design · Nothing stored
          </p>
          <h1 id="hero-title" className="mt-6 max-w-3xl text-[44px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[56px]">
            Any video.
            <br />
            <span className="text-ink-4">One paste away.</span>
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-3">
            Paste a link, pick a quality, done. No account, no ads, nothing stored on our servers.
          </p>
        </div>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:pt-2">
          <VideoDownloader />
        </div>

        <ul aria-label="Supported platforms" className="flex flex-wrap items-center gap-x-6 gap-y-3 self-start text-[13px] font-medium text-ink-4 lg:col-start-1 lg:row-start-2 lg:gap-x-4">
          {videoDownloadService.getSupportedPlatforms().map(platform => (
            <li key={platform.name} className="flex items-center gap-2">
              <PlatformIcon name={platform.name} className="size-3.5" />
              {platformLabel(platform.name)}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
