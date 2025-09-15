const express = require('express');
const { body, validationResult } = require('express-validator');
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

module.exports = router;
