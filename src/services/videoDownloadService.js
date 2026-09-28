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
