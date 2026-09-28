# Studio Noir Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild SOMVD's frontend on a "Studio Noir" design system (tokens, primitives, focused single-page product) with an in-page downloader that shows progress, errors and cancel, and make YouTube merged downloads produce real MP4 files.

**Architecture:** Tailwind v4 `@theme` tokens in `src/index.css` are the only source of colors, fonts and motion. Small in-house primitives in `src/components/ui/` compose into page sections. Downloader logic is split into pure, unit-tested modules (`src/lib/*`, `downloaderReducer.js`, the download service) and thin React components; the service streams `/api/video/stream` with `fetch` and saves a Blob.

**Tech Stack:** React 19, React Router 7, Vite 7, Tailwind CSS 4, react-icons (`lu` Lucide, `si` Simple Icons), `@fontsource-variable/geist` + `geist-mono`, Vitest 3; backend Express 4 + yt-dlp + FFmpeg.

**Spec:** `docs/superpowers/specs/2026-09-28-studio-noir-redesign-design.md`

**Execution method (preset by the user):** Native, the implementer works through the tasks in this session.

## Global Constraints

- Dark only. Colors only from tokens: `canvas #09090B`, `surface #111113`, `raised #17171A`, `line rgb(255 255 255 / .07)`, `line-strong rgb(255 255 255 / .12)`, `ink #EDEDEF`, `ink-2 #A1A1AA`, `ink-3 #8B8B93`, `ink-4 #7C7C85`, `lime #C6F432`, `lime-ink #0A0A0B`, `danger #FF7A7A`.
- Fonts: Geist (UI) and Geist Mono (technical detail), self-hosted via `@fontsource-variable/*`; no Google Fonts request.
- Icons: `react-icons/lu` for UI, `react-icons/si` for platform logos. No emoji and no `react-icons/fa` in redesigned code.
- Radius 8 (buttons, chips), 12 (input), 14-16 (cards), 18 (CTA panel); 1 px `line` borders; no drop shadows except the lime focus halo.
- Motion 150-200 ms ease-out only; everything off under `prefers-reduced-motion`.
- Routes: `/`, `/terms`, `/privacy`; `/privacyPolicy` → `/privacy`, `/features` → `/#features`; everything else → NotFound. Router `basename: '/somvdapp'` stays.
- Login, Signup, Pricing, Donate files stay on disk, unrouted.
- In-page download threshold: files with `Content-Length` over 1 GB (`1024 ** 3`) go to the browser's native download.
- Copy must be true: no fake statistics, no claims the code does not deliver.
- Text contrast of every text token is at least 4.5:1 on `canvas` and `surface`.
- Phone layout works at 390 px width with 16 px side gutters and no horizontal scroll.

## Review Focus

1. `/stream` rate limit (HTTP 429, JSON with only `error`) or any 5xx JSON: the user sees the backend's sentence, never "Download failed" or raw JSON. Pinned in Task 3.
2. Backend unreachable (fetch throws `TypeError`, including Safari's "Load failed"): the user sees "Can't reach the SOMVD server…". Pinned in Task 3.
3. Double-clicking Download or switching quality mid-download: no second download starts and the selection is frozen. Pinned in Task 4 (reducer) and Task 6 (hook guard).
4. Ctrl/⌘ V while typing in any text field, or with non-URL text on the clipboard: the page-level paste handler does nothing. Pinned in Task 2.
5. Titles with emoji, Somali/Arabic text or 200+ characters: the saved filename is the UTF-8 `filename*` name and the card clamps the title to two lines. Pinned in Task 2 (filename) and Task 9 (visual check).

---

### Task 1: Design tokens, fonts and document shell

**Files:**
- Modify: `src/index.css` (full rewrite)
- Create: `src/pages/auth.css` (old login-only CSS moved out of the global sheet)
- Modify: `src/pages/Login.jsx:1`, `src/pages/Signup.jsx:1` (import `./auth.css`)
- Modify: `src/main.jsx:1-3` (font imports)
- Modify: `index.html` (full rewrite)
- Create: `public/favicon.svg`
- Modify: `.gitignore` (add `.superpowers/`)
- Modify: `package.json` (deps)

**Interfaces:**
- Produces: Tailwind utilities `bg-canvas|surface|raised`, `border-line|line-strong`, `text-ink|ink-2|ink-3|ink-4|lime|danger`, `bg-lime`, `text-lime-ink`, `font-sans`, `font-mono`, `animate-indeterminate`, custom utility `eyebrow`.

- [ ] **Step 1: Install fonts**

Run: `npm install @fontsource-variable/geist @fontsource-variable/geist-mono`
Then confirm the family names: `grep -h "font-family" node_modules/@fontsource-variable/geist/index.css node_modules/@fontsource-variable/geist-mono/index.css | sort -u`
Expected: `font-family: 'Geist Variable';` and `font-family: 'Geist Mono Variable';`

- [ ] **Step 2: Move login-only CSS out of the global sheet**

```bash
{ echo "/* Styles for the (currently unrouted) Login and Signup pages, moved out of the global sheet */"; git show HEAD:src/index.css | sed -n '13,$p'; } > src/pages/auth.css
```
Add `import './auth.css';` as the first import line of `src/pages/Login.jsx` and `src/pages/Signup.jsx`.

- [ ] **Step 3: Write `src/index.css`**

```css
@import "tailwindcss";

/* SOMVD "Studio Noir" design tokens: every color, font and animation in the UI comes from here */
@theme {
  --font-sans: "Geist Variable", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono Variable", ui-monospace, SFMono-Regular, Menlo, monospace;

  --color-canvas: #09090b;
  --color-surface: #111113;
  --color-raised: #17171a;
  --color-line: rgb(255 255 255 / 0.07);
  --color-line-strong: rgb(255 255 255 / 0.12);
  --color-ink: #ededef;
  --color-ink-2: #a1a1aa;
  --color-ink-3: #8b8b93;
  --color-ink-4: #7c7c85;
  --color-lime: #c6f432;
  --color-lime-ink: #0a0a0b;
  --color-danger: #ff7a7a;

  --animate-indeterminate: indeterminate 1.2s ease-in-out infinite;

  @keyframes indeterminate {
    from { transform: translateX(-100%); }
    to { transform: translateX(300%); }
  }
}

@layer base {
  html {
    color-scheme: dark;
    background-color: var(--color-canvas);
    scroll-behavior: smooth;
    scroll-padding-top: 5rem;
  }

  body {
    background-color: var(--color-canvas);
    color: var(--color-ink);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3 {
    text-wrap: balance;
  }

  ::selection {
    background-color: rgb(198 244 50 / 0.25);
    color: var(--color-ink);
  }

  :focus-visible {
    outline: 2px solid var(--color-lime);
    outline-offset: 2px;
  }
}

/* Mono uppercase label above section titles */
@utility eyebrow {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-ink-4);
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 4: Import fonts in `src/main.jsx`** (above `./index.css`)

```js
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
```

- [ ] **Step 5: Write `index.html` and `public/favicon.svg`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#09090B" />
    <meta name="color-scheme" content="dark" />
    <meta name="description" content="Download videos from YouTube, TikTok, Instagram, Facebook and X in the quality you want. Free, no sign-up, nothing stored." />
    <title>SOMVD · Download any video</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#C6F432"/><path d="M16 7v13M10 14.5l6 6 6-6M9 25h14" fill="none" stroke="#0A0A0B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
```

Append `.superpowers/` to `.gitignore` (brainstorming mockups; also keeps Tailwind from scanning them).

- [ ] **Step 6: Verify**

Run: `npm run build` → succeeds, and `grep -o 'href="[^"]*favicon.svg"' dist/index.html` prints `href="/somvdapp/favicon.svg"`.
Run the headless check against a dev server (`npx vite --port 5199 --strictPort`):
`node <browser-automation>/browser.mjs http://localhost:5199/somvdapp/ --eval "(async()=>{await document.fonts.ready;const s=getComputedStyle(document.body);return [s.backgroundColor,s.fontFamily.split(',')[0],document.fonts.check('16px \"Geist Variable\"')]})()"`
Expected: `["rgb(9, 9, 11)", "\"Geist Variable\"", true]`, 0 console errors.

- [ ] **Step 7: Commit** — `git add -A src/index.css src/pages/auth.css src/pages/Login.jsx src/pages/Signup.jsx src/main.jsx index.html public/favicon.svg .gitignore package.json package-lock.json && git commit -m "feat(ui): add Studio Noir design tokens, self-hosted Geist fonts, favicon"`

---

### Task 2: Pure display helpers (Vitest)

**Files:**
- Create: `src/lib/format.js`, `src/lib/format.test.js`
- Create: `src/lib/contentDisposition.js`, `src/lib/contentDisposition.test.js`
- Create: `src/lib/globalPaste.js`, `src/lib/globalPaste.test.js`
- Modify: `package.json` (`"test": "vitest run"`, devDependency `vitest`)

**Interfaces:**
- Produces: `formatBytes(bytes: number): string`, `formatSpeed(bytesPerSecond: number): string`, `qualityLabel(format: {type, quality} | null): string`, `platformLabel(name: string): string`, `filenameFromContentDisposition(header: string | null, fallback?: string): string`, `isEditableTarget(target): boolean`, `linkFromPaste(target, text: string): string | null`.

- [ ] **Step 1: Install Vitest and add the script**

Run: `npm install -D vitest@^3.2.4` and add `"test": "vitest run"` to `package.json` scripts.

- [ ] **Step 2: Write the failing tests**

`src/lib/format.test.js`
```js
import { describe, expect, it } from 'vitest';
import { formatBytes, formatSpeed, platformLabel, qualityLabel } from './format';

describe('formatBytes', () => {
  it('formats bytes, kilobytes, megabytes and gigabytes', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(52_100_000)).toBe('49.7 MB');
    expect(formatBytes(150 * 1024 * 1024)).toBe('150 MB');
    expect(formatBytes(3 * 1024 ** 3)).toBe('3.0 GB');
  });

  it('shows a dash for missing or invalid values', () => {
    expect(formatBytes(NaN)).toBe('—');
    expect(formatBytes(-1)).toBe('—');
    expect(formatBytes(undefined)).toBe('—');
  });
});

describe('formatSpeed', () => {
  it('appends per second and hides zero or invalid speeds', () => {
    expect(formatSpeed(6.2 * 1024 * 1024)).toBe('6.2 MB/s');
    expect(formatSpeed(0)).toBe('');
    expect(formatSpeed(NaN)).toBe('');
  });
});

describe('qualityLabel', () => {
  it('labels 2160p as 4K, audio as Audio and passes other qualities through', () => {
    expect(qualityLabel({ type: 'video', quality: '2160p' })).toBe('4K');
    expect(qualityLabel({ type: 'video', quality: '720p' })).toBe('720p');
    expect(qualityLabel({ type: 'video', quality: 'best' })).toBe('Best');
    expect(qualityLabel({ type: 'audio', quality: 'audio' })).toBe('Audio');
    expect(qualityLabel(null)).toBe('');
  });
});

describe('platformLabel', () => {
  it('shows Twitter as X and leaves other names alone', () => {
    expect(platformLabel('Twitter')).toBe('X');
    expect(platformLabel('YouTube')).toBe('YouTube');
    expect(platformLabel(undefined)).toBe('');
  });
});
```

`src/lib/contentDisposition.test.js`
```js
import { describe, expect, it } from 'vitest';
import { filenameFromContentDisposition } from './contentDisposition';

describe('filenameFromContentDisposition', () => {
  it('prefers the UTF-8 filename* the backend sends', () => {
    const header = `attachment; filename="Me at the zoo.mp4"; filename*=UTF-8''Me%20at%20the%20zoo.mp4`;
    expect(filenameFromContentDisposition(header)).toBe('Me at the zoo.mp4');
  });

  it('keeps emoji and non-Latin titles intact', () => {
    const header = `attachment; filename="Heesta  Soomaali.mp4"; filename*=UTF-8''Heesta%20%F0%9F%8E%B5%20Soomaali%20%D8%A3%D8%BA%D9%86%D9%8A%D8%A9.mp4`;
    expect(filenameFromContentDisposition(header)).toBe('Heesta 🎵 Soomaali أغنية.mp4');
  });

  it('decodes the characters the backend escapes', () => {
    const header = `attachment; filename*=UTF-8''It%27s%20%28live%29%2A.m4a`;
    expect(filenameFromContentDisposition(header)).toBe("It's (live)*.m4a");
  });

  it('falls back to the plain filename, then to the fallback', () => {
    expect(filenameFromContentDisposition('attachment; filename="clip.webm"')).toBe('clip.webm');
    expect(filenameFromContentDisposition('attachment; filename=clip.mp4')).toBe('clip.mp4');
    expect(filenameFromContentDisposition(null, 'video.mp4')).toBe('video.mp4');
    expect(filenameFromContentDisposition('attachment', 'x.mp4')).toBe('x.mp4');
  });

  it('ignores malformed percent-encoding and uses the plain name', () => {
    const header = `attachment; filename="safe.mp4"; filename*=UTF-8''bad%E0%A4%A.mp4`;
    expect(filenameFromContentDisposition(header)).toBe('safe.mp4');
  });
});
```

`src/lib/globalPaste.test.js`
```js
import { describe, expect, it } from 'vitest';
import { isEditableTarget, linkFromPaste } from './globalPaste';

const body = { tagName: 'BODY', isContentEditable: false };

describe('isEditableTarget', () => {
  it('treats inputs, textareas, selects and contenteditable as editable', () => {
    expect(isEditableTarget({ tagName: 'INPUT' })).toBe(true);
    expect(isEditableTarget({ tagName: 'TEXTAREA' })).toBe(true);
    expect(isEditableTarget({ tagName: 'SELECT' })).toBe(true);
    expect(isEditableTarget({ tagName: 'DIV', isContentEditable: true })).toBe(true);
    expect(isEditableTarget(body)).toBe(false);
    expect(isEditableTarget(null)).toBe(false);
  });
});

describe('linkFromPaste', () => {
  it('returns a trimmed http(s) link pasted onto the page', () => {
    expect(linkFromPaste(body, '  https://youtu.be/abc \n')).toBe('https://youtu.be/abc');
  });

  it('ignores pastes into text fields', () => {
    expect(linkFromPaste({ tagName: 'INPUT' }, 'https://youtu.be/abc')).toBeNull();
    expect(linkFromPaste({ tagName: 'DIV', isContentEditable: true }, 'https://youtu.be/abc')).toBeNull();
  });

  it('ignores text that is not a single link', () => {
    expect(linkFromPaste(body, 'hello world')).toBeNull();
    expect(linkFromPaste(body, 'ftp://example.com/file')).toBeNull();
    expect(linkFromPaste(body, 'https://a.com/x https://b.com/y')).toBeNull();
    expect(linkFromPaste(body, '')).toBeNull();
    expect(linkFromPaste(body, undefined)).toBeNull();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test` → FAIL (modules `./format`, `./contentDisposition`, `./globalPaste` not found).

- [ ] **Step 4: Implement**

`src/lib/format.js`
```js
// Display helpers shared by the downloader UI

const UNITS = ['B', 'KB', 'MB', 'GB'];

// 1536 -> "1.5 KB", 157286400 -> "150 MB"
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit++;
  }
  const digits = unit === 0 || value >= 100 ? 0 : 1;
  return `${value.toFixed(digits)} ${UNITS[unit]}`;
}

export function formatSpeed(bytesPerSecond) {
  if (!Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0) return '';
  return `${formatBytes(bytesPerSecond)}/s`;
}

// Chip label for a backend format: '2160p' -> '4K', audio -> 'Audio'
export function qualityLabel(format) {
  if (!format) return '';
  if (format.type === 'audio') return 'Audio';
  if (format.quality === '2160p') return '4K';
  if (format.quality === 'best') return 'Best';
  return format.quality;
}

// Brand name shown to users (the backend still calls X "Twitter")
export function platformLabel(name) {
  return name === 'Twitter' ? 'X' : name || '';
}
```

`src/lib/contentDisposition.js`
```js
// Filename from a Content-Disposition header; prefers RFC 5987 filename* over filename
export function filenameFromContentDisposition(header, fallback = 'video.mp4') {
  if (!header) return fallback;

  const extended = /filename\*\s*=\s*[^']*'[^']*'([^;]+)/i.exec(header);
  if (extended) {
    try {
      return decodeURIComponent(extended[1].trim());
    } catch {
      // Malformed percent-encoding: fall back to the plain filename
    }
  }

  const plain = /filename\s*=\s*(?:"([^"]*)"|([^;]+))/i.exec(header);
  const name = plain ? (plain[1] ?? plain[2] ?? '').trim() : '';
  return name || fallback;
}
```

`src/lib/globalPaste.js`
```js
// Page-level paste: only a single http(s) link pasted outside any text field counts

export function isEditableTarget(target) {
  if (!target || typeof target !== 'object') return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || Boolean(target.isContentEditable);
}

export function linkFromPaste(target, text) {
  if (isEditableTarget(target)) return null;
  const candidate = (text || '').trim();
  return /^https?:\/\/\S+$/i.test(candidate) ? candidate : null;
}
```

- [ ] **Step 5: Run tests to verify they pass** — `npm test` → all pass; `npx eslint src/lib` → clean.

- [ ] **Step 6: Commit** — `git add src/lib package.json package-lock.json && git commit -m "feat(lib): add formatting, Content-Disposition and paste helpers with tests"`

---

### Task 3: Download service with progress, errors and native handoff

**Files:**
- Modify: `src/services/videoDownloadService.js` (full rewrite)
- Create: `src/services/videoDownloadService.test.js`
- Modify: `backend/server.js` (CORS `exposedHeaders`)

**Interfaces:**
- Consumes: `filenameFromContentDisposition` (Task 2).
- Produces (default export singleton `videoDownloadService`):
  - `detectPlatform(url): {name, icon} | null`, `validateUrl(url): boolean`, `getSupportedPlatforms(): {name, icon}[]` (unchanged)
  - `getVideoInfo(url, { signal }?): Promise<VideoInfo>`
  - `getStreamUrl(videoInfo, format | null): string`
  - `download(videoInfo, format, { signal?, onProgress?, save?, saveNative? }): Promise<{ filename, mode: 'blob', size } | { filename, mode: 'native' }>`; `onProgress({ received, total: number | null, bytesPerSecond })`
  - Named exports `NATIVE_DOWNLOAD_THRESHOLD`, `OFFLINE_MESSAGE`, `INTERRUPTED_MESSAGE`.
  - Errors: `Error` with a user-facing message; aborts propagate as `AbortError`.

- [ ] **Step 1: Write the failing tests** — `src/services/videoDownloadService.test.js`

```js
import { afterEach, describe, expect, it, vi } from 'vitest';
import service, { INTERRUPTED_MESSAGE, NATIVE_DOWNLOAD_THRESHOLD, OFFLINE_MESSAGE } from './videoDownloadService';

const info = { title: 'Me at the zoo', originalUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' };
const video720 = { id: 'mp4_720p', quality: '720p', ext: 'mp4', type: 'video' };
const audio = { id: 'audio_m4a', quality: 'audio', ext: 'm4a', type: 'audio' };

function streamOf(chunks) {
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    }
  });
}

function mockFetch(response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

afterEach(() => vi.unstubAllGlobals());

describe('getStreamUrl', () => {
  it('encodes the source URL and sends the format quality', () => {
    const url = service.getStreamUrl(info, audio);
    expect(url).toContain('/video/stream?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DjNQXAC9IVRw');
    expect(url).toMatch(/&quality=audio$/);
  });

  it('asks for the best quality when no format is given', () => {
    expect(service.getStreamUrl(info, null)).toMatch(/&quality=best$/);
  });
});

describe('download', () => {
  it('streams the body, reports progress and saves a Blob named from Content-Disposition', async () => {
    mockFetch(new Response(streamOf([new Uint8Array(3), new Uint8Array(5)]), {
      headers: {
        'Content-Length': '8',
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="Me at the zoo.mp4"; filename*=UTF-8''Me%20at%20the%20zoo.mp4`
      }
    }));
    const save = vi.fn();
    const onProgress = vi.fn();

    const result = await service.download(info, video720, { save, onProgress });

    expect(result).toEqual({ filename: 'Me at the zoo.mp4', mode: 'blob', size: 8 });
    expect(save).toHaveBeenCalledTimes(1);
    const [blob, name] = save.mock.calls[0];
    expect(name).toBe('Me at the zoo.mp4');
    expect(blob.size).toBe(8);
    expect(blob.type).toBe('video/mp4');
    expect(onProgress).toHaveBeenLastCalledWith(expect.objectContaining({ received: 8, total: 8 }));
  });

  it('hands files over the threshold to the browser download', async () => {
    const fetchMock = mockFetch(new Response(streamOf([new Uint8Array(1)]), {
      headers: { 'Content-Length': String(NATIVE_DOWNLOAD_THRESHOLD + 1) }
    }));
    const save = vi.fn();
    const saveNative = vi.fn();

    const result = await service.download(info, video720, { save, saveNative });

    expect(result).toEqual({ filename: 'Me at the zoo.mp4', mode: 'native' });
    expect(save).not.toHaveBeenCalled();
    expect(saveNative).toHaveBeenCalledWith(fetchMock.mock.calls[0][0], 'Me at the zoo.mp4');
  });

  it('shows the backend sentence when the stream is rate limited', async () => {
    mockFetch(jsonResponse({ error: 'Too many streaming requests, please wait before trying again.', retryAfter: '1 minute' }, 429));
    await expect(service.download(info, video720, { save: vi.fn() }))
      .rejects.toThrow('Too many streaming requests, please wait before trying again.');
  });

  it('prefers the backend message over the error code', async () => {
    mockFetch(jsonResponse({ error: 'Format not available', message: 'This video has no separate audio track. Download the video instead.' }, 422));
    await expect(service.download(info, audio, { save: vi.fn() }))
      .rejects.toThrow('This video has no separate audio track.');
  });

  it('explains when the server cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Load failed')));
    await expect(service.download(info, video720, { save: vi.fn() })).rejects.toThrow(OFFLINE_MESSAGE);
  });

  it('rejects a body that ends before Content-Length and saves nothing', async () => {
    mockFetch(new Response(streamOf([new Uint8Array(3)]), { headers: { 'Content-Length': '10' } }));
    const save = vi.fn();
    await expect(service.download(info, video720, { save })).rejects.toThrow(INTERRUPTED_MESSAGE);
    expect(save).not.toHaveBeenCalled();
  });

  it('lets a cancel propagate as AbortError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('The operation was aborted.', 'AbortError')));
    await expect(service.download(info, video720, { save: vi.fn() })).rejects.toMatchObject({ name: 'AbortError' });
  });
});

describe('getVideoInfo', () => {
  it('returns the data payload', async () => {
    mockFetch(jsonResponse({ success: true, data: { title: 'Clip', formats: [] } }, 200));
    await expect(service.getVideoInfo(info.originalUrl)).resolves.toEqual({ title: 'Clip', formats: [] });
  });

  it('uses the backend message on failure', async () => {
    mockFetch(jsonResponse({ error: 'Video not found', message: 'Unable to retrieve video information. The video may be private, deleted, or unavailable.' }, 404));
    await expect(service.getVideoInfo(info.originalUrl)).rejects.toThrow('The video may be private');
  });

  it('explains when the server cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(service.getVideoInfo(info.originalUrl)).rejects.toThrow(OFFLINE_MESSAGE);
  });

  it('falls back to the status code for non-JSON errors', async () => {
    mockFetch(new Response('<html>Bad gateway</html>', { status: 502 }));
    await expect(service.getVideoInfo(info.originalUrl)).rejects.toThrow('Request failed (502)');
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npm test` → FAIL (`getStreamUrl`/`download` not functions, named exports missing).

- [ ] **Step 3: Implement** — replace `src/services/videoDownloadService.js`:

```js
// Video Download Service - talks to the SOMVD backend
import { filenameFromContentDisposition } from '../lib/contentDisposition';

// Shown until the backend's /video/platforms list arrives. `hosts` drives URL detection
// by hostname (subdomains allowed), so lookalikes such as netflix.com don't match x.com.
const PLATFORMS = [
  { name: 'YouTube', icon: '🎥', hosts: ['youtube.com', 'youtu.be'] },
  { name: 'TikTok', icon: '🎵', hosts: ['tiktok.com'] },
  { name: 'Instagram', icon: '📸', hosts: ['instagram.com'] },
  { name: 'Facebook', icon: '👥', hosts: ['facebook.com', 'fb.watch'] },
  { name: 'Twitter', icon: '🐦', hosts: ['twitter.com', 'x.com'] }
];

// Files larger than this skip the in-memory Blob and use the browser's own download
export const NATIVE_DOWNLOAD_THRESHOLD = 1024 ** 3;
export const OFFLINE_MESSAGE = "Can't reach the SOMVD server. Check your connection and try again.";
export const INTERRUPTED_MESSAGE = 'The download was interrupted. Please try again.';
const PROGRESS_INTERVAL_MS = 100;

// Save a Blob as a file through a temporary object URL
function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser time to start writing the file before releasing the memory
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

class VideoDownloadService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
  }

  // Detect platform from URL for UI feedback (backend does the authoritative check)
  detectPlatform(url) {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return null;
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;

    const hostname = parsed.hostname.toLowerCase();
    const platform = PLATFORMS.find(p => p.hosts.some(h => hostname === h || hostname.endsWith(`.${h}`)));
    return platform ? { name: platform.name, icon: platform.icon } : null;
  }

  // Validate URL format (basic validation - backend will do thorough validation)
  validateUrl(url) {
    return this.detectPlatform(url) !== null;
  }

  // Default platform list, used until the backend responds
  getSupportedPlatforms() {
    return PLATFORMS.map(({ name, icon }) => ({ name, icon }));
  }

  // The backend's sentence for a failed response ({ message } or { error }), never raw JSON
  async errorFromResponse(response) {
    let body = null;
    try {
      body = await response.json();
    } catch {
      // Not JSON, e.g. a proxy error page
    }
    return new Error(body?.message || body?.error || `Request failed (${response.status}). Please try again.`);
  }

  // Get video information from backend
  async getVideoInfo(url, { signal } = {}) {
    let response;
    try {
      response = await fetch(`${this.baseURL}/video/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal
      });
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      throw new Error(OFFLINE_MESSAGE);
    }

    if (!response.ok) throw await this.errorFromResponse(response);
    const data = await response.json();
    return data.data;
  }

  // `format` is one of videoInfo.formats; its `quality` is the value /stream expects
  getStreamUrl(videoInfo, format) {
    const quality = format?.quality || 'best';
    return `${this.baseURL}/video/stream?url=${encodeURIComponent(videoInfo.originalUrl)}&quality=${encodeURIComponent(quality)}`;
  }

  // Download through the streaming endpoint, reporting progress, then save the file
  async download(videoInfo, format, {
    signal,
    onProgress,
    save = saveBlob,
    saveNative = (url, name) => this.triggerDownload(url, name)
  } = {}) {
    const url = this.getStreamUrl(videoInfo, format);

    let response;
    try {
      response = await fetch(url, { signal });
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      throw new Error(OFFLINE_MESSAGE);
    }
    if (!response.ok) throw await this.errorFromResponse(response);

    const fallbackName = `${videoInfo.title || 'video'}.${format?.ext || 'mp4'}`;
    const filename = filenameFromContentDisposition(response.headers.get('Content-Disposition'), fallbackName);
    const total = Number(response.headers.get('Content-Length')) || null;

    // Too big to hold in memory: stop this request and let the browser download it instead
    if (total && total > NATIVE_DOWNLOAD_THRESHOLD) {
      await response.body?.cancel();
      saveNative(url, filename);
      return { filename, mode: 'native' };
    }

    const reader = response.body.getReader();
    const chunks = [];
    const startedAt = Date.now();
    let received = 0;
    let lastReport = 0;

    const report = (force) => {
      const now = Date.now();
      if (!force && now - lastReport < PROGRESS_INTERVAL_MS) return;
      lastReport = now;
      const seconds = (now - startedAt) / 1000;
      onProgress?.({ received, total, bytesPerSecond: seconds > 0 ? received / seconds : 0 });
    };

    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.byteLength;
        report(false);
      }
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      throw new Error(INTERRUPTED_MESSAGE);
    }
    report(true);

    if (total && received < total) throw new Error(INTERRUPTED_MESSAGE);

    const blob = new Blob(chunks, { type: response.headers.get('Content-Type') || 'application/octet-stream' });
    save(blob, filename);
    return { filename, mode: 'blob', size: received };
  }

  // Native browser download; Content-Disposition: attachment keeps the page in place
  triggerDownload(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

// Export singleton instance
export default new VideoDownloadService();
```

- [ ] **Step 4: Expose the filename header to the browser** — in `backend/server.js` CORS options add `exposedHeaders: ['Content-Disposition'],` after `allowedHeaders`.

- [ ] **Step 5: Run tests** — `npm test` → all pass. `npx eslint src/services backend` → clean.

- [ ] **Step 6: Commit** — `git add src/services backend/server.js && git commit -m "feat(download): stream downloads with progress, readable errors and native handoff"`

---

### Task 4: Downloader state machine

**Files:**
- Create: `src/components/downloader/downloaderReducer.js`
- Create: `src/components/downloader/downloaderReducer.test.js`

**Interfaces:**
- Produces: `initialState`, `downloaderReducer(state, action)`, `defaultFormatId(formats): string | null`, `describeStatus(state): string`.
- State: `{ status: 'idle'|'fetching'|'ready'|'downloading'|'done'|'error', url, info, formatId, progress: {received,total,bytesPerSecond}|null, error: {stage:'info'|'download', message}|null, savedAs: {filename, mode}|null }`.
- Actions: `SET_URL {url}`, `FETCH_START {url}`, `FETCH_SUCCESS {info}`, `FETCH_FAILURE {message}`, `SELECT_FORMAT {formatId}`, `DOWNLOAD_START`, `DOWNLOAD_PROGRESS {progress}`, `DOWNLOAD_SUCCESS {filename, mode}`, `DOWNLOAD_FAILURE {message}`, `DOWNLOAD_CANCEL`, `RESET`.

- [ ] **Step 1: Write the failing tests** — `downloaderReducer.test.js`

```js
import { describe, expect, it } from 'vitest';
import { defaultFormatId, describeStatus, downloaderReducer, initialState } from './downloaderReducer';

const formats = [
  { id: 'mp4_1080p', quality: '1080p', type: 'video' },
  { id: 'mp4_720p', quality: '720p', type: 'video' },
  { id: 'audio_m4a', quality: 'audio', type: 'audio' }
];
const info = { title: 'Clip', formats };
const run = (...actions) => actions.reduce(downloaderReducer, initialState);
const fetched = () => run({ type: 'FETCH_START', url: 'https://youtu.be/x' }, { type: 'FETCH_SUCCESS', info });
const downloading = () => downloaderReducer(fetched(), { type: 'DOWNLOAD_START' });

describe('defaultFormatId', () => {
  it('prefers 720p, then the best video, then anything', () => {
    expect(defaultFormatId(formats)).toBe('mp4_720p');
    expect(defaultFormatId([formats[0], formats[2]])).toBe('mp4_1080p');
    expect(defaultFormatId([formats[2]])).toBe('audio_m4a');
    expect(defaultFormatId([])).toBeNull();
  });
});

describe('downloaderReducer', () => {
  it('moves from fetching to ready with the default format selected', () => {
    const state = fetched();
    expect(state.status).toBe('ready');
    expect(state.url).toBe('https://youtu.be/x');
    expect(state.formatId).toBe('mp4_720p');
  });

  it('records an info error and clears it when the link is edited', () => {
    const failed = run({ type: 'FETCH_START', url: 'https://youtu.be/x' }, { type: 'FETCH_FAILURE', message: 'Private video' });
    expect(failed).toMatchObject({ status: 'error', error: { stage: 'info', message: 'Private video' } });
    expect(downloaderReducer(failed, { type: 'SET_URL', url: 'https://youtu.be/y' })).toMatchObject({ status: 'idle', error: null, url: 'https://youtu.be/y' });
  });

  it('ignores a second download start while one is running', () => {
    const state = downloading();
    expect(state.status).toBe('downloading');
    expect(downloaderReducer(state, { type: 'DOWNLOAD_START' })).toBe(state);
  });

  it('freezes the quality selection during a download', () => {
    const state = downloading();
    expect(downloaderReducer(state, { type: 'SELECT_FORMAT', formatId: 'audio_m4a' })).toBe(state);
  });

  it('ignores progress when not downloading', () => {
    const state = fetched();
    expect(downloaderReducer(state, { type: 'DOWNLOAD_PROGRESS', progress: { received: 1 } })).toBe(state);
  });

  it('returns to ready on cancel and keeps the chosen format', () => {
    const state = downloaderReducer(downloading(), { type: 'DOWNLOAD_CANCEL' });
    expect(state).toMatchObject({ status: 'ready', progress: null, formatId: 'mp4_720p' });
  });

  it('keeps the video after a download error and allows a retry', () => {
    const failed = downloaderReducer(downloading(), { type: 'DOWNLOAD_FAILURE', message: 'Too many requests' });
    expect(failed).toMatchObject({ status: 'error', info, error: { stage: 'download', message: 'Too many requests' } });
    expect(downloaderReducer(failed, { type: 'DOWNLOAD_START' }).status).toBe('downloading');
  });

  it('marks done, then clears the saved note when another quality is picked', () => {
    const done = downloaderReducer(downloading(), { type: 'DOWNLOAD_SUCCESS', filename: 'Clip.mp4', mode: 'blob' });
    expect(done).toMatchObject({ status: 'done', savedAs: { filename: 'Clip.mp4', mode: 'blob' } });
    expect(downloaderReducer(done, { type: 'SELECT_FORMAT', formatId: 'audio_m4a' })).toMatchObject({ status: 'ready', formatId: 'audio_m4a', savedAs: null });
  });

  it('drops a fetch result that arrives after a reset', () => {
    const state = run({ type: 'FETCH_START', url: 'https://youtu.be/x' }, { type: 'RESET' }, { type: 'FETCH_SUCCESS', info });
    expect(state).toEqual(initialState);
  });
});

describe('describeStatus', () => {
  it('announces the saved file or the browser handoff', () => {
    const done = (mode) => downloaderReducer(downloading(), { type: 'DOWNLOAD_SUCCESS', filename: 'Clip.mp4', mode });
    expect(describeStatus(done('blob'))).toBe('Saved Clip.mp4.');
    expect(describeStatus(done('native'))).toBe('Download handed to your browser.');
    expect(describeStatus(initialState)).toBe('');
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npm test` → FAIL (module missing).

- [ ] **Step 3: Implement** — `downloaderReducer.js`

```js
// Downloader state machine: idle → fetching → ready → downloading → done,
// with error reachable from fetching (stage 'info') and downloading (stage 'download')

export const initialState = {
  status: 'idle',
  url: '',
  info: null,
  formatId: null,
  progress: null,
  error: null,
  savedAs: null
};

// 720p when offered, else the best video, else whatever exists
export function defaultFormatId(formats = []) {
  const pick = formats.find(f => f.quality === '720p') || formats.find(f => f.type === 'video') || formats[0];
  return pick ? pick.id : null;
}

// A video is loaded and nothing is in flight
function canPickOrDownload(state) {
  if (!state.info) return false;
  return state.status === 'ready' || state.status === 'done' ||
    (state.status === 'error' && state.error?.stage === 'download');
}

export function downloaderReducer(state, action) {
  switch (action.type) {
    case 'SET_URL':
      if (state.status === 'fetching' || state.status === 'downloading') return state;
      if (state.status === 'error' && state.error?.stage === 'info') {
        return { ...state, url: action.url, status: 'idle', error: null };
      }
      return { ...state, url: action.url };

    case 'FETCH_START':
      if (state.status === 'downloading') return state;
      return { ...initialState, url: action.url ?? state.url, status: 'fetching' };

    case 'FETCH_SUCCESS':
      if (state.status !== 'fetching') return state;
      return { ...state, status: 'ready', info: action.info, formatId: defaultFormatId(action.info.formats) };

    case 'FETCH_FAILURE':
      if (state.status === 'downloading') return state;
      return { ...state, status: 'error', info: null, error: { stage: 'info', message: action.message } };

    case 'SELECT_FORMAT':
      if (!canPickOrDownload(state)) return state;
      return { ...state, status: 'ready', formatId: action.formatId, error: null, savedAs: null };

    case 'DOWNLOAD_START':
      if (!canPickOrDownload(state)) return state;
      return {
        ...state,
        status: 'downloading',
        progress: { received: 0, total: null, bytesPerSecond: 0 },
        error: null,
        savedAs: null
      };

    case 'DOWNLOAD_PROGRESS':
      if (state.status !== 'downloading') return state;
      return { ...state, progress: action.progress };

    case 'DOWNLOAD_SUCCESS':
      if (state.status !== 'downloading') return state;
      return { ...state, status: 'done', progress: null, savedAs: { filename: action.filename, mode: action.mode } };

    case 'DOWNLOAD_FAILURE':
      if (state.status !== 'downloading') return state;
      return { ...state, status: 'error', progress: null, error: { stage: 'download', message: action.message } };

    case 'DOWNLOAD_CANCEL':
      if (state.status !== 'downloading') return state;
      return { ...state, status: 'ready', progress: null };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// One sentence for the screen-reader live region; progress ticks are left to the progressbar
export function describeStatus(state) {
  switch (state.status) {
    case 'fetching':
      return 'Fetching video details.';
    case 'ready':
      return state.info ? `Ready: ${state.info.title}. Choose a quality and download.` : '';
    case 'downloading':
      return 'Download started.';
    case 'done':
      return state.savedAs?.mode === 'native'
        ? 'Download handed to your browser.'
        : `Saved ${state.savedAs?.filename ?? 'the file'}.`;
    case 'error':
      return state.error?.message ?? '';
    default:
      return '';
  }
}
```

- [ ] **Step 4: Run tests** — `npm test` → all pass.

- [ ] **Step 5: Commit** — `git add src/components/downloader && git commit -m "feat(downloader): add tested downloader state machine"`

---

### Task 5: UI primitives and app shell (routing, header, footer, 404, legal pages)

**Files:**
- Create: `src/components/ui/Button.jsx`, `Container.jsx`, `Logo.jsx`, `TextLink.jsx`
- Create: `src/components/LegalLayout.jsx`, `src/pages/NotFound.jsx`
- Modify (rewrite): `src/main.jsx`, `src/App.jsx`, `src/components/Header.jsx`, `src/components/Footer.jsx`, `src/pages/Terms.jsx`, `src/pages/PrivacyPolicy.jsx`
- Delete: `src/pages/Features.jsx`

**Interfaces:**
- Produces: `<Button variant="primary|secondary|ghost" size="sm|md" loading to href …>`, `<Container as size="default|narrow" className>`, `<Logo />`, `<LogoMark className />`, `<TextLink to|href>`, `<LegalLayout title updated intro>`, `<LegalSection title>`.

- [ ] **Step 1: Primitives**

`src/components/ui/Button.jsx`
```jsx
import { Link } from 'react-router-dom';
import { LuLoaderCircle } from 'react-icons/lu';

const VARIANTS = {
  primary: 'bg-lime font-semibold text-lime-ink hover:brightness-110',
  secondary: 'border border-line-strong text-ink hover:bg-raised',
  ghost: 'text-ink-3 hover:bg-raised hover:text-ink'
};

const SIZES = {
  sm: 'h-8 gap-1.5 px-3 text-[13px]',
  md: 'h-10 gap-2 px-4 text-sm'
};

// Renders a router Link with `to`, an anchor with `href`, otherwise a button
export default function Button({ variant = 'primary', size = 'md', loading = false, to, href, className = '', disabled, children, ...props }) {
  const classes = [
    'inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-lg font-medium transition-[background-color,color,filter] duration-150',
    'disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className
  ].join(' ');

  const content = (
    <>
      {loading && <LuLoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </>
  );

  if (to) return <Link to={to} className={classes} {...props}>{content}</Link>;
  if (href) return <a href={href} className={classes} {...props}>{content}</a>;
  return (
    <button type="button" className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  );
}
```

`src/components/ui/Container.jsx`
```jsx
const WIDTHS = { default: 'max-w-5xl', narrow: 'max-w-3xl' };

// Page-width wrapper with the 16 px phone gutter
export default function Container({ as: Tag = 'div', size = 'default', className = '', children, ...props }) {
  return (
    <Tag className={`mx-auto w-full px-4 sm:px-6 ${WIDTHS[size]} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
```

`src/components/ui/Logo.jsx`
```jsx
import { Link } from 'react-router-dom';

export function LogoMark({ className = 'size-5' }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-md bg-lime text-lime-ink ${className}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" className="size-[62%]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4v11M7 10.5l5 5 5-5M6 20h12" />
      </svg>
    </span>
  );
}

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.02em] text-ink" aria-label="SOMVD home">
      <LogoMark />
      somvd
    </Link>
  );
}
```

`src/components/ui/TextLink.jsx`
```jsx
import { Link } from 'react-router-dom';

const CLASSES = 'text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-lime';

export default function TextLink({ to, href, children, ...props }) {
  if (to) return <Link to={to} className={CLASSES} {...props}>{children}</Link>;
  return <a href={href} className={CLASSES} {...props}>{children}</a>;
}
```

- [ ] **Step 2: Routing and layout**

`src/main.jsx`
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import './index.css'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import NotFound from './pages/NotFound.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import Terms from './pages/Terms.jsx'

// Login, Signup, Pricing and Donate stay on disk but are not routed until they work end to end
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        // Pathless route so errors render inside the header/footer layout
        errorElement: <NotFound />,
        children: [
          { index: true, element: <Home /> },
          { path: 'terms', element: <Terms /> },
          { path: 'privacy', element: <PrivacyPolicy /> },
          // Old URLs
          { path: 'privacyPolicy', element: <Navigate to="/privacy" replace /> },
          { path: 'features', element: <Navigate to="/#features" replace /> },
          { path: '*', element: <NotFound /> }
        ]
      }
    ]
  }
], { basename: '/somvdapp' })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
```

`src/App.jsx`
```jsx
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'

// Scroll to #section after navigation, or to the top of a new page
function useScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
      return
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
}

function App() {
  useScrollToHash()

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only rounded-lg bg-lime px-3 py-2 text-sm font-semibold text-lime-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[60]">
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default App
```

- [ ] **Step 3: Header and footer**

`src/components/Header.jsx`
```jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LuMenu, LuX } from 'react-icons/lu';
import Container from './ui/Container';
import Logo from './ui/Logo';

const NAV = [
  { to: '/#how', label: 'How it works' },
  { to: '/#features', label: 'Features' },
  { to: '/#faq', label: 'FAQ' }
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const solid = scrolled || open;

  return (
    <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-200 ${solid ? 'border-line bg-canvas/80' : 'border-transparent bg-canvas/0'}`}>
      <Container className="flex h-14 items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-7 text-[13px] text-ink-3 md:flex">
          {NAV.map(item => (
            <Link key={item.to} to={item.to} className="transition-colors hover:text-ink">{item.label}</Link>
          ))}
        </nav>

        <span className="hidden rounded-full border border-line-strong px-2.5 py-1 font-mono text-[11px] text-ink-3 md:inline-flex">
          Free · No sign-up
        </span>

        <button
          type="button"
          className="-mr-2 grid size-10 place-items-center rounded-lg text-ink-2 hover:bg-raised hover:text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen(o => !o)}
        >
          {open ? <LuX className="size-5" aria-hidden="true" /> : <LuMenu className="size-5" aria-hidden="true" />}
        </button>
      </Container>

      {open && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-line md:hidden">
          <Container className="flex flex-col py-2">
            {NAV.map(item => (
              <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="py-3 text-[15px] text-ink-2 hover:text-ink">
                {item.label}
              </Link>
            ))}
          </Container>
        </nav>
      )}
    </header>
  );
}
```

`src/components/Footer.jsx`
```jsx
import { Link } from 'react-router-dom';
import Container from './ui/Container';
import Logo from './ui/Logo';

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <Container className="flex flex-col gap-6 py-8 text-[13px] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link to="/terms" className="transition-colors hover:text-ink">Terms</Link>
          <Link to="/privacy" className="transition-colors hover:text-ink">Privacy</Link>
          <a href="mailto:support@somvdapp.com" className="transition-colors hover:text-ink">support@somvdapp.com</a>
        </nav>
        <p className="font-mono text-[11px] text-ink-4">© {new Date().getFullYear()} SOMVD</p>
      </Container>
    </footer>
  );
}
```

- [ ] **Step 4: NotFound and legal pages**

`src/pages/NotFound.jsx`
```jsx
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
        Page not found. <span className="text-ink-4">It may have moved.</span>
      </h1>
      <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink-3">
        The page you are looking for doesn't exist. The downloader is on the home page.
      </p>
      <Button to="/" className="mt-8">Back to home</Button>
    </Container>
  );
}
```

`src/components/LegalLayout.jsx`
```jsx
import Container from './ui/Container';

export default function LegalLayout({ title, updated, intro, children }) {
  return (
    <Container size="narrow" className="py-16 sm:py-24">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{title}</h1>
      <p className="mt-3 font-mono text-[12px] text-ink-4">Last updated {updated}</p>
      {intro && <p className="mt-8 text-[15px] leading-relaxed text-ink-2">{intro}</p>}
      <div className="mt-10 space-y-8">{children}</div>
    </Container>
  );
}

export function LegalSection({ title, children }) {
  return (
    <section className="border-t border-line pt-8">
      <h2 className="text-lg font-semibold tracking-[-0.02em] text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink-3">{children}</div>
    </section>
  );
}
```

`src/pages/Terms.jsx` (content kept; wording unchanged except the date)
```jsx
import LegalLayout, { LegalSection } from '../components/LegalLayout';
import TextLink from '../components/ui/TextLink';

const LIST = 'list-disc space-y-2 pl-5 marker:text-ink-4';

export default function Terms() {
  return (
    <LegalLayout
      title="Terms of Service"
      updated="September 2026"
      intro="Welcome to SOMVD (Somali Video Downloader). By accessing or using our website, you agree to these Terms of Service. Please read them carefully."
    >
      <LegalSection title="1. Acceptance of Terms">
        <p>By using SOMVD, you agree to follow these Terms. If you do not agree, please do not use our service.</p>
      </LegalSection>
      <LegalSection title="2. Service Description">
        <p>SOMVD provides a tool that allows users to download publicly available videos and audio from supported platforms. SOMVD is free to use and is provided on a non‑profit basis.</p>
      </LegalSection>
      <LegalSection title="3. User Responsibilities">
        <ul className={LIST}>
          <li>You agree to use SOMVD only for personal and non-commercial purposes.</li>
          <li>You are solely responsible for ensuring that downloading or using content complies with the laws of your country and the Terms of Service of the platform from which the content is downloaded.</li>
          <li>You must not use SOMVD to download or distribute copyrighted content illegally.</li>
        </ul>
      </LegalSection>
      <LegalSection title="4. Copyright Disclaimer">
        <p>SOMVD is not affiliated with YouTube, TikTok, Facebook, Instagram, Twitter (X), or any other platform. We respect the rights of content creators. Downloaded videos should only be used for personal, offline use unless you have permission from the copyright owner.</p>
      </LegalSection>
      <LegalSection title="5. Limitation of Liability">
        <p>SOMVD provides the service “as is” with no guarantees of accuracy, reliability, or availability. We are not responsible for any damages, losses, or legal issues that may result from using this service.</p>
      </LegalSection>
      <LegalSection title="6. Changes to the Service">
        <p>We may update or change SOMVD at any time, including adding or removing features, without prior notice.</p>
      </LegalSection>
      <LegalSection title="7. Termination">
        <p>We reserve the right to block or restrict access to SOMVD if a user is found to be violating these Terms or abusing the service.</p>
      </LegalSection>
      <LegalSection title="8. Changes to the Terms">
        <p>We may update these Terms of Service at any time. Updates will be posted on this page with a new “Last updated” date.</p>
      </LegalSection>
      <LegalSection title="9. Contact Us">
        <p>Email <TextLink href="mailto:support@somvdapp.com">support@somvdapp.com</TextLink> or visit <TextLink href="https://somvdapp.com" target="_blank" rel="noopener noreferrer">somvdapp.com</TextLink>.</p>
      </LegalSection>
    </LegalLayout>
  );
}
```

`src/pages/PrivacyPolicy.jsx` (factual fixes: no cookies at all, downloads pass through our server, technical logs, thumbnails load from the platform)
```jsx
import LegalLayout, { LegalSection } from '../components/LegalLayout';
import TextLink from '../components/ui/TextLink';

const LIST = 'list-disc space-y-2 pl-5 marker:text-ink-4';

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="September 2026"
      intro="At SOMVD (Somali Video Downloader), your privacy is very important to us. This Privacy Policy explains how we handle your information when you use our website."
    >
      <LegalSection title="1. Information We Collect">
        <ul className={LIST}>
          <li>We do not collect personal information when you use SOMVD, and there are no accounts.</li>
          <li>We do not track your downloads or browsing history, and we do not use your IP address for advertising.</li>
          <li>Our server keeps standard technical logs (such as IP address and the requested link) only as long as needed to run the service and prevent abuse.</li>
          <li>If you email us, we use your name and email address only to reply.</li>
        </ul>
      </LegalSection>
      <LegalSection title="2. How We Use Information">
        <p>We use any information you provide only to:</p>
        <ul className={LIST}>
          <li>Provide a better user experience.</li>
          <li>Improve our services and fix errors.</li>
          <li>Respond to your support requests.</li>
        </ul>
      </LegalSection>
      <LegalSection title="3. Cookies and Tracking">
        <p>SOMVD does not use cookies, analytics or advertising trackers.</p>
      </LegalSection>
      <LegalSection title="4. Third-Party Content">
        <p>SOMVD allows you to download content from third-party platforms (like YouTube, TikTok, Facebook, etc.). Video thumbnails load directly from those platforms. We are not responsible for the content you download; please follow the Terms of Service of each platform.</p>
      </LegalSection>
      <LegalSection title="5. Data Storage">
        <p>We do not store downloaded videos. Files stream from the source platform through our server straight to your browser and are never written to our disk.</p>
      </LegalSection>
      <LegalSection title="6. Children’s Privacy">
        <p>SOMVD is not designed for children under 13. We do not knowingly collect information from children.</p>
      </LegalSection>
      <LegalSection title="7. Changes to This Policy">
        <p>We may update this Privacy Policy from time to time. Updates will always be posted on this page with a new “Last updated” date.</p>
      </LegalSection>
      <LegalSection title="8. Contact Us">
        <p>Email <TextLink href="mailto:support@somvdapp.com">support@somvdapp.com</TextLink> or visit <TextLink href="https://somvdapp.com" target="_blank" rel="noopener noreferrer">somvdapp.com</TextLink>.</p>
      </LegalSection>
    </LegalLayout>
  );
}
```

Delete `src/pages/Features.jsx` (`git rm src/pages/Features.jsx`).

- [ ] **Step 5: Verify** — `npm run lint && npm test && npm run build` all pass. Headless (dev server on 5199): script visits `/somvdapp/terms` (h1 "Terms of Service"), `/somvdapp/privacyPolicy` (URL ends `/privacy`, h1 "Privacy Policy"), `/somvdapp/login` and `/somvdapp/nope` (h1 starts "Page not found", header present), and at 390×844 opens the mobile menu (3 links) then clicks "FAQ" (menu closes). 0 console errors.

- [ ] **Step 6: Commit** — `git add -A src && git commit -m "feat(ui): app shell with primitives, header, footer, 404 and restyled legal pages"`

---

### Task 6: Downloader UI and hero

**Files:**
- Create: `src/components/ui/Kbd.jsx`, `ProgressBar.jsx`, `PlatformIcon.jsx`
- Create: `src/components/downloader/useDownloader.js`, `VideoDownloader.jsx`, `UrlForm.jsx`, `ResultSkeleton.jsx`, `ResultCard.jsx`, `QualityPicker.jsx`
- Modify (rewrite): `src/components/Hero.jsx`
- Delete: `src/components/VideoDownloader.jsx`

**Interfaces:**
- Consumes: service (Task 3), reducer (Task 4), `formatBytes`, `formatSpeed`, `qualityLabel`, `platformLabel`, `linkFromPaste` (Task 2), `Button` (Task 5).
- Produces: `useDownloader(): { state, setUrl(url), fetchInfo(url), selectFormat(id), startDownload(info, format), cancelDownload(), reset() }`; `<Kbd>`, `pasteShortcut`; `<ProgressBar value label>` (`value` 0..1 or `null` = indeterminate); `<PlatformIcon name className>`. The URL input has `id="video-url"` (used by the closing CTA in Task 7).

- [ ] **Step 1: Small primitives**

`src/components/ui/Kbd.jsx`
```jsx
const isApple = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Paste shortcut for this device
export const pasteShortcut = isApple ? '⌘ V' : 'Ctrl V';

// Keyboard hint styled like a physical key
export default function Kbd({ children, className = '' }) {
  return (
    <kbd className={`rounded-[5px] border border-b-2 border-line-strong px-1.5 py-px font-mono text-[11px] text-ink-3 ${className}`}>
      {children}
    </kbd>
  );
}
```

`src/components/ui/ProgressBar.jsx`
```jsx
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
```

`src/components/ui/PlatformIcon.jsx`
```jsx
import { SiFacebook, SiInstagram, SiTiktok, SiX, SiYoutube } from 'react-icons/si';

const ICONS = { YouTube: SiYoutube, TikTok: SiTiktok, Instagram: SiInstagram, Facebook: SiFacebook, Twitter: SiX, X: SiX };

export default function PlatformIcon({ name, className = 'size-4' }) {
  const Icon = ICONS[name];
  return Icon ? <Icon className={className} aria-hidden="true" /> : null;
}
```

- [ ] **Step 2: Hook** — `src/components/downloader/useDownloader.js`

```js
import { useCallback, useEffect, useReducer, useRef } from 'react';
import videoDownloadService from '../../services/videoDownloadService';
import { downloaderReducer, initialState } from './downloaderReducer';

const UNSUPPORTED_MESSAGE = "That link isn't from a supported platform. Try YouTube, TikTok, Instagram, Facebook or X.";

export function useDownloader() {
  const [state, dispatch] = useReducer(downloaderReducer, initialState);
  const fetchAbort = useRef(null);
  const downloadAbort = useRef(null);

  // Stop in-flight requests when the downloader unmounts
  useEffect(() => () => {
    fetchAbort.current?.abort();
    downloadAbort.current?.abort();
  }, []);

  const setUrl = useCallback((url) => dispatch({ type: 'SET_URL', url }), []);
  const selectFormat = useCallback((formatId) => dispatch({ type: 'SELECT_FORMAT', formatId }), []);

  const fetchInfo = useCallback(async (rawUrl) => {
    const url = (rawUrl || '').trim();
    if (!url) {
      dispatch({ type: 'FETCH_FAILURE', message: 'Paste a video link first.' });
      return;
    }
    if (!videoDownloadService.validateUrl(url)) {
      dispatch({ type: 'SET_URL', url });
      dispatch({ type: 'FETCH_FAILURE', message: UNSUPPORTED_MESSAGE });
      return;
    }

    fetchAbort.current?.abort();
    const controller = new AbortController();
    fetchAbort.current = controller;
    dispatch({ type: 'FETCH_START', url });

    try {
      const info = await videoDownloadService.getVideoInfo(url, { signal: controller.signal });
      dispatch({ type: 'FETCH_SUCCESS', info });
    } catch (error) {
      if (error.name !== 'AbortError') dispatch({ type: 'FETCH_FAILURE', message: error.message });
    } finally {
      if (fetchAbort.current === controller) fetchAbort.current = null;
    }
  }, []);

  const startDownload = useCallback(async (info, format) => {
    if (downloadAbort.current || !info || !format) return; // one download at a time
    const controller = new AbortController();
    downloadAbort.current = controller;
    dispatch({ type: 'DOWNLOAD_START' });

    try {
      const result = await videoDownloadService.download(info, format, {
        signal: controller.signal,
        onProgress: (progress) => dispatch({ type: 'DOWNLOAD_PROGRESS', progress })
      });
      dispatch({ type: 'DOWNLOAD_SUCCESS', filename: result.filename, mode: result.mode });
    } catch (error) {
      if (error.name === 'AbortError') dispatch({ type: 'DOWNLOAD_CANCEL' });
      else dispatch({ type: 'DOWNLOAD_FAILURE', message: error.message });
    } finally {
      downloadAbort.current = null;
    }
  }, []);

  const cancelDownload = useCallback(() => downloadAbort.current?.abort(), []);

  const reset = useCallback(() => {
    fetchAbort.current?.abort();
    downloadAbort.current?.abort();
    dispatch({ type: 'RESET' });
  }, []);

  return { state, setUrl, fetchInfo, selectFormat, startDownload, cancelDownload, reset };
}
```

- [ ] **Step 3: Components**

`src/components/downloader/UrlForm.jsx`
```jsx
import { LuClipboardPaste, LuLink, LuTriangleAlert } from 'react-icons/lu';
import videoDownloadService from '../../services/videoDownloadService';
import Button from '../ui/Button';
import Kbd, { pasteShortcut } from '../ui/Kbd';
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
```

`src/components/downloader/ResultSkeleton.jsx`
```jsx
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
```

`src/components/downloader/QualityPicker.jsx`
```jsx
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
```

`src/components/downloader/ResultCard.jsx`
```jsx
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
```

`src/components/downloader/VideoDownloader.jsx`
```jsx
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
```

- [ ] **Step 4: Hero** — rewrite `src/components/Hero.jsx`

```jsx
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
```

Delete the old component: `git rm src/components/VideoDownloader.jsx`.

- [ ] **Step 5: Verify**
  - `npm run lint && npm test && npm run build` pass.
  - Start a test backend with the new code: `PORT=3099 FRONTEND_URL=http://localhost:5199 node backend/server.js` and a dev server `VITE_API_URL=http://localhost:3099/api npx vite --port 5199 --strictPort`.
  - Headless script at 1440×900: (a) type `https://netflix.com/x` and submit → `#video-url-error` says "isn't from a supported platform"; (b) fill `https://www.youtube.com/watch?v=jNQXAC9IVRw`, submit → skeleton visible → result card `#result-title` "Me at the zoo" within 120 s; radiogroup has ≥ 2 radios, one `aria-checked=true`; (c) press ArrowRight on the checked chip → the next chip is checked; (d) click the audio chip, click Download → progressbar appears → a Playwright `download` event fires with `suggestedFilename()` ending `.m4a` within 180 s → "Saved" line visible; (e) screenshot. 0 console errors.
  - Headless at 390×844: screenshot of the hero with a result card; `document.documentElement.scrollWidth <= 390`.

- [ ] **Step 6: Commit** — `git add -A src && git commit -m "feat(downloader): in-page downloader with progress, cancel, errors and paste anywhere"`

---

### Task 7: Home sections and removals

**Files:**
- Create: `src/components/ui/SectionHeader.jsx`, `src/components/HowItWorks.jsx`, `src/components/Features.jsx`, `src/components/Facts.jsx`, `src/components/ClosingCta.jsx`
- Modify (rewrite): `src/components/FAQ.jsx`, `src/pages/Home.jsx`
- Delete: `src/components/HowWorks.jsx`, `src/components/Contact.jsx`, `src/components/Statistics.jsx`, `src/components/SupPlatforms.jsx`, `src/assets/images/contact_image.jpg`

**Interfaces:**
- Consumes: `Container`, `Button`, `TextLink` (Task 5), `Kbd`, `pasteShortcut` (Task 6).
- Produces: `<SectionHeader id eyebrow title muted lede align>`; section ids `how`, `features`, `faq` (nav targets).

- [ ] **Step 1: `src/components/ui/SectionHeader.jsx`**

```jsx
// Eyebrow + two-tone title (+ optional lede) used by every home section
export default function SectionHeader({ id, eyebrow, title, muted, lede, align = 'left' }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-xl text-center' : 'max-w-xl'}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={id} className="mt-3 text-3xl font-semibold leading-[1.1] tracking-[-0.035em] text-ink sm:text-4xl">
        {title}
        {muted && <> <span className="text-ink-4">{muted}</span></>}
      </h2>
      {lede && <p className="mt-3 text-[15px] leading-relaxed text-ink-3">{lede}</p>}
    </div>
  );
}
```

- [ ] **Step 2: `src/components/HowItWorks.jsx`**

```jsx
import Container from './ui/Container';
import SectionHeader from './ui/SectionHeader';

const STEPS = [
  { n: '01', title: 'Paste the link', body: 'Copy a video URL from YouTube, TikTok, Instagram, Facebook or X and paste it above.' },
  { n: '02', title: 'Pick a quality', body: 'Choose anything from 240p up to 4K, or keep just the audio track.' },
  { n: '03', title: 'Save it', body: 'The file streams straight to your device. We never keep a copy.' }
];

export default function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="border-t border-line py-20 sm:py-28">
      <Container>
        <SectionHeader id="how-title" eyebrow="How it works" title="Three steps." muted="No detours." />
        <ol className="mt-10 grid divide-y divide-line overflow-hidden rounded-2xl border border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {STEPS.map(step => (
            <li key={step.n} className="p-6">
              <span className="font-mono text-[11px] text-lime">{step.n}</span>
              <h3 className="mt-5 text-[15px] font-medium tracking-[-0.01em] text-ink">{step.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
```

- [ ] **Step 3: `src/components/Features.jsx`**

```jsx
import { Fragment } from 'react';
import { LuBan, LuSmartphone } from 'react-icons/lu';
import Container from './ui/Container';
import Kbd, { pasteShortcut } from './ui/Kbd';
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
```

- [ ] **Step 4: `src/components/Facts.jsx`**

```jsx
import Container from './ui/Container';

// Honest numbers that describe the product, not usage
const FACTS = [
  { value: '5', label: 'Platforms' },
  { value: '4K', label: 'Max quality' },
  { value: '0', label: 'Files stored' },
  { value: '0', label: 'Sign-ups needed' }
];

export default function Facts() {
  return (
    <section aria-label="SOMVD at a glance" className="border-y border-line">
      <Container>
        <dl className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
          {FACTS.map(fact => (
            <div key={fact.label} className="flex flex-col-reverse bg-canvas px-2 py-8 sm:px-6">
              <dt className="mt-1 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-4">{fact.label}</dt>
              <dd className="text-3xl font-semibold tracking-[-0.03em] text-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
```

- [ ] **Step 5: `src/components/FAQ.jsx`** (full rewrite)

```jsx
import { LuPlus } from 'react-icons/lu';
import Container from './ui/Container';
import SectionHeader from './ui/SectionHeader';
import TextLink from './ui/TextLink';

const FAQS = [
  { q: 'Is SOMVD free?', a: 'Yes. There are no fees, no ads and no premium tier.' },
  { q: 'Do I need an account?', a: 'No. Paste a link and download. There is nothing to sign up for.' },
  { q: 'Do you store my videos?', a: 'No. Files stream from the platform through our server straight to your device and are never written to our disk.' },
  { q: 'Which platforms work?', a: 'YouTube, TikTok, Instagram, Facebook and X (Twitter). Public videos only.' },
  { q: 'Why is a quality missing?', a: "We only list what the platform offers for that video. If it was uploaded in 720p, there's no 1080p to download." },
  { q: "Why don't I see an audio option?", a: 'Some videos come without a separate audio track. Download the video instead.' },
  { q: 'Can I download private videos?', a: "No. Private, age-restricted and login-only videos can't be fetched." },
  {
    q: 'Is it legal?',
    a: (
      <>
        Downloading is fine for your own videos, openly licensed content, or anything you have permission to save. Respect copyright and each platform's terms. See our <TextLink to="/terms">Terms of Service</TextLink>.
      </>
    )
  }
];

export default function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="py-20 sm:py-28">
      <Container className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
        <div>
          <SectionHeader id="faq-title" eyebrow="FAQ" title="Questions," muted="answered." />
          <p className="mt-4 text-[14px] text-ink-3">
            Still stuck? <TextLink href="mailto:support@somvdapp.com">support@somvdapp.com</TextLink>
          </p>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {FAQS.map(({ q, a }, i) => (
            <details key={q} className="group" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] text-ink [&::-webkit-details-marker]:hidden">
                {q}
                <LuPlus className="size-4 shrink-0 text-ink-4 transition-transform duration-200 group-open:rotate-45" aria-hidden="true" />
              </summary>
              <p className="pb-5 pr-8 text-[14px] leading-relaxed text-ink-3">{a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 6: `src/components/ClosingCta.jsx` and `src/pages/Home.jsx`**

```jsx
import Button from './ui/Button';
import Container from './ui/Container';

const GLOW = { backgroundImage: 'radial-gradient(70% 90% at 50% 100%, rgb(198 244 50 / 0.09), transparent 70%)' };

export default function ClosingCta() {
  const focusDownloader = () => {
    const input = document.getElementById('video-url');
    input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    input?.focus({ preventScroll: true });
  };

  return (
    <section aria-labelledby="cta-title" className="pb-20 sm:pb-28">
      <Container>
        <div className="rounded-[18px] border border-line bg-surface px-6 py-14 text-center sm:py-16" style={GLOW}>
          <h2 id="cta-title" className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            Paste a link. <span className="text-ink-4">That's it.</span>
          </h2>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button onClick={focusDownloader}>Start downloading</Button>
            <Button variant="secondary" to="/#faq">Read the FAQ</Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
```

```jsx
import ClosingCta from '../components/ClosingCta'
import Facts from '../components/Facts'
import FAQ from '../components/FAQ'
import Features from '../components/Features'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Features />
      <Facts />
      <FAQ />
      <ClosingCta />
    </>
  )
}
```

- [ ] **Step 7: Remove replaced files**

`git rm src/components/HowWorks.jsx src/components/Contact.jsx src/components/Statistics.jsx src/components/SupPlatforms.jsx src/assets/images/contact_image.jpg`

- [ ] **Step 8: Verify** — `npm run lint && npm test && npm run build` pass; build output lists no asset over 200 KB. Headless at 1440×900 and 390×844: full-page screenshots reviewed section by section; `/somvdapp/features` lands with `#features` in view; nav "FAQ" scrolls to `#faq`; "Start downloading" focuses `#video-url`; `scrollWidth <= innerWidth` on phone; 0 console errors.

- [ ] **Step 9: Commit** — `git add -A src && git commit -m "feat(home): Studio Noir home sections; drop fake stats and contact block"`

---

### Task 8: YouTube reliability (backend)

**Files:**
- Modify: `backend/services/videoProcessor.js` (`ytdlpArgs`, size estimate)
- Modify: `backend/routes/video.js` (use `ytdlpArgs`, merge selector, fragmented MP4)
- Modify: `backend/.env.example`, `backend/README.md` (document the runtime, remove deleted endpoints)

**Interfaces:**
- Produces: `videoProcessor.ytdlpArgs(...args: string[]): string[]`, the full `python` argument list for a yt-dlp call.

- [ ] **Step 1: Upgrade yt-dlp with its challenge-solver component and confirm the flag works**

Run: `python -m pip install -U "yt-dlp[default]"`, then
`python -m yt_dlp --js-runtimes node -F "https://www.youtube.com/watch?v=jNQXAC9IVRw" 2>&1 | grep -iE "warning|^(18|134|140) "`
Expected: no "No supported JavaScript runtime" warning; formats 134 and 140 listed.

- [ ] **Step 2: Write the failing check** — MP4 merge output (scratch script, run against a test backend on port 3099):

```bash
curl -s -o merged.mp4 "http://localhost:3099/api/video/stream?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DjNQXAC9IVRw&quality=720p"
ffprobe -v error -show_entries format=format_name:stream=codec_type,codec_name -of csv=p=0 merged.mp4
```
Expected after the fix: `format_name` contains `mp4`, streams `h264,video` and `aac,audio`. Before the fix: `mpegts`, `bin_data` and `opus`.

- [ ] **Step 3: Implement `ytdlpArgs`** — in `VideoProcessor`:

```js
  // Every yt-dlp call starts here. Current yt-dlp needs a JavaScript runtime for full YouTube
  // support; set YTDLP_JS_RUNTIMES=off for yt-dlp versions older than 2025.11.
  ytdlpArgs(...args) {
    const runtimes = process.env.YTDLP_JS_RUNTIMES ?? 'node';
    const base = ['-m', 'yt_dlp'];
    if (runtimes && runtimes !== 'off') base.push('--js-runtimes', runtimes);
    return [...base, ...args];
  }
```
Use it in `getVideoInfo` (`spawn('python', this.ytdlpArgs('--dump-json', '--no-download', '--no-warnings', url))`) and in `routes/video.js` for both the `--dump-json` spawn and the merge spawn.

- [ ] **Step 4: Real MP4 from the merge path** — in `routes/video.js` merge branch:

```js
          // Prefer H.264 + AAC so the merged file plays everywhere; fall back to any codecs
          const h = targetH ? `[height<=${targetH}]` : '';
          const sel = `bestvideo${h}[vcodec^=avc1]+bestaudio[acodec^=mp4a]/bestvideo${h}+bestaudio/best${h}/best`;
```
and add to the merge args (after `--merge-output-format`):
```js
              // yt-dlp writes MPEG-TS to stdout by default; ask ffmpeg for fragmented MP4 instead
              '--downloader-args', 'ffmpeg_o:-f mp4 -movflags +frag_keyframe+empty_moov+default_base_moof',
```

- [ ] **Step 5: Honest size estimates** — in `extractFormats`, compute the audio pick before the video loop and add its size to video-only formats:

```js
    const audioFormat = this.pickAudioFormat(sortedFormats);
    const audioBytes = audioFormat ? (audioFormat.filesize || audioFormat.filesize_approx || 0) : 0;
```
Replace the `processedFormats.push({...})` call inside the video loop with:
```js
          // Video-only formats get merged with the audio track, so count both
          const videoBytes = format.filesize || format.filesize_approx || 0;
          const totalBytes = videoBytes ? videoBytes + (hasAudio ? 0 : audioBytes) : null;

          processedFormats.push({
            id: `mp4_${quality}`,
            label: `MP4 ${this.getQualityLabel(quality)}${hasAudio ? ' (with audio)' : ''}`,
            quality: quality,
            size: this.estimateFileSize(totalBytes, format.duration),
            formatId: format.format_id,
            ext: ext,
            type: 'video',
            height: height,
            width: format.width,
            fps: format.fps,
            hasAudio: hasAudio
          });
```
and delete the later `const audioFormat = this.pickAudioFormat(sortedFormats);` line so the audio entry reuses the variable declared above the loop.

- [ ] **Step 6: Docs** — `.env.example`: fix `PORT=3002`, add
```
# JavaScript runtime yt-dlp uses for YouTube (needs yt-dlp >= 2025.11; "off" to disable)
YTDLP_JS_RUNTIMES=node
```
`backend/README.md`: list only `GET /api/health`, `GET /api/video/health`, `POST /api/video/info`, `GET /api/video/platforms`, `GET /api/video/stream?url=&quality=`; install line `pip install -U "yt-dlp[default]"`.

- [ ] **Step 7: Verify** — restart the test backend; rerun Step 2 → `mov,mp4…`, `h264,video`, `aac,audio`; `curl …&quality=audio` still returns `audio/mp4`; `npx eslint backend` clean.

- [ ] **Step 8: Commit** — `git add backend && git commit -m "fix(youtube): use a JS runtime, merge to real MP4, count audio in size estimates"`

---

### Task 9: Final verification

- [ ] `npm run lint`, `npm test`, `npm run build` all pass; largest built asset under 200 KB (fonts excluded from the JS/CSS check).
- [ ] Headless full-page screenshots at 1440×900 and 390×844 of `/`, `/terms`, `/privacy`, `/nope`; review every section against the spec (tokens only, alignment, spacing rhythm, no overflow).
- [ ] End-to-end download (Task 6 Step 5 script) against the upgraded backend, video quality this time: `download` event with a `.mp4` filename; ffprobe of the saved file shows h264 + aac.
- [ ] Review Focus 5: inject a 220-character emoji title via `page.route` on `/video/info` and confirm the title clamps to two lines and the card does not overflow at 390 px.
- [ ] Lighthouse-style sanity: `document.querySelectorAll('img:not([alt])').length === 0`; every button has an accessible name (`--snapshot` shows no unnamed buttons).
- [ ] Stop test servers; `git status` clean apart from the user's untracked `SETUP.md`.
