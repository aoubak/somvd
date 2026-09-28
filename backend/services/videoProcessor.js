const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

// Heights offered to users, best first; `${height}p` is also the /stream quality value
const QUALITY_HEIGHTS = [2160, 1440, 1080, 720, 480, 360, 240];

class VideoProcessor {
  constructor() {
    // Values accepted by GET /stream?quality=
    this.streamQualities = [...QUALITY_HEIGHTS.map(h => `${h}p`), 'best', 'audio'];

    // `hosts` is checked against the parsed hostname (subdomains allowed) before any pattern runs
    this.supportedPlatforms = {
      youtube: {
        name: 'YouTube',
        hosts: ['youtube.com', 'youtu.be'],
        patterns: [
          /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
          /youtube\.com\/shorts\/([^&\n?#]+)/
        ],
        icon: '🎥'
      },
      tiktok: {
        name: 'TikTok',
        hosts: ['tiktok.com'],
        patterns: [
          /(?:tiktok\.com\/@[\w.-]+\/video\/|vm\.tiktok\.com\/|tiktok\.com\/t\/)(\w+)/,
          /tiktok\.com\/.*\/video\/(\d+)/
        ],
        icon: '🎵'
      },
      instagram: {
        name: 'Instagram',
        hosts: ['instagram.com'],
        patterns: [
          /(?:instagram\.com\/(?:p|reel|tv)\/)([\w-]+)/,
          /instagram\.com\/stories\/[\w.-]+\/(\d+)/
        ],
        icon: '📸'
      },
      facebook: {
        name: 'Facebook',
        hosts: ['facebook.com', 'fb.watch'],
        patterns: [
          /(?:facebook\.com\/.*\/videos\/|fb\.watch\/)(\d+)/,
          /facebook\.com\/watch\/\?v=(\d+)/,
          /(?:facebook\.com|m\.facebook\.com)\/reel\/([A-Za-z0-9._-]+)/,
          /(?:facebook\.com|m\.facebook\.com)\/reels\/([A-Za-z0-9._-]+)/,
          /(?:facebook\.com|m\.facebook\.com)\/share\/r\/([A-Za-z0-9._-]+)/,
          /facebook\.com\/share\/v\/([A-Za-z0-9._-]+)/
        ],
        icon: '👥'
      },
      twitter: {
        name: 'Twitter',
        hosts: ['twitter.com', 'x.com'],
        patterns: [
          /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/
        ],
        icon: '🐦'
      }
    };
  }

  // Detect platform from URL; the hostname must belong to the platform, not just appear in the URL
  detectPlatform(url) {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return null;
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;

    const hostname = parsed.hostname.toLowerCase();
    for (const [key, platform] of Object.entries(this.supportedPlatforms)) {
      const hostMatches = platform.hosts.some(h => hostname === h || hostname.endsWith(`.${h}`));
      if (hostMatches && platform.patterns.some(pattern => pattern.test(url))) {
        return { key, ...platform };
      }
    }
    return null;
  }

  // Validate URL
  validateUrl(url) {
    return this.detectPlatform(url) !== null;
  }

  // Every yt-dlp call starts here. Current yt-dlp needs a JavaScript runtime for full YouTube
  // support; set YTDLP_JS_RUNTIMES=off for yt-dlp versions older than 2025.11.
  ytdlpArgs(...args) {
    const runtimes = process.env.YTDLP_JS_RUNTIMES ?? 'node';
    const base = ['-m', 'yt_dlp'];
    if (runtimes && runtimes !== 'off') base.push('--js-runtimes', runtimes);
    return [...base, ...args];
  }

  // Formats we can proxy byte-for-byte (not HLS/DASH manifests)
  isDirectFormat(f) {
    return Boolean(f && f.url) && (!f.protocol || f.protocol === 'https' || f.protocol === 'http');
  }

  // Turn yt-dlp's stderr into a status and a sentence users can read (raw output stays in the logs)
  describeYtdlpError(stderr = '') {
    if (/Requested format is not available/i.test(stderr)) {
      return { status: 422, error: 'Format not available', message: 'No matching stream is available at the requested quality.' };
    }
    if (/Login required|private video|This video is private|Sign in/i.test(stderr)) {
      return { status: 451, error: 'Unavailable', message: 'This video is private or requires login.' };
    }
    if (/not available|unavailable|removed/i.test(stderr)) {
      return { status: 404, error: 'Not found', message: 'The video is unavailable or was removed.' };
    }
    return { status: 502, error: 'Upstream error', message: "We couldn't get this video from the platform right now. Please try again in a moment." };
  }

  // Same for failures while proxying the media bytes from the platform
  describeUpstreamError(error) {
    if (/timeout/i.test(error?.message || '')) {
      return { status: 504, error: 'Upstream timeout', message: 'The video source took too long to respond. Please try again.' };
    }
    return { status: 502, error: 'Upstream fetch failed', message: "Couldn't reach the video source. Please try again." };
  }

  // Best audio-only format that can be proxied directly; prefers m4a, then highest bitrate
  pickAudioFormat(formats) {
    const audioOnly = (formats || []).filter(f => (
      this.isDirectFormat(f) &&
      f.acodec && f.acodec !== 'none' &&
      f.vcodec === 'none'
    ));
    audioOnly.sort((a, b) => {
      const am4a = a.ext === 'm4a' ? 1 : 0;
      const bm4a = b.ext === 'm4a' ? 1 : 0;
      if (bm4a !== am4a) return bm4a - am4a;
      return (b.abr || 0) - (a.abr || 0);
    });
    return audioOnly[0] || null;
  }

  // Get video information using yt-dlp
  async getVideoInfo(url) {
    return new Promise((resolve, reject) => {
      const platform = this.detectPlatform(url);
      if (!platform) {
        return reject(new Error('Unsupported platform'));
      }

      // yt-dlp command to get video info
      const ytdlp = spawn('python', this.ytdlpArgs('--dump-json', '--no-download', '--no-warnings', url));

      let stdout = '';
      let stderr = '';

      ytdlp.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      ytdlp.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ytdlp.on('close', (code) => {
        if (code !== 0) {
          console.error('yt-dlp error:', stderr);
          return reject(new Error('Failed to get video information'));
        }

        try {
          const videoData = JSON.parse(stdout);
          const processedInfo = this.processVideoInfo(videoData, platform);
          resolve(processedInfo);
        } catch (error) {
          console.error('JSON parse error:', error);
          reject(new Error('Failed to parse video information'));
        }
      });

      ytdlp.on('error', (error) => {
        console.error('yt-dlp spawn error:', error);
        reject(new Error('Video processing tool not available'));
      });
    });
  }

  // Process raw video info from yt-dlp
  processVideoInfo(rawData, platform) {
    const videoId = uuidv4();
    
    // Extract available formats
    const formats = this.extractFormats(rawData.formats || []);
    
    return {
      id: videoId,
      originalId: rawData.id,
      title: this.sanitizeTitle(rawData.title || 'Unknown Title'),
      platform: platform.name,
      duration: this.formatDuration(rawData.duration),
      thumbnail: rawData.thumbnail || null,
      uploader: rawData.uploader || 'Unknown',
      uploadDate: rawData.upload_date || null,
      viewCount: rawData.view_count || 0,
      formats: formats,
      originalUrl: rawData.webpage_url || rawData.original_url,
      description: rawData.description ? rawData.description.substring(0, 500) : null
    };
  }

  // Extract and process available formats
  extractFormats(rawFormats) {
    const processedFormats = [];
    const seenQualities = new Set();

    // Sort formats by quality (best first); within a height, formats that report a size come first
    const bytesOf = (f) => f.filesize || f.filesize_approx || 0;
    const sortedFormats = rawFormats.sort((a, b) => {
      const aHeight = a.height || 0;
      const bHeight = b.height || 0;
      if (bHeight !== aHeight) return bHeight - aHeight;
      return (bytesOf(b) ? 1 : 0) - (bytesOf(a) ? 1 : 0);
    });

    // Offer audio only when /stream can serve the same audio-only format
    const audioFormat = this.pickAudioFormat(sortedFormats);
    const audioBytes = audioFormat ? bytesOf(audioFormat) : 0;

    // Process video formats - prioritize combined audio+video formats
    for (const format of sortedFormats) {
      if (format.vcodec && format.vcodec !== 'none' && format.height) {
        const height = format.height;
        const quality = this.getQuality(height);

        if (quality && !seenQualities.has(quality)) {
          seenQualities.add(quality);

          // Prefer mp4, but accept other formats
          const ext = format.ext || 'mp4';

          // Check if this format has both video and audio
          const hasAudio = format.acodec && format.acodec !== 'none';

          // Video-only formats get merged with the audio track, so count both
          const videoBytes = bytesOf(format);
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
        }
      }
    }

    if (audioFormat) {
      const ext = audioFormat.ext || 'm4a';

      processedFormats.push({
        id: `audio_${ext}`,
        label: `Audio (${ext.toUpperCase()})`,
        quality: 'audio',
        size: this.estimateFileSize(audioBytes || null, audioFormat.duration, true),
        formatId: audioFormat.format_id,
        ext: ext,
        type: 'audio'
      });
    }

    return processedFormats.length > 0 ? processedFormats : this.getDefaultFormats();
  }

  // Map a height to the nearest offered quality at or below it, e.g. 1088 -> '1080p'
  getQuality(height) {
    if (!height) return null;
    const bucket = QUALITY_HEIGHTS.find(h => height >= h);
    return bucket ? `${bucket}p` : null;
  }

  // Display label for a quality value
  getQualityLabel(quality) {
    return quality === '2160p' ? '4K' : quality;
  }

  // Estimate file size
  estimateFileSize(filesize, duration, isAudio = false) {
    if (filesize) {
      return this.formatFileSize(filesize);
    }
    
    // Rough estimation based on duration
    if (duration) {
      const bitrate = isAudio ? 128000 : 1000000; // 128kbps for audio, 1Mbps for video
      const estimatedSize = (duration * bitrate) / 8;
      return this.formatFileSize(estimatedSize);
    }
    
    return 'Unknown';
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Format duration
  formatDuration(seconds) {
    if (!seconds) return 'Unknown';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  // Sanitize title for filename
  sanitizeTitle(title) {
    return title
      .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
      .substring(0, 100); // Limit length
  }

  // Fallback when yt-dlp reports no usable video heights: let /stream pick the best it can
  getDefaultFormats() {
    return [
      { id: 'mp4_best', label: 'Best available', quality: 'best', size: 'Unknown', type: 'video' }
    ];
  }
}

module.exports = new VideoProcessor();
