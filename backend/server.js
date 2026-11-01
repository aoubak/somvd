const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const compression = require('compression');
const fs = require('fs');
const os = require('os');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import routes
const videoRoutes = require('./routes/video');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3002;

// PERSONAL_MODE=true: private single-user install (see start.bat). Any site, no rate limits.
const PERSONAL_MODE = process.env.PERSONAL_MODE === 'true';
// The built frontend, served from this server when it exists so one address works on every device
const FRONTEND_DIST = path.join(__dirname, '..', 'dist');
const FRONTEND_BASE = '/somvdapp';
const serveFrontend = fs.existsSync(path.join(FRONTEND_DIST, 'index.html'));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      // Thumbnails load straight from the video platforms
      imgSrc: ["'self'", 'data:', 'https:', 'http:'],
      // The app is also opened over plain http on the home network
      upgradeInsecureRequests: null
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  // Lets the frontend read the download filename from cross-origin /stream responses
  exposedHeaders: ['Content-Disposition']
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

// Streaming-specific rate limiter (more conservative to protect bandwidth)
const streamLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 6, // up to 6 stream starts per minute
  message: {
    error: 'Too many streaming requests, please wait before trying again.',
    retryAfter: '1 minute'
  }
});

// Apply rate limiting (a personal install has one user, so there is nothing to protect)
if (!PERSONAL_MODE) {
  app.use(limiter);
  app.use('/api/video/stream', streamLimiter);
}

// Middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// Built frontend (single-page app: unknown paths under the base return index.html)
if (serveFrontend) {
  app.get('/', (req, res) => res.redirect(`${FRONTEND_BASE}/`));
  app.use(FRONTEND_BASE, express.static(FRONTEND_DIST));
  app.get(`${FRONTEND_BASE}/*`, (req, res) => res.sendFile(path.join(FRONTEND_DIST, 'index.html')));
}

// Error handling middleware
// Express identifies error handlers by their four arguments, so _next must stay
app.use((err, req, res, _next) => {
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

// Start server
app.listen(PORT, () => {
  console.log('🚀 SOMVD Backend Server Started!');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎥 Video API: http://localhost:${PORT}/api/video`);
  console.log(`🔒 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  if (serveFrontend) {
    console.log(`🖥️  App: http://localhost:${PORT}${FRONTEND_BASE}/`);
    // Addresses other devices on the same Wi-Fi can open
    for (const addresses of Object.values(os.networkInterfaces())) {
      for (const address of addresses || []) {
        if (address.family === 'IPv4' && !address.internal) {
          console.log(`📱 On your phone (same Wi-Fi): http://${address.address}:${PORT}${FRONTEND_BASE}/`);
        }
      }
    }
  }
  if (PERSONAL_MODE) console.log('👤 Personal mode: all sites allowed, rate limits off');
});

module.exports = app;
