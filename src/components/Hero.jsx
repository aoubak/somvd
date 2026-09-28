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
      <Container className="relative pb-20 pt-14 text-center sm:pb-28 sm:pt-24">
        <p className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs text-ink-2">
          <span className="size-1.5 rounded-full bg-lime shadow-[0_0_10px_var(--color-lime)]" aria-hidden="true" />
          Private by design · Nothing stored
        </p>
        <h1 id="hero-title" className="mx-auto mt-6 max-w-3xl text-[44px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl">
          Any video.
          <br />
          <span className="text-ink-4">One paste away.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-ink-3">
          Paste a link, pick a quality, done. No account, no ads, nothing stored on our servers.
        </p>

        <div className="mt-9">
          <VideoDownloader />
        </div>

        <ul aria-label="Supported platforms" className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[13px] font-medium text-ink-4">
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
