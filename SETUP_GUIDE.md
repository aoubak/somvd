# 🚀 SOMVD Complete Setup Guide

This guide will help you set up the complete SOMVD (Social Media Video Downloader) application with both frontend and backend.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.7 or higher) - [Download here](https://python.org/)
- **Git** - [Download here](https://git-scm.com/)

## 🏗️ Project Structure

```
somvdapp/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── backend/                  # Node.js + Express backend
│   ├── routes/
│   ├── services/
│   ├── server.js
│   └── package.json
└── SETUP_GUIDE.md           # This file
```

## 🛠️ Installation Steps

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Node.js dependencies
npm install

# Install yt-dlp (video processing tool)
pip install yt-dlp

# Create environment file
cp .env.example .env

# Start the backend server
npm run dev
```

The backend will start on `http://localhost:3001`

### Step 2: Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd ../

# Install frontend dependencies
npm install

# Start the frontend development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🔧 Configuration

### Backend Configuration (.env)

Create a `.env` file in the backend directory:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_AGE_HOURS=24
```

### Frontend Configuration

The frontend automatically connects to the backend at `http://localhost:3001/api`

## 🧪 Testing the Setup

### 1. Test Backend Health

```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "SOMVD Backend API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### 2. Test Frontend

1. Open `http://localhost:5173` in your browser
2. You should see the SOMVD homepage
3. Try pasting a YouTube URL and clicking "Download"

### 3. Test Video Download

1. Paste a YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
2. Click "Download" button
3. Wait for video information to load
4. Select a format and click download

## 🚀 Production Deployment

### Backend Deployment

```bash
# Build for production
cd backend
npm install --production

# Set environment variables
export NODE_ENV=production
export PORT=3001
export FRONTEND_URL=https://your-frontend-domain.com

# Start production server
npm start
```

### Frontend Deployment

```bash
# Build for production
cd frontend
npm run build

# The dist/ folder contains the built files
# Deploy the dist/ folder to your hosting service
```

## 🔍 API Endpoints

### Video Operations

- `GET /api/health` - Health check
- `POST /api/video/info` - Get video information
- `POST /api/video/download` - Download video
- `GET /api/video/platforms` - Get supported platforms
- `GET /api/video/stats` - Get service statistics

### Example API Usage

```javascript
// Get video information
const response = await fetch('http://localhost:3001/api/video/info', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' 
  })
});

const data = await response.json();
console.log(data.data); // Video information
```

## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check if Node.js is installed: `node --version`
   - Check if port 3001 is available
   - Install dependencies: `npm install`

2. **yt-dlp not found**
   ```bash
   pip install yt-dlp
   # Or on Windows
   python -m pip install yt-dlp
   ```

3. **Frontend can't connect to backend**
   - Ensure backend is running on port 3001
   - Check CORS settings in backend
   - Verify API URL in frontend service

4. **Downloads not working**
   - Check if yt-dlp is installed: `yt-dlp --version`
   - Verify video URL is supported
   - Check backend logs for errors

### Debug Commands

```bash
# Check Node.js version
node --version

# Check Python version
python --version

# Check yt-dlp installation
yt-dlp --version

# Test backend API
curl http://localhost:3001/api/health

# View backend logs
cd backend && npm run dev

# View frontend logs
cd frontend && npm run dev
```

## 📱 Supported Platforms

- **YouTube** - Videos, Shorts, Live streams
- **TikTok** - Regular videos, viral content
- **Instagram** - Posts, Reels, IGTV
- **Facebook** - Videos, Watch content
- **Twitter/X** - Video tweets, media content

## 🔒 Security Features

- **Rate Limiting**: Prevents abuse
- **Input Validation**: Validates all inputs
- **CORS Protection**: Configurable origins
- **File Cleanup**: Automatic cleanup of old files
- **Error Handling**: Comprehensive error responses

## 📊 Performance

- **Concurrent Downloads**: Supports multiple simultaneous downloads
- **File Streaming**: Efficient file serving
- **Memory Management**: Automatic cleanup
- **Caching**: Optimized for repeated requests

## 🆘 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review backend logs for errors
3. Verify all prerequisites are installed
4. Test API endpoints individually
5. Check network connectivity

## 🎯 Next Steps

After successful setup:

1. **Customize the UI** - Modify React components
2. **Add Features** - Implement batch downloads, playlists
3. **Deploy to Production** - Use services like Vercel, Heroku
4. **Monitor Performance** - Add logging and analytics
5. **Scale the Backend** - Add database, caching

## 📝 Development Tips

- Use `npm run dev` for development with hot reload
- Check browser console for frontend errors
- Monitor backend logs for API issues
- Test with different video URLs
- Use browser dev tools for debugging

---

🎉 **Congratulations!** You now have a fully functional video downloader application!
