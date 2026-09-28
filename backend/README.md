# SOMVD Backend - Video Download API

A powerful Node.js backend service for downloading videos from multiple social media platforms including YouTube, TikTok, Instagram, Facebook, and Twitter.

## 🚀 Features

- **Multi-Platform Support**: YouTube, TikTok, Instagram, Facebook, Twitter
- **Multiple Formats**: MP4 (360p, 720p, 1080p, 4K), MP3 audio
- **Real-time Processing**: Get video info and download in real-time
- **Security**: Rate limiting, input validation, CORS protection
- **Streaming only**: Files stream straight to the client; nothing is written to disk
- **RESTful API**: Clean, documented API endpoints
- **Error Handling**: Comprehensive error handling and logging

## 📋 Prerequisites

Before running the backend, ensure you have:

- **Node.js** (v16 or higher; also used by yt-dlp as its JavaScript runtime for YouTube)
- **Python** (v3.9 or higher)
- **yt-dlp** 2025.11 or newer, with its `yt-dlp-ejs` challenge solver
- **FFmpeg** on PATH (or `FFMPEG_PATH`), used to merge separate video and audio tracks

## 🛠️ Installation

### 1. Clone and Setup

```bash
# Navigate to backend directory
cd backend

# Install Node.js dependencies
npm install

# Install or update yt-dlp with its YouTube challenge solver
pip install -U "yt-dlp[default]"

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
PORT=3002
NODE_ENV=development

# Frontend Configuration (comma-separated origins)
FRONTEND_URL=http://localhost:5173

# JavaScript runtime yt-dlp uses for YouTube ("off" for yt-dlp older than 2025.11)
YTDLP_JS_RUNTIMES=node

# Optional
# FFMPEG_PATH=C:\ffmpeg\bin\ffmpeg.exe
# YTDLP_COOKIES=C:\path\to\cookies.txt
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

The server will start on `http://localhost:3002`

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

### Stream Video (no disk)
```http
GET /api/video/stream?url={sourceUrl}&quality={240p|360p|480p|720p|1080p|1440p|2160p|best|audio}
```
- Streams directly to the client; nothing is written to disk.
- Video: a progressive (audio + video) file when the platform offers one, otherwise FFmpeg merges the best H.264 + AAC tracks into a fragmented MP4.
- `audio`: the best audio-only track (M4A preferred), proxied with Range support.
- Headers: Content-Type, Content-Disposition (exposed to the browser via CORS), Content-Length and Accept-Ranges when the origin provides them.
- Errors: 400/404/422/429/5xx with a JSON body `{ error, message }`.

Cookies for private Facebook:
```
YTDLP_COOKIES=C:\path\to\cookies.txt
```

### Get Supported Platforms
```http
GET /api/video/platforms
```

## 🔧 Configuration Options

### Rate Limiting
- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Stream Limit**: 6 stream starts per minute per IP

### Security Features
- **CORS Protection**: Configurable origins
- **Input Validation**: URL and parameter validation
- **Helmet Security**: Security headers
- **Request Logging**: Morgan logging

## 🐛 Troubleshooting

### Common Issues

1. **yt-dlp not found, or YouTube says "The page needs to be reloaded"**
   ```bash
   pip install -U "yt-dlp[default]"
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
python -m yt_dlp --version

# Test API endpoints
curl http://localhost:3002/api/health
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
