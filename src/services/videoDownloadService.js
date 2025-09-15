// Video Download Service - Handles actual video downloading functionality
class VideoDownloadService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
    this.supportedPlatforms = [];
    this.loadSupportedPlatforms();
  }

  // Load supported platforms from backend
  async loadSupportedPlatforms() {
    try {
      const response = await fetch(`${this.baseURL}/video/platforms`);
      if (response.ok) {
        const data = await response.json();
        this.supportedPlatforms = data.data || [];
      }
    } catch (error) {
      console.warn('Failed to load supported platforms from backend, using defaults');
      this.supportedPlatforms = [
        { name: 'YouTube', icon: '🎥' },
        { name: 'TikTok', icon: '🎵' },
        { name: 'Instagram', icon: '📸' },
        { name: 'Facebook', icon: '👥' },
        { name: 'Twitter', icon: '🐦' }
      ];
    }
  }

  // Detect platform from URL (simplified - backend will do the heavy lifting)
  detectPlatform(url) {
    if (!url) return null;
    
    // Basic platform detection for UI feedback
    if (/youtube\.com|youtu\.be/i.test(url)) {
      return { name: 'YouTube', icon: '🎥' };
    }
    if (/tiktok\.com/i.test(url)) {
      return { name: 'TikTok', icon: '🎵' };
    }
    if (/instagram\.com/i.test(url)) {
      return { name: 'Instagram', icon: '📸' };
    }
    if (/facebook\.com|fb\.watch/i.test(url)) {
      return { name: 'Facebook', icon: '👥' };
    }
    if (/twitter\.com|x\.com/i.test(url)) {
      return { name: 'Twitter', icon: '🐦' };
    }
    
    return null;
  }

  // Validate URL format (basic validation - backend will do thorough validation)
  validateUrl(url) {
    try {
      new URL(url);
      return this.detectPlatform(url) !== null;
    } catch {
      return false;
    }
  }

  // Extract video ID from URL
  extractVideoId(url, platform) {
    const match = url.match(platform.pattern);
    return match ? match[1] : null;
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

  // Download video using backend
  async downloadVideo(videoInfo, formatId) {
    try {
      const response = await fetch(`${this.baseURL}/video/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: videoInfo.id,
          formatId: formatId,
          videoInfo: videoInfo
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Download failed');
      }

      // Trigger actual download - use the correct download endpoint
      const downloadUrl = `${this.baseURL.replace('/api', '')}/downloads/${data.data.filename}`;
      console.log(`🔗 Download URL: ${downloadUrl}`);
      console.log(`📁 Filename: ${data.data.filename}`);
      
      // Small delay to ensure file is fully written
      setTimeout(() => {
        this.triggerDownload(downloadUrl, data.data.filename);
      }, 1000);

      return data.data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to download service. Please check if the backend is running.');
      }
      throw error;
    }
  }

  // Stream video directly (no disk) via backend streaming endpoint
  async streamVideo(videoInfo, formatId) {
    try {
      // Derive quality from formatId like "mp4_720p"
      let quality = 'best';
      if (typeof formatId === 'string') {
        const m = formatId.match(/_(\d+p)$/i);
        if (m && m[1]) quality = m[1].toLowerCase();
      }

      // Build stream URL
      const streamUrl = `${this.baseURL}/video/stream?url=${encodeURIComponent(videoInfo.originalUrl)}&quality=${encodeURIComponent(quality)}`;

      // Trigger browser download; filename will be set by Content-Disposition
      this.triggerDownload(streamUrl, `${videoInfo.title || 'video'}.mp4`);

      return { success: true };
    } catch (error) {
      throw new Error('Unable to start streaming download.');
    }
  }

  // Generate mock data helpers
  generateMockTitle(platform) {
    const titles = {
      YouTube: [
        'Amazing Tutorial - Learn Something New',
        'Funny Cat Compilation 2024',
        'Top 10 Programming Tips',
        'Beautiful Nature Documentary',
        'Music Video - Latest Hit Song'
      ],
      TikTok: [
        'Viral Dance Challenge',
        'Quick Life Hack',
        'Funny Pet Video',
        'Cooking Recipe in 60 Seconds',
        'Amazing Art Creation'
      ],
      Instagram: [
        'Behind the Scenes Content',
        'Travel Adventure Reel',
        'Fashion Outfit Ideas',
        'Workout Routine',
        'Food Photography'
      ],
      Facebook: [
        'Family Memories Video',
        'Event Highlights',
        'Product Demonstration',
        'Live Stream Recording',
        'Community Update'
      ],
      Twitter: [
        'Breaking News Clip',
        'Sports Highlight',
        'Political Commentary',
        'Tech Announcement',
        'Viral Moment'
      ]
    };

    const platformTitles = titles[platform] || titles.YouTube;
    return platformTitles[Math.floor(Math.random() * platformTitles.length)];
  }

  generateMockDuration() {
    const durations = ['0:30', '1:15', '2:45', '3:20', '5:10', '7:30', '10:15'];
    return durations[Math.floor(Math.random() * durations.length)];
  }

  generateMockThumbnail(platformKey) {
    const colors = ['3b82f6', 'ef4444', '10b981', 'f59e0b', '8b5cf6', 'ec4899'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return `https://via.placeholder.com/480x270/${color}/ffffff?text=${platformKey.toUpperCase()}+Video`;
  }

  generateMockFormats(platformKey) {
    const baseFormats = [
      { id: 'mp4_360p', label: 'MP4 360p', quality: '360p', size: '15 MB' },
      { id: 'mp4_720p', label: 'MP4 720p', quality: '720p', size: '45 MB' },
      { id: 'mp4_1080p', label: 'MP4 1080p', quality: '1080p', size: '120 MB' },
      { id: 'mp3_128k', label: 'MP3 Audio', quality: '128kbps', size: '8 MB' }
    ];

    // Some platforms might not support all formats
    if (platformKey === 'tiktok') {
      return baseFormats.filter(f => !f.id.includes('1080p'));
    }

    return baseFormats;
  }

  generateDownloadUrl(videoInfo, format) {
    // In a real implementation, this would be a real download URL from your backend
    return `https://api.somvd.com/download/${videoInfo.id}/${format}`;
  }

  // Trigger file download in browser
  triggerDownload(url, filename) {
    try {
      console.log(`🎬 Triggering download: ${url}`);
      
      // Create download link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      
      // Add to DOM temporarily
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      
      console.log(`✅ Download triggered: ${filename}`);
    } catch (error) {
      console.error('Download trigger error:', error);
      
      // Fallback: open in new tab
      window.open(url, '_blank');
    }
  }

  // Utility function for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get supported platforms list
  getSupportedPlatforms() {
    return Object.values(this.supportedPlatforms);
  }
}

// Export singleton instance
export default new VideoDownloadService();
