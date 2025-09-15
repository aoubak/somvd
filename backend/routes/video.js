const express = require('express');
const { spawn } = require('child_process');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const { body, query, validationResult } = require('express-validator');
const videoProcessor = require('../services/videoProcessor');
const path = require('path');
const fs = require('fs-extra');

const router = express.Router();

// Validation middleware
const validateUrl = [
  body('url')
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Please provide a valid URL')
    .isLength({ min: 10, max: 2000 })
    .withMessage('URL must be between 10 and 2000 characters')
];

const validateDownload = [
  body('videoId')
    .isUUID()
    .withMessage('Invalid video ID'),
  body('formatId')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Invalid format ID')
];

// Error handler for validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Validation for streaming endpoint (query params)
const validateStream = [
  query('url')
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Please provide a valid URL')
    .isLength({ min: 10, max: 2000 })
    .withMessage('URL must be between 10 and 2000 characters'),
  query('quality')
    .optional()
    .isIn(['360p', '480p', '720p', '1080p', 'best'])
    .withMessage('Quality must be one of 360p, 480p, 720p, 1080p, best')
];

// GET /api/video/health - Health check for video service
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Video processing service is running',
    supportedPlatforms: Object.keys(videoProcessor.supportedPlatforms),
    timestamp: new Date().toISOString()
  });
});

// POST /api/video/info - Get video information
router.post('/info', validateUrl, handleValidationErrors, async (req, res) => {
  try {
    const { url } = req.body;
    
    console.log(`📥 Video info request for: ${url}`);
    
    // Validate URL format and platform support
    if (!videoProcessor.validateUrl(url)) {
      return res.status(400).json({
        error: 'Unsupported URL',
        message: 'The provided URL is not from a supported platform',
        supportedPlatforms: Object.values(videoProcessor.supportedPlatforms).map(p => p.name)
      });
    }

    // Get video information
    const videoInfo = await videoProcessor.getVideoInfo(url);
    
    console.log(`✅ Video info retrieved: ${videoInfo.title}`);
    
    res.json({
      success: true,
      data: videoInfo,
      message: 'Video information retrieved successfully'
    });

  } catch (error) {
    console.error('Video info error:', error);
    
    // Handle specific error types
    if (error.message.includes('Video processing tool not available')) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Video processing service is temporarily unavailable. Please try again later.'
      });
    }
    
    if (error.message.includes('Failed to get video information')) {
      return res.status(404).json({
        error: 'Video not found',
        message: 'Unable to retrieve video information. The video may be private, deleted, or unavailable.'
      });
    }
    
    res.status(500).json({
      error: 'Processing failed',
      message: 'Failed to process video information. Please try again.'
    });
  }
});

// POST /api/video/download - Download video
router.post('/download', validateDownload, handleValidationErrors, async (req, res) => {
  try {
    const { videoId, formatId, videoInfo } = req.body;
    
    console.log(`📥 Download request - Video: ${videoId}, Format: ${formatId}`);
    
    // Validate video info is provided
    if (!videoInfo) {
      return res.status(400).json({
        error: 'Missing video information',
        message: 'Video information is required for download'
      });
    }
    
    // Validate format exists
    const format = videoInfo.formats.find(f => f.id === formatId);
    if (!format) {
      return res.status(400).json({
        error: 'Invalid format',
        message: 'The requested format is not available for this video'
      });
    }
    
    // Start download process
    const downloadResult = await videoProcessor.downloadVideo(videoInfo, formatId);
    
    console.log(`✅ Download completed: ${downloadResult.filename}`);
    
    res.json({
      success: true,
      data: downloadResult,
      message: 'Video downloaded successfully'
    });

  } catch (error) {
    console.error('Download error:', error);
    
    if (error.message.includes('Download tool not available')) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Download service is temporarily unavailable. Please try again later.'
      });
    }
    
    if (error.message.includes('Download failed')) {
      return res.status(422).json({
        error: 'Download failed',
        message: 'Unable to download the video. It may be protected or unavailable.'
      });
    }
    
    res.status(500).json({
      error: 'Download failed',
      message: 'An error occurred during download. Please try again.'
    });
  }
});

// GET /api/video/download/:filename - Serve downloaded file
router.get('/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Sanitize filename to prevent directory traversal
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(__dirname, '..', 'downloads', sanitizedFilename);
    
    // Check if file exists
    const exists = await fs.pathExists(filePath);
    if (!exists) {
      return res.status(404).json({
        error: 'File not found',
        message: 'The requested file does not exist or has been removed'
      });
    }
    
    // Get file stats
    const stats = await fs.stat(filePath);
    const fileSize = stats.size;
    
    // Set appropriate headers
    const ext = path.extname(sanitizedFilename).toLowerCase();
    const mimeTypes = {
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
      '.webm': 'video/webm',
      '.m4a': 'audio/mp4'
    };
    
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFilename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    console.log(`📤 File served: ${sanitizedFilename} (${fileSize} bytes)`);
    
  } catch (error) {
    console.error('File serve error:', error);
    res.status(500).json({
      error: 'File access failed',
      message: 'Unable to access the requested file'
    });
  }
});

// GET /api/video/platforms - Get supported platforms
router.get('/platforms', (req, res) => {
  const platforms = Object.values(videoProcessor.supportedPlatforms).map(platform => ({
    name: platform.name,
    icon: platform.icon
  }));
  
  res.json({
    success: true,
    data: platforms,
    count: platforms.length
  });
});

// DELETE /api/video/cleanup - Clean up old files (admin endpoint)
router.delete('/cleanup', async (req, res) => {
  try {
    const maxAgeHours = req.query.maxAge ? parseInt(req.query.maxAge) : 24;
    
    if (maxAgeHours < 1 || maxAgeHours > 168) { // 1 hour to 1 week
      return res.status(400).json({
        error: 'Invalid max age',
        message: 'Max age must be between 1 and 168 hours'
      });
    }
    
    await videoProcessor.cleanupOldFiles(maxAgeHours);
    
    res.json({
      success: true,
      message: `Cleanup completed for files older than ${maxAgeHours} hours`
    });
    
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      error: 'Cleanup failed',
      message: 'Unable to perform cleanup operation'
    });
  }
});

// GET /api/video/stats - Get service statistics
router.get('/stats', async (req, res) => {
  try {
    const downloadsDir = path.join(__dirname, '..', 'downloads');
    const files = await fs.readdir(downloadsDir);
    
    let totalSize = 0;
    let fileCount = 0;
    
    for (const file of files) {
      const filePath = path.join(downloadsDir, file);
      const stats = await fs.stat(filePath);
      totalSize += stats.size;
      fileCount++;
    }
    
    res.json({
      success: true,
      data: {
        totalFiles: fileCount,
        totalSize: videoProcessor.formatFileSize ? videoProcessor.formatFileSize(totalSize) : `${totalSize} bytes`,
        supportedPlatforms: Object.keys(videoProcessor.supportedPlatforms).length,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      }
    });
    
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      error: 'Stats unavailable',
      message: 'Unable to retrieve service statistics'
    });
  }
});

// GET /api/video/stream - Stream media without saving to disk
router.get('/stream', validateStream, handleValidationErrors, async (req, res) => {
  try {
    const { url } = req.query;
    const quality = (req.query.quality || 'best').toLowerCase();

    // Validate supported platform
    if (!videoProcessor.validateUrl(url)) {
      return res.status(400).json({
        error: 'Unsupported URL',
        message: 'The provided URL is not from a supported platform'
      });
    }

    // Resolve media info via yt-dlp (no download)
    const ytdlp = spawn('python', [
      '-m', 'yt_dlp',
      '--dump-json',
      '--no-download',
      '--no-warnings',
      url
    ]);

    let stdout = '';
    let stderr = '';

    ytdlp.stdout.on('data', (d) => { stdout += d.toString(); });
    ytdlp.stderr.on('data', (d) => { stderr += d.toString(); });

    ytdlp.on('close', () => {
      try {
        if (!stdout) {
          // Map common yt-dlp errors
          const msg = (stderr || '').toString();
          if (/Requested format is not available/i.test(msg)) {
            return res.status(422).json({ error: 'Format not available', message: 'No matching stream available at the requested quality.' });
          }
          if (/Login required|private video|This video is private/i.test(msg)) {
            return res.status(451).json({ error: 'Unavailable', message: 'This video is private or requires login.' });
          }
          if (/not available|Video unavailable|removed/i.test(msg)) {
            return res.status(404).json({ error: 'Not found', message: 'The video is unavailable or was removed.' });
          }
          return res.status(502).json({ error: 'Upstream error', message: msg || 'Failed to retrieve media info' });
        }

        const info = JSON.parse(stdout);
        const formats = Array.isArray(info.formats) ? info.formats : [];

        // Helper: map quality to numeric height
        const qToH = { '360p': 360, '480p': 480, '720p': 720, '1080p': 1080 };
        const targetH = qToH[quality] || null;

        // Filter progressive A+V formats (have both audio and video)
        const progressive = formats.filter(f => (
          (f.acodec && f.acodec !== 'none') && (f.vcodec && f.vcodec !== 'none') && f.url
        ));

        // Prefer mp4, then others; apply height constraint if provided
        const candidates = progressive
          .filter(f => (targetH ? (f.height ? f.height <= targetH : true) : true))
          .sort((a, b) => {
            // Sort by height desc, prefer mp4, then filesize desc if available
            const ah = a.height || 0, bh = b.height || 0;
            if (bh !== ah) return bh - ah;
            const amp4 = (a.ext === 'mp4') ? 1 : 0;
            const bmp4 = (b.ext === 'mp4') ? 1 : 0;
            if (bmp4 !== amp4) return bmp4 - amp4;
            const asz = a.filesize || a.filesize_approx || 0;
            const bsz = b.filesize || b.filesize_approx || 0;
            return (bsz - asz);
          });

        const selected = candidates[0] || null;

        if (!selected) {
          // Fallback: attempt merge to stdout using ffmpeg (no Range support)
          // Build selector combining best video+audio for requested height, then generic fallbacks
          let sel;
          if (targetH) {
            sel = `bestvideo[height<=${targetH}]+bestaudio/best[height<=${targetH}]/best`;
          } else {
            sel = 'bestvideo+bestaudio/best';
          }

          // Quick ffmpeg availability check
          const ffmpegBin = process.env.FFMPEG_PATH || 'ffmpeg';
          const ffv = spawn(ffmpegBin, ['-version']);
          ffv.on('error', () => {
            return res.status(422).json({
              error: 'FFmpeg not found',
              message: 'FFmpeg is required to merge audio and video. Install FFmpeg or set FFMPEG_PATH to the ffmpeg binary.'
            });
          });
          let ffOk = false;
          ffv.on('close', (code) => {
            ffOk = code === 0;
            if (!ffOk) {
              return res.status(422).json({
                error: 'Format not available',
                message: 'No progressive stream found and FFmpeg is not available to merge. Install FFmpeg or try a different quality.'
              });
            }

            // Start yt-dlp merge to stdout
            const ytdlpArgs = [
              '-m', 'yt_dlp',
              '-f', sel,
              '--no-playlist',
              '--no-warnings',
              '--merge-output-format', 'mp4',
              ...(process.env.FFMPEG_PATH ? ['--ffmpeg-location', process.env.FFMPEG_PATH] : []),
              '-o', '-',
              url
            ];
            const ytdlpMerge = spawn('python', ytdlpArgs);

            // Set basic headers (no Content-Length/Range)
            const filenameBase = `${info.title || 'video'}`
              .replace(/[<>:"/\\|?*\r\n]/g, '')
              .replace(/\s+/g, ' ')
              .trim()
              .substring(0, 100);
            const safeAscii = `${filenameBase}.mp4`.replace(/[^\x20-\x7E]/g, '');
            const safeUtf8 = encodeURIComponent(`${filenameBase}.mp4`).replace(/['()]/g, escape).replace(/\*/g, '%2A');
            res.setHeader('Content-Type', 'video/mp4');
            res.setHeader('Content-Disposition', `attachment; filename="${safeAscii}"; filename*=UTF-8''${safeUtf8}`);
            res.setHeader('Cache-Control', 'no-cache');

            ytdlpMerge.stdout.pipe(res);

            ytdlpMerge.stderr.on('data', (d) => {
              // Optional: log progress/errors
            });

            ytdlpMerge.on('error', (err) => {
              if (!res.headersSent) {
                res.status(503).json({ error: 'Merge failed', message: err.message });
              } else {
                res.end();
              }
            });

            ytdlpMerge.on('close', (code) => {
              if (code !== 0) {
                if (!res.headersSent) {
                  return res.status(502).json({ error: 'Merge failed', message: 'yt-dlp/ffmpeg exited with error' });
                }
              }
              res.end();
            });

            // Abort merge if client disconnects
            req.on('close', () => {
              ytdlpMerge.kill('SIGKILL');
            });
          });

          return; // handled in ffmpeg branch
        }

        // Build response metadata
        const filenameBase = `${info.title || 'video'}`
          .replace(/[<>:"/\\|?*]/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 100);
        const ext = selected.ext || 'mp4';
        const filename = `${filenameBase}.${ext}`;

        // Proxy stream from origin to client with Range support
        const directUrl = selected.url;
        const upstream = new URL(directUrl);
        const clientRange = req.headers['range'];

        const headers = {
          // Forward Range for partial content
          ...(clientRange ? { Range: clientRange } : {}),
          // Some CDNs require a UA
          'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
          'Accept': req.headers['accept'] || '*/*'
        };

        // yt-dlp may provide required headers for this format
        if (selected.http_headers) {
          for (const [k, v] of Object.entries(selected.http_headers)) {
            headers[k] = v;
          }
        } else if (info.http_headers) {
          for (const [k, v] of Object.entries(info.http_headers)) {
            headers[k] = v;
          }
        }

        const requestOptions = {
          method: req.method === 'HEAD' ? 'HEAD' : 'GET',
          protocol: upstream.protocol,
          hostname: upstream.hostname,
          port: upstream.port || (upstream.protocol === 'https:' ? 443 : 80),
          path: upstream.pathname + (upstream.search || ''),
          headers
        };

        const client = upstream.protocol === 'https:' ? https : http;

        const upstreamReq = client.request(requestOptions, (upstreamRes) => {
          const startedAt = Date.now();
          let bytesProxied = 0;
          const statusCode = upstreamRes.statusCode || (clientRange ? 206 : 200);

          // If origin responded with error, return JSON error (don’t pipe binary)
          if (statusCode >= 400) {
            return res.status(statusCode).json({
              error: 'Upstream error',
              status: statusCode,
              message: upstreamRes.statusMessage || 'Origin returned an error'
            });
          }
          // Set download headers for client
          const originType = upstreamRes.headers['content-type'];
          const originLength = upstreamRes.headers['content-length'];
          const originRange = upstreamRes.headers['content-range'];
          const originAcceptRanges = upstreamRes.headers['accept-ranges'];
          const originETag = upstreamRes.headers['etag'];
          const originLM = upstreamRes.headers['last-modified'];

          if (originType) res.setHeader('Content-Type', originType);
          else if (selected.mime_type) res.setHeader('Content-Type', selected.mime_type);
          else if (ext === 'mp4') res.setHeader('Content-Type', 'video/mp4');

          if (originLength) res.setHeader('Content-Length', originLength);
          if (originRange) res.setHeader('Content-Range', originRange);
          if (originAcceptRanges) res.setHeader('Accept-Ranges', originAcceptRanges);
          else res.setHeader('Accept-Ranges', 'bytes');
          if (originETag) res.setHeader('ETag', originETag);
          if (originLM) res.setHeader('Last-Modified', originLM);

          // Build safe Content-Disposition (ASCII fallback + RFC5987 UTF-8)
          const asciiName = (filename || 'video.mp4')
            .replace(/[\r\n]/g, ' ')
            .replace(/[^\x20-\x7E]/g, '');
          const utf8Name = encodeURIComponent(filename || 'video.mp4')
            .replace(/['()]/g, escape)
            .replace(/\*/g, '%2A');
          res.setHeader('Content-Disposition', `attachment; filename="${asciiName}"; filename*=UTF-8''${utf8Name}`);
          res.setHeader('Cache-Control', 'no-cache');

          // Relay status (200/206)
          res.status(statusCode);

          if (req.method === 'HEAD') {
            // No body for HEAD
            return res.end();
          }
          // Pipe data for GET
          upstreamRes.on('data', (chunk) => {
            bytesProxied += chunk.length;
          });
          upstreamRes.on('end', () => {
            const ms = Date.now() - startedAt;
            console.log(`📡 Stream completed ${statusCode} ${filename} - ${bytesProxied} bytes in ${ms}ms`);
          });
          upstreamRes.on('error', (e) => {
            console.error('Upstream response error:', e);
          });

          upstreamRes.pipe(res);
        });

        upstreamReq.setTimeout(30_000, () => {
          upstreamReq.destroy(new Error('Upstream timeout'));
        });

        upstreamReq.on('error', (err) => {
          if (!res.headersSent) {
            res.status(502).json({ error: 'Upstream fetch failed', message: err.message });
          } else {
            res.end();
          }
        });

        // Abort if client disconnects
        req.on('close', () => {
          console.warn('Client disconnected, aborting upstream request');
          upstreamReq.destroy();
        });

        upstreamReq.end();
      } catch (e) {
        console.error('Stream resolve parse error:', e, stderr);
        return res.status(500).json({ error: 'Processing failed', message: 'Failed to resolve media formats' });
      }
    });
  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).json({
      error: 'Streaming failed',
      message: 'An error occurred while preparing the stream'
    });
  }
});

module.exports = router;
