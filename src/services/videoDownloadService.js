// Video Download Service - talks to the SOMVD backend

// Shown until the backend's /video/platforms list arrives. `hosts` drives URL detection
// by hostname (subdomains allowed), so lookalikes such as netflix.com don't match x.com.
const PLATFORMS = [
  { name: 'YouTube', icon: '🎥', hosts: ['youtube.com', 'youtu.be'] },
  { name: 'TikTok', icon: '🎵', hosts: ['tiktok.com'] },
  { name: 'Instagram', icon: '📸', hosts: ['instagram.com'] },
  { name: 'Facebook', icon: '👥', hosts: ['facebook.com', 'fb.watch'] },
  { name: 'Twitter', icon: '🐦', hosts: ['twitter.com', 'x.com'] }
];

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

  // Get video information from backend
  async getVideoInfo(url) {
    try {
      const response = await fetch(`${this.baseURL}/video/info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to get video information');
      }

      return data.data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to video processing service. Please check if the backend is running.');
      }
      throw error;
    }
  }

  // Stream video directly (no disk) via backend streaming endpoint.
  // `format` is one of videoInfo.formats; its `quality` is the value /stream expects.
  streamVideo(videoInfo, format) {
    const quality = format?.quality || 'best';
    const streamUrl = `${this.baseURL}/video/stream?url=${encodeURIComponent(videoInfo.originalUrl)}&quality=${encodeURIComponent(quality)}`;

    // Trigger browser download; filename will be set by Content-Disposition
    this.triggerDownload(streamUrl, `${videoInfo.title || 'video'}.${format?.ext || 'mp4'}`);
  }

  // Trigger file download in browser
  triggerDownload(url, filename) {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download trigger error:', error);

      // Fallback: open in new tab
      window.open(url, '_blank');
    }
  }

  // Default platform list, used until the backend responds
  getSupportedPlatforms() {
    return PLATFORMS.map(({ name, icon }) => ({ name, icon }));
  }
}

// Export singleton instance
export default new VideoDownloadService();
