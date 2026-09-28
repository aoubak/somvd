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
