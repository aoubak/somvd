# SOMVD Backend - Video Download API

A powerful Node.js backend service for downloading videos from multiple social media platforms including YouTube, TikTok, Instagram, Facebook, and Twitter.

## 🚀 Features

- **Multi-Platform Support**: YouTube, TikTok, Instagram, Facebook, Twitter
- **Multiple Formats**: MP4 (360p, 720p, 1080p, 4K), MP3 audio
- **Real-time Processing**: Get video info and download in real-time
- **Security**: Rate limiting, input validation, CORS protection
- **File Management**: Automatic cleanup of old files
- **RESTful API**: Clean, documented API endpoints
- **Error Handling**: Comprehensive error handling and logging

## 📋 Prerequisites

Before running the backend, ensure you have:

- **Node.js** (v16 or higher)
- **Python** (v3.7 or higher)
- **yt-dlp** (Python package for video downloading)

## 🛠️ Installation

### 1. Clone and Setup

```bash
# Navigate to backend directory
cd backend

# Install Node.js dependencies
npm install

# Install yt-dlp (video processing tool)
pip install yt-dlp

# Or use the setup script
npm run setup
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your settings
nano .env
```

### 3. Required Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend Configuration
FRONTEND_URL=http://localhost:5173

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Management
MAX_FILE_AGE_HOURS=24
```

## 🚀 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3001`

## 📡 API Endpoints

### Health Check
```http
GET /api/health
```

### Video Information
```http
POST /api/video/info
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

### Download Video
```http
POST /api/video/download
Content-Type: application/json

{
  "videoId": "uuid-here",
  "formatId": "mp4_720p",
  "videoInfo": { ... }
}
```

### Stream Video (no disk)
```http
GET /api/video/stream?url={sourceUrl}&quality={360p|480p|720p|1080p|best}
```
- Streams directly to the client. Prefers progressive A+V; falls back to FFmpeg merge if available.
- Headers: Content-Type, Content-Disposition, Accept-Ranges (when origin supports).
- Errors: 400/404/422/429/5xx with JSON body.

Cookies for private Facebook:
```
YTDLP_COOKIES=C:\path\to\cookies.txt
```

### Get Supported Platforms
```http
GET /api/video/platforms
```

### Service Statistics
```http
GET /api/video/stats
```

### File Cleanup
```http
DELETE /api/video/cleanup?maxAge=24
```

## 🔧 Configuration Options

### Rate Limiting
- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Download Limit**: 10 downloads per minute

### File Management
- **Auto Cleanup**: Files older than 24 hours
- **Max File Size**: 500MB per download
- **Storage Location**: `./downloads/`

### Security Features
- **CORS Protection**: Configurable origins
- **Input Validation**: URL and parameter validation
- **Helmet Security**: Security headers
- **Request Logging**: Morgan logging

## 🐛 Troubleshooting

### Common Issues

1. **yt-dlp not found**
   ```bash
   pip install yt-dlp
   # Or update PATH to include Python scripts
   ```

2. **Permission errors**
   ```bash
   # On Linux/Mac
   chmod +x node_modules/.bin/*
   ```

3. **Port already in use**
   ```bash
   # Change PORT in .env file
   PORT=3002
   ```

4. **CORS errors**
   ```bash
   # Update FRONTEND_URL in .env
   FRONTEND_URL=http://localhost:3000
   ```

### Logs and Debugging

```bash
# View logs in development
npm run dev

# Check if yt-dlp is working
yt-dlp --version

# Test API endpoints
curl http://localhost:3001/api/health
```

## 📁 Project Structure

```
backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env.example          # Environment template
├── routes/
│   └── video.js          # Video API routes
├── services/
│   └
