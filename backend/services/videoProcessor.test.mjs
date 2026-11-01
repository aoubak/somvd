import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// The backend is CommonJS; load it through Node's own require
const require = createRequire(import.meta.url);
const videoProcessor = require('./videoProcessor.js');

describe('describeYtdlpError', () => {
  it('maps known yt-dlp failures to a status and a plain sentence', () => {
    expect(videoProcessor.describeYtdlpError('ERROR: Requested format is not available')).toMatchObject({ status: 422 });
    expect(videoProcessor.describeYtdlpError('ERROR: [youtube] abc: Private video. Sign in if you have access')).toMatchObject({ status: 451 });
    expect(videoProcessor.describeYtdlpError('ERROR: [youtube] abc: Video unavailable')).toMatchObject({ status: 404 });
    expect(videoProcessor.describeYtdlpError('ERROR: [youtube] zzzzzzzzzzZ: This video is unavailable')).toMatchObject({ status: 404 });
  });

  it('never shows raw yt-dlp output for unknown failures', () => {
    const { status, message } = videoProcessor.describeYtdlpError('ERROR: [youtube] V4c6j87v2jY: The page needs to be reloaded.\n');
    expect(status).toBe(502);
    expect(message).not.toMatch(/ERROR|\[youtube\]|V4c6j87v2jY/);
    expect(message).toMatch(/try again/i);
    expect(videoProcessor.describeYtdlpError('').message).toBe(message);
  });
});

describe('describeUpstreamError', () => {
  it('explains a slow source as a timeout', () => {
    expect(videoProcessor.describeUpstreamError(new Error('Upstream timeout'))).toMatchObject({ status: 504 });
    expect(videoProcessor.describeUpstreamError(new Error('Upstream timeout')).message).not.toMatch(/Upstream/);
  });

  it('hides socket error details', () => {
    const { status, message } = videoProcessor.describeUpstreamError(new Error('read ECONNRESET'));
    expect(status).toBe(502);
    expect(message).not.toMatch(/ECONNRESET/);
  });
});

describe('describeYtdlpError for unsupported pages', () => {
  it('explains a page yt-dlp cannot read without showing its output', () => {
    const { status, message } = videoProcessor.describeYtdlpError('ERROR: Unsupported URL: https://www.facebook.com/login.php?next=x');
    expect(status).toBe(422);
    expect(message).not.toMatch(/ERROR|login\.php/);
  });
});

describe('personal mode', () => {
  afterEach(() => {
    delete process.env.PERSONAL_MODE;
    delete process.env.YTDLP_COOKIES;
    delete process.env.YTDLP_COOKIES_FROM_BROWSER;
  });

  it('rejects sites outside the platform list by default', () => {
    expect(videoProcessor.detectPlatform('https://vimeo.com/76979871')).toBeNull();
  });

  it('accepts any http(s) link when PERSONAL_MODE is on', () => {
    process.env.PERSONAL_MODE = 'true';
    expect(videoProcessor.detectPlatform('https://vimeo.com/76979871')).toMatchObject({ key: 'other' });
    expect(videoProcessor.detectPlatform('https://youtu.be/jNQXAC9IVRw')).toMatchObject({ key: 'youtube' });
    expect(videoProcessor.detectPlatform('ftp://vimeo.com/76979871')).toBeNull();
    expect(videoProcessor.detectPlatform('not a link')).toBeNull();
  });

  it('names an unlisted site after the yt-dlp extractor', () => {
    const other = { key: 'other', name: 'Web' };
    expect(videoProcessor.processVideoInfo({ id: '1', title: 't', extractor_key: 'Vimeo' }, other).platform).toBe('Vimeo');
    expect(videoProcessor.processVideoInfo({ id: '1', title: 't' }, other).platform).toBe('Web');
  });
});

describe('ytdlpArgs cookies', () => {
  const realDefault = videoProcessor.defaultCookiesFile;
  beforeEach(() => { videoProcessor.defaultCookiesFile = 'no-such-cookies.txt'; });
  afterEach(() => {
    videoProcessor.defaultCookiesFile = realDefault;
    delete process.env.YTDLP_COOKIES;
    delete process.env.YTDLP_COOKIES_FROM_BROWSER;
  });

  it('sends no cookies unless configured', () => {
    expect(videoProcessor.ytdlpArgs('x').join(' ')).not.toMatch(/cookies/);
  });

  it('passes the cookies file to every yt-dlp call', () => {
    process.env.YTDLP_COOKIES = 'C:\cookies.txt';
    const args = videoProcessor.ytdlpArgs('--dump-json', 'URL');
    expect(args.slice(args.indexOf('--cookies'), args.indexOf('--cookies') + 2)).toEqual(['--cookies', 'C:\cookies.txt']);
    expect(args.at(-1)).toBe('URL');
  });

  it('can read cookies from a browser instead', () => {
    process.env.YTDLP_COOKIES_FROM_BROWSER = 'firefox';
    const args = videoProcessor.ytdlpArgs('URL');
    expect(args.slice(args.indexOf('--cookies-from-browser'), args.indexOf('--cookies-from-browser') + 2)).toEqual(['--cookies-from-browser', 'firefox']);
  });
});

describe('describeYtdlpError for sites that need an account', () => {
  it('says login is required when yt-dlp asks for cookies', () => {
    const stderr = 'ERROR: [vimeo] 76979871: The web client only works when logged-in. Use --cookies, --cookies-from-browser to provide account credentials.';
    expect(videoProcessor.describeYtdlpError(stderr)).toMatchObject({ status: 451 });
  });
});

describe('Facebook stories', () => {
  it('accepts story links as Facebook', () => {
    expect(videoProcessor.detectPlatform('https://www.facebook.com/stories/123/abc=/?view_single=1')).toMatchObject({ key: 'facebook' });
    expect(videoProcessor.isFacebookStory('https://www.facebook.com/stories/123/abc=/')).toBe(true);
    expect(videoProcessor.isFacebookStory('https://www.facebook.com/reel/123')).toBe(false);
  });

  it('uses backend/cookies.txt when no cookies file is configured', () => {
    const realDefault = videoProcessor.defaultCookiesFile;
    videoProcessor.defaultCookiesFile = fileURLToPath(import.meta.url);
    expect(videoProcessor.cookiesFile()).toBe(videoProcessor.defaultCookiesFile);
    videoProcessor.defaultCookiesFile = 'no-such-cookies.txt';
    expect(videoProcessor.cookiesFile()).toBeNull();
    videoProcessor.defaultCookiesFile = realDefault;
  });
});

describe('redirectTarget', () => {
  it('returns the next address for a redirect from the video source', () => {
    expect(videoProcessor.redirectTarget(302, { location: 'https://cdn2.example/v.mp4?a=1' }, 'https://cdn.example/v.mp4')).toBe('https://cdn2.example/v.mp4?a=1');
    expect(videoProcessor.redirectTarget(301, { location: '/other.mp4' }, 'https://cdn.example/v.mp4')).toBe('https://cdn.example/other.mp4');
  });

  it('ignores normal responses and unusable redirects', () => {
    expect(videoProcessor.redirectTarget(200, {}, 'https://cdn.example/v.mp4')).toBeNull();
    expect(videoProcessor.redirectTarget(206, { location: 'https://x.example' }, 'https://cdn.example/v.mp4')).toBeNull();
    expect(videoProcessor.redirectTarget(302, {}, 'https://cdn.example/v.mp4')).toBeNull();
    expect(videoProcessor.redirectTarget(302, { location: 'ftp://x.example/v' }, 'https://cdn.example/v.mp4')).toBeNull();
  });
});
