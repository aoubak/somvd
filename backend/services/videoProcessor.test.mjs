import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

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
