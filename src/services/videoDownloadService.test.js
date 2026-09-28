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
