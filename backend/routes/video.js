const express = require('express');
const { spawn } = require('child_process');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const { body, query, validationResult } = require('express-validator');
const videoProcessor = require('../services/videoProcessor');

const router = express.Router();

// Validation middleware
const validateUrl = [
  body('url')
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Please provide a valid URL')
    .isLength({ min: 10, max: 2000 })
    .withMessage('URL must be between 10 and 2000 characters')
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
    .isIn(videoProcessor.streamQualities)
    .withMessage(`Quality must be one of ${videoProcessor.streamQualities.join(', ')}`)
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
    
    // Our own readers attach the response to send
    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.error, message: error.response.message });
    }

    // yt-dlp ran and failed: say why when we recognise the reason
    if (error.stderr && videoProcessor.describeYtdlpError(error.stderr).status !== 502) {
      const { status, error: title, message } = videoProcessor.describeYtdlpError(error.stderr);
      return res.status(status).json({ error: title, message });
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

    // Facebook stories come from our own reader, already in yt-dlp's shape
    if (videoProcessor.isFacebookStory(url)) {
      try {
        return serveInfo(await videoProcessor.resolveFacebookStory(url));
      } catch (error) {
        if (!error.response) throw error;
        return res.status(error.response.status).json({ error: error.response.error, message: error.response.message });
      }
    }

    // Resolve media info via yt-dlp (no download)
    const ytdlpArgs = videoProcessor.ytdlpArgs(
      '--dump-json',
      '--no-download',
      '--no-warnings',
      '--no-playlist',
      '--playlist-items', '1',
      url
    );

    const ytdlp = spawn('python', ytdlpArgs);

    let stdout = '';
    let stderr = '';

    ytdlp.stdout.on('data', (d) => { stdout += d.toString(); });
    ytdlp.stderr.on('data', (d) => { stderr += d.toString(); });

    // A missing python/yt-dlp emits 'error' (and may still emit 'close'); answer once instead of crashing
    ytdlp.on('error', (err) => {
      console.error('yt-dlp spawn error:', err);
      if (!res.headersSent) {
        res.status(503).json({ error: 'Service unavailable', message: 'Video processing tool not available. Please try again later.' });
      }
    });

    ytdlp.on('close', () => {
      if (res.headersSent) return;
      if (!stdout) {
        // Map yt-dlp errors to a readable sentence; keep the raw output in the server log
        console.error('Stream resolve error:', stderr);
        const { status, error, message } = videoProcessor.describeYtdlpError(stderr);
        return res.status(status).json({ error, message });
      }

      let info;
      try {
        info = JSON.parse(stdout);
      } catch (e) {
        console.error('Stream resolve parse error:', e, stderr);
        return res.status(500).json({ error: 'Processing failed', message: 'Failed to resolve media formats' });
      }
      serveInfo(info);
    });

    // Pick the format for the requested quality and send it (direct proxy, or merge with FFmpeg)
    function serveInfo(info) {
      try {
        const formats = Array.isArray(info.formats) ? info.formats : [];

        // Map quality like '720p' to numeric height ('best' and 'audio' have none)
        const targetH = /^\d+p$/.test(quality) ? parseInt(quality, 10) : null;

        let selected;

        if (quality === 'audio') {
          // Same selection /info used to offer the audio option
          selected = videoProcessor.pickAudioFormat(formats);
          if (!selected) {
            return res.status(422).json({
              error: 'Format not available',
              message: 'This video has no separate audio track. Download the video instead.'
            });
          }
        } else {
          // Filter progressive A+V formats (direct URL, height and both codecs)
          const progressive = formats.filter(f => (
            videoProcessor.isDirectFormat(f) && (f.height && Number.isFinite(f.height)) &&
            (f.acodec && f.acodec !== 'none') && (f.vcodec && f.vcodec !== 'none')
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

          selected = candidates[0] || null;

          // Guard against accidental audio-only selection
          if (selected && (
            (selected.ext && /^(m4a|mp3|aac|opus)$/i.test(selected.ext)) ||
            (selected.mime_type && /^audio\//i.test(selected.mime_type))
          )) {
            selected = null;
          }
        }

        if (!selected) {
          // Fallback: attempt merge to stdout using ffmpeg (no Range support)
          // Prefer H.264 + AAC so the merged file plays everywhere; fall back to any codecs
          const h = targetH ? `[height<=${targetH}]` : '';
          const sel = `bestvideo${h}[vcodec^=avc1]+bestaudio[acodec^=mp4a]/bestvideo${h}+bestaudio/best${h}/best`;

          // Quick ffmpeg availability check
          const ffmpegBin = process.env.FFMPEG_PATH || 'ffmpeg';
          const ffv = spawn(ffmpegBin, ['-version']);
          // 'error' and 'close' can both fire when ffmpeg is missing; only the first may respond
          ffv.on('error', () => {
            if (res.headersSent) return;
            res.status(422).json({
              error: 'FFmpeg not found',
              message: 'FFmpeg is required to merge audio and video. Install FFmpeg or set FFMPEG_PATH to the ffmpeg binary.'
            });
          });
          ffv.on('close', (code) => {
            if (res.headersSent) return;
            if (code !== 0) {
              return res.status(422).json({
                error: 'Format not available',
                message: 'No progressive stream found and FFmpeg is not available to merge. Install FFmpeg or try a different quality.'
              });
            }

            // Start yt-dlp merge to stdout
            const mergeArgs = videoProcessor.ytdlpArgs(
              '-f', sel,
              '--no-playlist',
              '--no-warnings',
              '--merge-output-format', 'mp4',
              // yt-dlp writes MPEG-TS to stdout by default; ask ffmpeg for fragmented MP4 instead
              '--downloader-args', 'ffmpeg_o:-f mp4 -movflags +frag_keyframe+empty_moov+default_base_moof',
              ...(process.env.FFMPEG_PATH ? ['--ffmpeg-location', process.env.FFMPEG_PATH] : []),
              '--playlist-items', '1',
              '-o', '-',
              url
            );
            const ytdlpMerge = spawn('python', mergeArgs);

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

            // Drain stderr so the child never blocks on a full pipe; keep the tail for errors
            let mergeStderr = '';
            ytdlpMerge.stderr.on('data', (d) => { mergeStderr = (mergeStderr + d).slice(-4096); });

            ytdlpMerge.on('error', (err) => {
              console.error('Merge spawn error:', err);
              if (!res.headersSent) {
                res.status(503).json({ error: 'Service unavailable', message: 'Video processing tool not available. Please try again later.' });
              } else {
                res.end();
              }
            });

            ytdlpMerge.on('close', (code) => {
              if (code !== 0) {
                console.error(`Merge exited with ${code}:`, mergeStderr);
                if (!res.headersSent) {
                  const { status, error, message } = videoProcessor.describeYtdlpError(mergeStderr);
                  return res.status(status).json({ error, message });
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

        // Abort the current upstream request if the client disconnects
        let upstreamReq = null;
        req.on('close', () => {
          if (upstreamReq && !upstreamReq.destroyed) {
            console.warn('Client disconnected, aborting upstream request');
            upstreamReq.destroy();
          }
        });

        // Video hosts sometimes answer with a redirect to another server; follow a few of them
        const requestUpstream = (targetUrl, redirectsLeft) => {
        const upstream = new URL(targetUrl);
        const requestOptions = {
          method: req.method === 'HEAD' ? 'HEAD' : 'GET',
          protocol: upstream.protocol,
          hostname: upstream.hostname,
          port: upstream.port || (upstream.protocol === 'https:' ? 443 : 80),
          path: upstream.pathname + (upstream.search || ''),
          headers
        };

        const client = upstream.protocol === 'https:' ? https : http;

        upstreamReq = client.request(requestOptions, (upstreamRes) => {
          const startedAt = Date.now();
          let bytesProxied = 0;
          const statusCode = upstreamRes.statusCode || (clientRange ? 206 : 200);

          const nextUrl = videoProcessor.redirectTarget(statusCode, upstreamRes.headers, targetUrl);
          if (nextUrl && redirectsLeft > 0) {
            upstreamRes.resume();
            return requestUpstream(nextUrl, redirectsLeft - 1);
          }
          // A redirect we cannot follow is a failure, not something to pass to the browser
          if (statusCode >= 300 && statusCode < 400) {
            upstreamRes.resume();
            console.error(`Upstream redirect not followed (${statusCode})`);
            return res.status(502).json({ error: 'Upstream fetch failed', message: "Couldn't reach the video source. Please try again." });
          }

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

        const currentReq = upstreamReq;
        currentReq.setTimeout(30_000, () => {
          currentReq.destroy(new Error('Upstream timeout'));
        });

        upstreamReq.on('error', (err) => {
          if (!res.headersSent) {
            console.error('Upstream fetch error:', err.message);
            const { status, error, message } = videoProcessor.describeUpstreamError(err);
            res.status(status).json({ error, message });
          } else {
            res.end();
          }
        });

        upstreamReq.end();
        };

        requestUpstream(selected.url, 5);
      } catch (e) {
        console.error('Stream serve error:', e);
        if (!res.headersSent) res.status(500).json({ error: 'Processing failed', message: 'Failed to resolve media formats' });
      }
    }
  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).json({
      error: 'Streaming failed',
      message: 'An error occurred while preparing the stream'
    });
  }
});

module.exports = router;
