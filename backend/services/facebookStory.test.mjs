import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const facebookStory = require('./facebookStory.js');

const STORY_URL = 'https://www.facebook.com/stories/111/abc=/?view_single=1';

// Shaped like the JSON Facebook embeds in a logged-in story page (URLs keep their escaped slashes)
function efg(tag) {
  return encodeURIComponent(Buffer.from(JSON.stringify({ vencode_tag: tag, duration_s: 9 })).toString('base64'));
}
const SD = `https:\\/\\/video.example\\/sd.mp4?efg=${efg('xpv_progressive.FACEBOOK..C3.360.sve_sd')}&x=[1]`;
const HD = `https:\\/\\/video.example\\/hd.mp4?efg=${efg('xpv_progressive.FACEBOOK..C3.720.dash_h264-basic-gen2_720p')}&bitrate=800000`;
const PAGE = `<html><script>{"story_bucket_owner":{"__typename":"User","id":"1","name":"Amina \\u0645 Ali"},
"preferred_thumbnail":{"image":{"uri":"https:\\/\\/img.example\\/t.jpg?a=1&b=2"}},
"videoDeliveryResponseResult":{"progressive_urls":[{"progressive_url":"${SD}","failure_reason":null,"metadata":{"quality":"SD"}},{"progressive_url":"${HD}","failure_reason":null,"metadata":{"quality":"HD"}}]}}</script></html>`;

describe('isStoryUrl', () => {
  it('matches Facebook story links only', () => {
    expect(facebookStory.isStoryUrl(STORY_URL)).toBe(true);
    expect(facebookStory.isStoryUrl('https://m.facebook.com/stories/111/abc')).toBe(true);
    expect(facebookStory.isStoryUrl('https://www.facebook.com/reel/123')).toBe(false);
    expect(facebookStory.isStoryUrl('https://evil.example/facebook.com/stories/1/a')).toBe(false);
    expect(facebookStory.isStoryUrl('not a link')).toBe(false);
  });
});

describe('parseStoryPage', () => {
  it('turns the embedded video links into yt-dlp style formats', () => {
    const info = facebookStory.parseStoryPage(PAGE, STORY_URL);
    expect(info.title).toBe('Amina م Ali story');
    expect(info.uploader).toBe('Amina م Ali');
    expect(info.thumbnail).toBe('https://img.example/t.jpg?a=1&b=2');
    expect(info.duration).toBe(9);
    expect(info.webpage_url).toBe(STORY_URL);
    expect(info.formats.map(f => f.height)).toEqual([360, 720]);
    expect(info.formats[1]).toMatchObject({ ext: 'mp4', protocol: 'https', vcodec: 'h264', acodec: 'aac' });
    expect(info.formats[1].url).toMatch(/^https:\/\/video\.example\/hd\.mp4\?efg=/);
    expect(info.formats[0].url).toContain('x=[1]');
    // No size from Facebook: 800 kbit/s for 9 seconds is estimated instead
    expect(info.formats[1].filesize_approx).toBe(900000);
    expect(info.formats[0].filesize_approx).toBeUndefined();
  });

  it('falls back to nominal heights when the link does not say', () => {
    const page = '{"progressive_urls":[{"progressive_url":"https:\\/\\/v.example\\/a.mp4","metadata":{"quality":"HD"}}]}';
    expect(facebookStory.parseStoryPage(page, STORY_URL).formats[0].height).toBe(720);
  });

  it('reports a story without video', () => {
    expect(() => facebookStory.parseStoryPage('<html>{"story_bucket_owner":{"name":"A"}}</html>', STORY_URL))
      .toThrow(expect.objectContaining({ response: expect.objectContaining({ status: 422 }) }));
  });

  it('reports the login page as an expired login', () => {
    expect(() => facebookStory.parseStoryPage('<form id="login_form"></form>', STORY_URL))
      .toThrow(expect.objectContaining({ response: expect.objectContaining({ status: 451 }) }));
  });
});

describe('cookieHeader', () => {
  const FILE = [
    '# Netscape HTTP Cookie File',
    '.facebook.com\tTRUE\t/\tTRUE\t1800000000\tc_user\t42',
    '#HttpOnly_.facebook.com\tTRUE\t/\tTRUE\t1800000000\txs\tsecret',
    '.instagram.com\tTRUE\t/\tTRUE\t1800000000\tsessionid\tinsta',
    ''
  ].join('\r\n');

  it('sends only the cookies of the requested site', () => {
    expect(facebookStory.cookieHeader(FILE, 'www.facebook.com')).toBe('c_user=42; xs=secret');
    expect(facebookStory.cookieHeader(FILE, 'example.com')).toBe('');
  });
});

describe('resolve', () => {
  it('asks for a login when there is no cookies file', async () => {
    await expect(facebookStory.resolve(STORY_URL, { cookiesFile: null }))
      .rejects.toMatchObject({ response: { status: 451 } });
  });

  it('fetches the page with the login cookies and parses it', async () => {
    const calls = [];
    const fetchImpl = async (url, options) => {
      calls.push({ url, options });
      return { ok: true, url, text: async () => PAGE };
    };
    const info = await facebookStory.resolve(STORY_URL, {
      cookiesText: '.facebook.com\tTRUE\t/\tTRUE\t1800000000\tc_user\t42',
      fetchImpl
    });
    expect(info.formats).toHaveLength(2);
    expect(calls[0].options.headers.Cookie).toBe('c_user=42');
  });

  it('treats a redirect to the login page as an expired login', async () => {
    const fetchImpl = async () => ({ ok: true, url: 'https://www.facebook.com/login.php?next=x', text: async () => PAGE });
    await expect(facebookStory.resolve(STORY_URL, { cookiesText: 'x', fetchImpl }))
      .rejects.toMatchObject({ response: { status: 451 } });
  });
});
