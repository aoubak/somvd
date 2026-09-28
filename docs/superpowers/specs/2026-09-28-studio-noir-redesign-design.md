# SOMVD "Studio Noir" redesign

Date: 2026-09-28 · Branch: `feat/studio-noir-redesign` · Status: approved ("go for all recommendations")

## Goal

Make SOMVD look and behave like a real, premium product for a portfolio: one consistent design
system, a focused single-page product, and a downloader that shows real state (progress, errors,
cancel) instead of opening raw JSON in a new tab.

## Decisions

| Topic | Decision |
|---|---|
| Scope | Focused tool: Home (downloader), Terms, Privacy. Login, Signup, Pricing, Donate routes and nav links are hidden; their files stay. |
| Visual direction | **A · Studio Noir**: near-black, hairline borders, one lime accent, Geist + Geist Mono. Dark only. |
| Home structure | Nav → Hero + downloader → How it works → Features bento → Facts strip → FAQ → Closing CTA → Footer. |
| `/features` | Becomes the Features section; the route redirects to `/#features`. |
| Removed | Fake statistics, Contact section (12 MB image, WhatsApp), header's second Download button. |
| Download mechanism | In-page `fetch` with progress and Cancel, saved via Blob. If the server reports more than 1 GB, hand off to the browser's native download. |
| Build approach | Tailwind v4 `@theme` tokens + small in-house UI primitives. No component library. |
| Fonts | Self-hosted `@fontsource-variable/geist` and `geist-mono` (no Google Fonts request). |
| Icons | `react-icons/lu` (Lucide) for UI, `react-icons/si` for platform logos. No emoji, no Font Awesome in redesigned code. |

## Design tokens (`src/index.css`, `@theme`)

| Token | Value | Use |
|---|---|---|
| `canvas` | `#09090B` | Page background |
| `surface` | `#111113` | Cards, input |
| `raised` | `#17171A` | Hover, pressed, skeleton |
| `line` | `rgb(255 255 255 / .07)` | Hairline borders, dividers |
| `line-strong` | `rgb(255 255 255 / .12)` | Input and chip borders |
| `ink` | `#EDEDEF` | Primary text |
| `ink-2` | `#A1A1AA` | Secondary text |
| `ink-3` | `#8B8B93` | Body copy on dark, nav links |
| `ink-4` | `#7C7C85` | Labels, muted headline half (4.8:1 on canvas) |
| `lime` | `#C6F432` | Single accent: primary button, focus ring, progress, selected chip |
| `lime-ink` | `#0A0A0B` | Text on lime |
| `danger` | `#FF7A7A` | Error text and icons |

Type: Geist for UI, Geist Mono for technical detail (sizes, formats, step numbers, eyebrows).
Display 56/1.02 tracking -0.045em semibold; section title 36/1.1 -0.035em; body 15/1.55;
eyebrow: mono 11 px uppercase, tracking 0.08em. Headlines pair an `ink` phrase with an `ink-4`
phrase ("Any video. / One paste away.").

Shape: radius 8 (buttons, chips), 12 (input), 14 (cards), 18 (CTA panel). Borders are 1 px `line`.
No drop shadows except the lime focus halo. Motion: 150-200 ms ease-out transitions only, disabled
under `prefers-reduced-motion`.

## UI primitives (`src/components/ui/`)

- `Button`: variants `primary` (lime), `secondary` (outline), `ghost`; sizes `sm`/`md`; `loading`
  state with spinner; renders `<a>` when `href` is given.
- `Container`: max width + side gutters (16 px on phones).
- `SectionHeader`: eyebrow, two-tone title, optional lede.
- `Kbd`: keyboard hint (shows `⌘ V` on Apple devices, `Ctrl V` elsewhere).
- `Logo`: lime download mark + `somvd` wordmark.
- `ProgressBar`: determinate (percentage) and indeterminate (unknown size) modes.
- `PlatformIcon`: maps platform name to its Simple Icons logo.

## Downloader behaviour

States: `idle → fetching → ready → downloading → done`, with `error` reachable from fetching and
downloading.

- **Idle:** URL field with link icon, detected-platform logo inside the field, a Paste button
  (Clipboard API, hidden when unsupported) and the `Kbd` hint. Pressing Ctrl/⌘ V anywhere on the
  page (focus not in a text field) pastes into the field and starts fetching.
- **Fetching:** Fetch button shows a spinner; a skeleton result card appears. After 6 s a hint
  says some platforms take up to 30 s.
- **Ready:** thumbnail (or platform placeholder), title, `PLATFORM · UP TO 1080P · 3:42` mono meta
  line, quality chips as an accessible radio group (label + size), primary "Download 1080p"
  button, secondary "New link".
- **Downloading:** progress bar, `52.1 / 84 MB · 6.2 MB/s` (or `52.1 MB · 6.2 MB/s` when size is
  unknown), Cancel button. Quality chips disabled.
- **Done:** success line with the saved filename; actions "Download another quality" and
  "New link".
- **Error:** inline panel under the input (info errors) or inside the card (download errors) with
  the backend's message, never raw JSON.

Download mechanics (`videoDownloadService.download`): `fetch(streamUrl, { signal })`; non-2xx
responses are parsed as the backend's JSON error. With `Content-Length` > 1 GB, abort and trigger
a native download of the same URL. Otherwise read the body stream, report `{ received, total,
bytesPerSecond }` at most every 100 ms, build a Blob, save it via an object URL named from
`Content-Disposition` (`filename*` preferred), then revoke the URL.

Backend support: CORS must expose `Content-Disposition` so the browser can read the filename.

## Pages and routing

- Routes: `/` (Home), `/terms`, `/privacy`; `/privacyPolicy` and `/features` redirect;
  unknown routes and router errors render a styled `NotFound` page.
- `App` scrolls to `#hash` targets after navigation (nav links are `/#how`, `/#features`,
  `/#faq`).
- Terms and Privacy share a `LegalLayout` (eyebrow, title, "Last updated", readable prose width).
- Header: sticky, blurred background, bottom border once scrolled; on phones the links collapse
  into a disclosure menu that closes on navigation.
- `index.html`: real title and meta description, `theme-color`, SVG favicon of the lime mark.

## Removed files

`components/Contact.jsx`, `components/Statistics.jsx`, `components/SupPlatforms.jsx`,
`pages/Features.jsx`, `assets/images/contact_image.jpg`. Login/Signup/Pricing/Donate stay on disk,
unrouted.

## YouTube reliability (backend, same branch)

- Pass a JS runtime to yt-dlp (`--js-runtimes node`, overridable with `YTDLP_JS_RUNTIMES`), which
  current yt-dlp needs for full YouTube format lists.
- Merged downloads must be real MP4s: prefer H.264 + AAC tracks and write fragmented MP4 to
  stdout instead of MPEG-TS labelled `.mp4`.
- Size estimates for video-only formats add the audio track's size.
- Upgrade the local yt-dlp (`python -m pip install -U yt-dlp`).

## Accessibility

Visible lime focus ring on every interactive element; quality chips are a `radiogroup` with arrow
key support; status and progress changes are announced through an `aria-live="polite"` region;
all icon-only buttons have labels; FAQ uses native `<details>/<summary>`; every text token (`ink` to `ink-4`, `danger`)
is at least 4.5:1 on both `canvas` and `surface`.

## Verification

- `npm run lint` clean and `npm run build` succeeds (no image over 200 KB in the bundle).
- Headless browser, desktop (1440×900) and phone (390×844): no console errors or failed requests;
  screenshots of every section reviewed.
- Scripted flow against a local backend with a real short video: paste → fetch → pick quality →
  progress → a file download event with the right filename; unsupported URL shows an inline error;
  hidden routes show NotFound.
