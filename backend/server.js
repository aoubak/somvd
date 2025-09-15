const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

// Import routes
const videoRoutes = require('./routes/video');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const downloadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 downloads per minute
  message: {
    error: 'Too many download requests, please wait before trying again.',
    retryAfter: '1 minute'
  }
});

// Apply rate limiting
app.use(limiter);
app.use('/api/video/download', downloadLimiter);

// Middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create necessary directories
const createDirectories = async () => {
  try {
    await fs.ensureDir(path.join(__dirname, 'downloads'));
    await fs.ensureDir(path.join(__dirname, 'temp'));
    console.log('✅ Required directories created/verified');
  } catch (error) {
    console.error('❌ Error creating directories:', error);
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SOMVD Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api/video', videoRoutes);

// Serve static files (downloaded videos)
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle different types of errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON in request body',
      message: 'Please check your request format'
    });
  }
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Request too large',
      message: 'Request size exceeds limit'
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist`
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  
  // Clean up temporary files
  try {
    await fs.emptyDir(path.join(__dirname, 'temp'));
    console.log('✅ Temporary files cleaned up');
  } catch (error) {
    console.error('❌ Error cleaning up temp files:', error);
  }
  
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  
  // Clean up temporary files
  try {
    await fs.emptyDir(path.join(__dirname, 'temp'));
    console.log('✅ Temporary files cleaned up');
  } catch (error) {
    console.error('❌ Error cleaning up temp files:', error);
  }
  
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    await createDirectories();
    
    app.listen(PORT, () => {
      console.log('🚀 SOMVD Backend Server Started!');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🎥 Video API: http://localhost:${PORT}/api/video`);
      console.log(`🔒 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log('📁 Downloads directory ready');
      console.log('⚡ Ready to process video downloads!');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
