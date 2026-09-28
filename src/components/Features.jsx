import { Fragment } from 'react';
import { LuBan, LuSmartphone } from 'react-icons/lu';
import { pasteShortcut } from '../lib/keyboard';
import Container from './ui/Container';
import Kbd from './ui/Kbd';
import SectionHeader from './ui/SectionHeader';

const FLOW = ['Platform', 'somvd', 'Your device'];
const WAVE = [5, 10, 15, 8, 18, 12, 6, 16, 10, 5, 13, 8, 4, 11];

function Tile({ className = '', visual, title, children }) {
  return (
    <div className={`relative flex min-h-40 flex-col justify-end overflow-hidden rounded-2xl border border-line bg-surface p-5 ${className}`}>
      {visual && <div className="absolute inset-x-5 top-5">{visual}</div>}
      <h3 className="text-[15px] font-medium tracking-[-0.01em] text-ink">{title}</h3>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-3">{children}</p>
    </div>
  );
}

function Chip({ selected, children }) {
  return (
    <span className={`rounded-md border px-2 py-1 font-mono text-[11px] ${selected ? 'border-lime bg-lime/[0.07] text-ink' : 'border-line-strong text-ink-2'}`}>
      {children}
    </span>
  );
}

function IconBox({ icon: Icon }) {
  return (
    <span className="grid size-8 place-items-center rounded-lg border border-line-strong text-lime">
      <Icon className="size-4" aria-hidden="true" />
    </span>
  );
}

function FlowDiagram() {
  return (
    <div aria-hidden="true">
      <div className="flex items-center gap-2 font-mono text-[11px] text-ink-2">
        {FLOW.map((step, i) => (
          <Fragment key={step}>
            {i > 0 && <span className="h-px flex-1 bg-[repeating-linear-gradient(90deg,var(--color-lime)_0_6px,transparent_6px_12px)]" />}
            <span className={`rounded-md border px-2.5 py-1.5 ${step === 'somvd' ? 'border-lime/40 text-ink' : 'border-line-strong'}`}>{step}</span>
          </Fragment>
        ))}
      </div>
      <p className="mt-4 font-mono text-[11px] text-ink-4">stored on our servers: 0 bytes</p>
    </div>
  );
}

function Waveform() {
  return (
    <div className="flex h-5 items-center gap-[3px]" aria-hidden="true">
      {WAVE.map((height, i) => (
        <span key={i} className={`w-[3px] rounded-full ${i < 6 ? 'bg-lime' : 'bg-ink-4/50'}`} style={{ height }} />
      ))}
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="border-t border-line py-20 sm:py-28">
      <Container>
        <SectionHeader id="features-title" eyebrow="Features" title="Built to stay out of your way." />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:auto-rows-[168px] lg:grid-cols-3">
          <Tile className="min-h-64 sm:col-span-2 lg:row-span-2" visual={<FlowDiagram />} title="Private by design">
            Videos stream from the platform through somvd straight to you. Nothing is saved on our servers, and there's no account to create.
          </Tile>
          <Tile visual={<div className="flex justify-end gap-1.5" aria-hidden="true"><Chip>4K</Chip><Chip selected>1080p</Chip><Chip>720p</Chip></div>} title="Up to 4K">
            Every quality the source offers.
          </Tile>
          <Tile visual={<div className="flex items-center justify-between"><Waveform /><Chip selected>M4A</Chip></div>} title="Audio only">
            Keep just the sound.
          </Tile>
          <Tile visual={<IconBox icon={LuBan} />} title="No ads, no pop-ups">
            Just the tool. No redirects, no fake download buttons.
          </Tile>
          <Tile visual={<IconBox icon={LuSmartphone} />} title="Works on mobile">
            Any modern browser, nothing to install.
          </Tile>
          <Tile visual={<Kbd className="text-[12px]">{pasteShortcut}</Kbd>} title="Paste anywhere">
            Press {pasteShortcut} anywhere on the page to start.
          </Tile>
        </div>
      </Container>
    </section>
  );
}
