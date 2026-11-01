const fs = require('fs');

// yt-dlp cannot read Facebook stories, so this reads the story page itself with the user's own
// login cookies and returns the same shape as `yt-dlp --dump-json` for the rest of the backend.

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none'
};

// Used when the video link does not carry its own height
const NOMINAL_HEIGHTS = { HD: 720, SD: 360 };

const ERRORS = {
  NO_COOKIES: { status: 451, error: 'Login required', message: 'Facebook stories need your own login. Add your cookies file (see SETUP.md, "Private videos").' },
  LOGIN: { status: 451, error: 'Login required', message: 'Facebook asked for a login. Your cookies have expired; export them again.' },
  NO_VIDEO: { status: 422, error: 'No video', message: 'No video found in this story. It may be a photo, expired, or not visible to your account.' },
  FETCH: { status: 502, error: 'Upstream error', message: "Couldn't reach Facebook right now. Please try again in a moment." }
};

// Errors carry the response the API should send
function storyError(code) {
  return Object.assign(new Error(code), { response: ERRORS[code] });
}

function isStoryUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  const hostname = parsed.hostname.toLowerCase();
  const isFacebook = hostname === 'facebook.com' || hostname.endsWith('.facebook.com');
  return isFacebook && /^\/stories\/\d+/.test(parsed.pathname);
}

// Cookie header for `host` from a Netscape cookies.txt
function cookieHeader(cookiesText, host) {
  const pairs = [];
  for (const rawLine of (cookiesText || '').split(/\r?\n/)) {
    const line = rawLine.replace(/^#HttpOnly_/, '');
    if (!line || line.startsWith('#')) continue;
    const fields = line.split('\t');
    if (fields.length < 7) continue;
    const domain = fields[0].replace(/^\./, '').toLowerCase();
    if (host === domain || host.endsWith(`.${domain}`)) pairs.push(`${fields[5]}=${fields[6]}`);
  }
  return pairs.join('; ');
}

// The JSON value that starts at `start` (an array or object), found by matching brackets
function jsonValueAt(text, start) {
  let depth = 0;
  let inString = false;
  for (let i = start; i < text.length; i++) {
    const char = text[i];
    if (inString) {
      if (char === '\\') i++;
      else if (char === '"') inString = false;
    } else if (char === '"') {
      inString = true;
    } else if (char === '[' || char === '{') {
      depth++;
    } else if (char === ']' || char === '}') {
      depth--;
      if (depth === 0) return JSON.parse(text.slice(start, i + 1));
    }
  }
  throw new Error('Unterminated JSON value');
}

// First JSON string stored under `"key":` after `anchor`
function stringAfter(html, anchor, key) {
  const from = html.indexOf(anchor);
  if (from === -1) return null;
  const match = new RegExp(`"${key}":("(?:[^"\\\\]|\\\\.)*")`).exec(html.slice(from, from + 4000));
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function linkParam(videoUrl, name) {
  try {
    return new URL(videoUrl).searchParams.get(name);
  } catch {
    return null;
  }
}

// Details Facebook encodes in the video link itself: { vencode_tag: '...C3.720...', duration_s: 9 }
function linkDetails(videoUrl) {
  try {
    const efg = linkParam(videoUrl, 'efg');
    return efg ? JSON.parse(Buffer.from(efg, 'base64').toString('utf8')) : {};
  } catch {
    return {};
  }
}

function parseStoryPage(html, url) {
  const key = '"progressive_urls":';
  const at = html.indexOf(key);
  if (at === -1) {
    throw storyError(/login_form|\/login\.php/.test(html) ? 'LOGIN' : 'NO_VIDEO');
  }

  let entries;
  try {
    entries = jsonValueAt(html, at + key.length);
  } catch {
    throw storyError('NO_VIDEO');
  }

  let duration = null;
  const formats = (Array.isArray(entries) ? entries : [])
    .filter(entry => entry && entry.progressive_url)
    .map((entry) => {
      const quality = entry.metadata?.quality || 'SD';
      const details = linkDetails(entry.progressive_url);
      const taggedHeight = Number(/\.(\d{3,4})\./.exec(details.vencode_tag || '')?.[1]);
      if (details.duration_s) duration = details.duration_s;
      const bitrate = Number(linkParam(entry.progressive_url, 'bitrate'));
      return {
        // Facebook gives no file size, so estimate it for the quality picker
        ...(bitrate && details.duration_s ? { filesize_approx: Math.round(bitrate * details.duration_s / 8) } : {}),
        format_id: quality.toLowerCase(),
        url: entry.progressive_url,
        ext: 'mp4',
        protocol: 'https',
        height: taggedHeight || NOMINAL_HEIGHTS[quality] || 360,
        vcodec: 'h264',
        acodec: 'aac'
      };
    })
    .sort((a, b) => a.height - b.height);

  if (formats.length === 0) throw storyError('NO_VIDEO');

  const owner = stringAfter(html, '"story_bucket_owner":{', 'name');
  return {
    id: /\/stories\/(\d+)/.exec(url)?.[1] || 'story',
    title: owner ? `${owner} story` : 'Facebook story',
    uploader: owner,
    thumbnail: stringAfter(html, '"preferred_thumbnail":{', 'uri'),
    duration,
    webpage_url: url,
    extractor_key: 'Facebook',
    formats
  };
}

// Fetch the story page as the logged-in user and return yt-dlp style info
async function resolve(url, { cookiesFile, cookiesText, fetchImpl = fetch } = {}) {
  let text = cookiesText;
  if (text === undefined) {
    if (!cookiesFile || !fs.existsSync(cookiesFile)) throw storyError('NO_COOKIES');
    text = fs.readFileSync(cookiesFile, 'utf8');
  }
  const cookie = cookieHeader(text, 'www.facebook.com');

  let response;
  let html;
  try {
    response = await fetchImpl(url, { headers: { ...BROWSER_HEADERS, Cookie: cookie }, redirect: 'follow' });
    html = await response.text();
  } catch (error) {
    console.error('Facebook story fetch error:', error.message);
    throw storyError('FETCH');
  }

  if (/\/login/.test(response.url || '')) throw storyError(cookie ? 'LOGIN' : 'NO_COOKIES');
  if (!response.ok) throw storyError('FETCH');
  return parseStoryPage(html, url);
}

module.exports = { isStoryUrl, cookieHeader, parseStoryPage, resolve };
