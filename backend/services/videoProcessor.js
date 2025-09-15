const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

class VideoProcessor {
  constructor() {
    this.supportedPlatforms = {
      youtube: {
        name: 'YouTube',
        patterns: [
          /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
          /youtube\.com\/shorts\/([^&\n?#]+)/
        ],
        icon: '🎥'
      },
      tiktok: {
        name: 'TikTok',
        patterns: [
          /(?:tiktok\.com\/@[\w.-]+\/video\/|vm\.tiktok\.com\/|tiktok\.com\/t\/)(\w+)/,
          /tiktok\.com\/.*\/video\/(\d+)/
        ],
        icon: '🎵'
      },
      instagram: {
        name: 'Instagram',
        patterns: [
          /(?:instagram\.com\/(?:p|reel|tv)\/)([\w-]+)/,
          /instagram\.com\/stories\/[\w.-]+\/(\d+)/
        ],
        icon: '📸'
      },
      facebook: {
        name: 'Facebook',
        patterns: [
          /(?:facebook\.com\/.*\/videos\/|fb\.watch\/)(\d+)/,
          /facebook\.com\/watch\/\?v=(\d+)/,
          /facebook\.com\/share\/v\/([A-Za-z0-9._-]+)/
        ],
        icon: '👥'
      },
      twitter: {
        name: 'Twitter',
        patterns: [
          /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/
        ],
        icon: '🐦'
      }
    };

    this.tempDir = path.join(__dirname, '..', 'temp');
    this.downloadsDir = path.join(__dirname, '..', 'downloads');
  }

  // Detect platform from URL
  detectPlatform(url) {
    for (const [key, platform] of Object.entries(this.supportedPlatforms)) {
      for (const pattern of platform.patterns) {
        if (pattern.test(url)) {
          return { key, ...platform };
        }
      }
    }
    return null;
  }

  // Validate URL
  validateUrl(url) {
    try {
      new URL(url);
      return this.detectPlatform(url) !== null;
    } catch {
      return false;
    }
  }

  // Get video information using yt-dlp
  async getVideoInfo(url) {
    return new Promise((resolve, reject) => {
      const platform = this.detectPlatform(url);
      if (!platform) {
        return reject(new Error('Unsupported platform'));
      }

      // yt-dlp command to get video info
      const ytdlp = spawn('python', [
        '-m', 'yt_dlp',
        '--dump-json',
        '--no-download',
        '--no-warnings',
        url
      ]);

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
      thumbnail: rawData.thumbnail || this.getDefaultThumbnail(platform.key),
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

    // Sort formats by quality (best first)
    const sortedFormats = rawFormats.sort((a, b) => {
      const aHeight = a.height || 0;
      const bHeight = b.height || 0;
      return bHeight - aHeight;
    });

    // Process video formats - prioritize combined audio+video formats
    for (const format of sortedFormats) {
      if (format.vcodec && format.vcodec !== 'none' && format.height) {
        const height = format.height;
        const quality = this.getQualityLabel(height);
        
        if (quality && !seenQualities.has(quality)) {
          seenQualities.add(quality);
          
          // Prefer mp4, but accept other formats
          const ext = format.ext || 'mp4';
          
          // Check if this format has both video and audio
          const hasAudio = format.acodec && format.acodec !== 'none';
          
          processedFormats.push({
            id: `mp4_${quality}`,
            label: `MP4 ${quality}${hasAudio ? ' (with audio)' : ''}`,
            quality: quality,
            size: this.estimateFileSize(format.filesize, format.duration),
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

    // Add audio format - look for any audio format
    const audioFormats = sortedFormats.filter(f => 
      f.acodec && f.acodec !== 'none' && f.acodec !== 'none'
    );

    if (audioFormats.length > 0) {
      // Prefer mp3, but accept m4a or other audio formats
      const audioFormat = audioFormats.find(f => f.ext === 'mp3') || audioFormats[0];
      
      processedFormats.push({
        id: 'mp3_128k',
        label: 'MP3 Audio',
        quality: '128kbps',
        size: this.estimateFileSize(audioFormat.filesize, audioFormat.duration, true),
        formatId: audioFormat.format_id,
        ext: 'mp3',
        type: 'audio'
      });
    }

    return processedFormats.length > 0 ? processedFormats : this.getDefaultFormats();
  }

  // Get quality label from height
  getQualityLabel(height) {
    if (!height) return null;
    if (height >= 2160) return '4K';
    if (height >= 1440) return '1440p';
    if (height >= 1080) return '1080p';
    if (height >= 720) return '720p';
    if (height >= 480) return '480p';
    if (height >= 360) return '360p';
    if (height >= 240) return '240p';
    return null;
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

  // Get default thumbnail
  getDefaultThumbnail(platformKey) {
    const colors = {
      youtube: 'ff0000',
      tiktok: '000000',
      instagram: 'e4405f',
      facebook: '1877f2',
      twitter: '1da1f2'
    };
    
    const color = colors[platformKey] || '3b82f6';
    return `https://via.placeholder.com/480x270/${color}/ffffff?text=${platformKey.toUpperCase()}`;
  }

  // Get default formats if extraction fails
  getDefaultFormats() {
    return [
      { id: 'mp4_720p', label: 'MP4 720p', quality: '720p', size: 'Unknown', type: 'video' },
      { id: 'mp4_480p', label: 'MP4 480p', quality: '480p', size: 'Unknown', type: 'video' },
      { id: 'mp3_128k', label: 'MP3 Audio', quality: '128kbps', size: 'Unknown', type: 'audio' }
    ];
  }

  // Download video
  async downloadVideo(videoInfo, formatId) {
    return new Promise((resolve, reject) => {
      const format = videoInfo.formats.find(f => f.id === formatId);
      if (!format) {
        return reject(new Error('Format not found'));
      }

      const filename = `${videoInfo.id}_${this.sanitizeTitle(videoInfo.title)}.%(ext)s`;
      const outputPath = path.join(this.downloadsDir, filename);

      console.log(`🎬 Starting download: ${filename}`);
      console.log(`📁 Output path: ${outputPath}`);
      console.log(`🔗 Video URL: ${videoInfo.originalUrl}`);

      // yt-dlp download command with better arguments
      const args = [
        '--no-warnings',
        '--no-playlist',
        '--output', outputPath,
        videoInfo.originalUrl
      ];

      // Add format selector based on type
      if (format.type === 'audio') {
        args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
      } else {
        // Prefer combined audio+video to avoid requiring ffmpeg
        const qualityToHeight = {
          '4K': 2160,
          '1440p': 1440,
          '1080p': 1080,
          '720p': 720,
          '480p': 480,
          '360p': 360,
          '240p': 240
        };

        const targetHeight = qualityToHeight[format.quality] || null;

        // Facebook often needs a single progressive format; ignore height if necessary
        const isFacebook = (videoInfo.platform || '').toLowerCase() === 'facebook';

        if (format.hasAudio && format.formatId) {
          args.push('-f', format.formatId);
        } else {
          // Build a safe selector that prefers combined A+V, falling back to any best
          let selector = 'best[acodec!=none][vcodec!=none]';
          if (targetHeight && !isFacebook) {
            selector = `best[height<=${targetHeight}][acodec!=none][vcodec!=none]/` + selector;
          }
          selector = selector + '/best';
          args.push('-f', selector);
        }
      }

      console.log(`🔧 yt-dlp args:`, args);

      const ytdlp = spawn('python', ['-m', 'yt_dlp', ...args]);

      let stdout = '';
      let stderr = '';

      ytdlp.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log('yt-dlp stdout:', data.toString());
      });

      ytdlp.stderr.on('data', (data) => {
        stderr += data.toString();
        console.log('yt-dlp stderr:', data.toString());
      });

      ytdlp.on('close', async (code) => {
        console.log(`yt-dlp process exited with code: ${code}`);
        
        if (code !== 0) {
          console.error('Download error:', stderr);
          return reject(new Error(`Download failed: ${stderr}`));
        }

        try {
          // Since we used %(ext)s template, yt-dlp will have created the file with actual extension
          // We need to find the actual file that was created
          const baseFilename = `${videoInfo.id}_${this.sanitizeTitle(videoInfo.title)}`;
          const downloadsDir = this.downloadsDir;
          
          // List files in downloads directory to find the actual downloaded media file
          const files = await fs.readdir(downloadsDir);
          const mediaCandidates = files.filter(file =>
            file.startsWith(baseFilename) && /\.(mp4|webm|mkv|m4a|mp3)$/i.test(file)
          );
          
          if (mediaCandidates.length === 0) {
            console.error('No media file found. Available files:', files);
            return reject(new Error('Downloaded media file not found'));
          }
          
          // Prefer MP4 if available, otherwise take the first candidate
          const downloadedFile = mediaCandidates.find(f => f.toLowerCase().endsWith('.mp4')) || mediaCandidates[0];
          
          const finalPath = path.join(downloadsDir, downloadedFile);
          const stats = await fs.stat(finalPath);
          
          console.log(`✅ Download completed: ${finalPath} (${stats.size} bytes)`);
          
          resolve({
            success: true,
            filename: downloadedFile,
            path: finalPath,
            size: this.formatFileSize(stats.size),
            downloadUrl: `/downloads/${downloadedFile}`
          });
        } catch (error) {
          console.error('File verification error:', error);
          reject(new Error('Failed to verify download'));
        }
      });

      ytdlp.on('error', (error) => {
        console.error('Download spawn error:', error);
        reject(new Error('Download tool not available'));
      });
    });
  }

  // Clean up old files
  async cleanupOldFiles(maxAgeHours = 24) {
    try {
      const files = await fs.readdir(this.downloadsDir);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(this.downloadsDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.remove(filePath);
          console.log(`Cleaned up old file: ${file}`);
        }
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

module.exports = new VideoProcessor();
