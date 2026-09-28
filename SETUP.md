## Project Setup Guide (Frontend + Backend)

This guide shows how to run SOMVD locally and deploy the backend online. Downloads stream straight to the browser; nothing is stored on the server.

### 1) Prerequisites
- Node.js 20.19+ or 22.12+ (required by Vite 7; the backend also uses Node as yt-dlp's JavaScript runtime for YouTube)
- Git
- Backend extras:
  - Python 3.10+ (for yt-dlp)
  - yt-dlp 2025.11 or newer, with its `yt-dlp-ejs` challenge solver (YouTube fails without it)
  - FFmpeg (`ffmpeg` and `ffprobe` on PATH), used to merge separate video and audio tracks

Windows quick installs
```
# FFmpeg (Winget)
winget install -e --id Gyan.FFmpeg

# Python tools
py -m pip install --upgrade pip
py -m pip install -U "yt-dlp[default]"
```

Ubuntu quick installs
```
sudo apt update && sudo apt install -y curl git python3 python3-pip ffmpeg
python3 -m pip install --upgrade pip "yt-dlp[default]"
```

Check everything is found
```
node --version
python -m yt_dlp --version
ffmpeg -version
```

---

### 2) Clone repository
```
git clone https://github.com/aoubak/somvd.git
cd somvd
```

---

### 3) Backend setup
```
cd backend
npm install
```

Environment variables (create `backend/.env`, or copy `backend/.env.example`)
```
PORT=3002
NODE_ENV=production
# Comma-separated list of allowed frontend origins
FRONTEND_URL=http://localhost:5173

# JavaScript runtime yt-dlp uses for YouTube ("off" only for yt-dlp older than 2025.11)
YTDLP_JS_RUNTIMES=node

# Optional for private Facebook (Netscape cookies.txt)
# YTDLP_COOKIES=C:\path\to\cookies.txt

# Optional if ffmpeg is not on PATH
# FFMPEG_PATH=C:\path\to\ffmpeg.exe
```

Run backend (dev, restarts on file changes)
```
npm run dev
```

Run backend (prod)
```
npm start
```

PM2 (optional)
```
npm i -g pm2
pm2 start server.js --name somvd-backend
pm2 save
pm2 startup
```

Health check
```
curl http://localhost:3002/api/health
```

---

### 4) Frontend setup
Open a second terminal in the project root.
```
npm install
```

Frontend env (optional `.env` at project root; this is the default)
```
VITE_API_URL=http://localhost:3002/api
```

Run frontend (dev)
```
npm run dev
# the app lives under /somvdapp/, e.g. http://localhost:5173/somvdapp/
```

Checks
```
npm test        # Vitest: helpers, download service, downloader state machine, backend error messages
npm run lint    # ESLint for frontend and backend
```

Build frontend (prod)
```
npm run build   # output in dist/
```

The app is built for the `/somvdapp/` path. To host it somewhere else (for example the domain root), change `base` in `vite.config.js` and `basename` in `src/main.jsx` together.

---

### 5) How downloads work
- The frontend asks for video details with `POST /api/video/info` and shows the available qualities (240p to 4K, plus Audio when the platform has a separate audio track).
- Download fetches `GET /api/video/stream?url=...&quality=...` inside the page, so it can show progress, a Cancel button and readable error messages, then saves the file.
- Files the server reports as larger than 1 GB are handed to the browser's own download instead of being held in memory.
- The backend streams bytes straight through; no files are stored on the server.
- When a platform has no combined audio + video file (YouTube in most cases), FFmpeg merges the best H.264 video and AAC audio into an MP4 on the fly.

---

### 6) Deployment (backend)
- Recommended OS: Ubuntu 22.04+
- Install Node, Python, yt-dlp, FFmpeg (see above)
- Set env vars in `backend/.env` (`FRONTEND_URL` must list your real frontend origin)
- Run behind a reverse proxy (Nginx/Caddy). Streaming needs buffering off and a long read timeout. Example Nginx:
```
server {
  listen 80;
  server_name api.yourdomain.com;

  location / {
    proxy_pass http://127.0.0.1:3002;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_buffering off;
    proxy_read_timeout 300s;
  }
}
```
- Set your frontend `VITE_API_URL=https://api.yourdomain.com/api` and rebuild.
- Known limitation: the backend does not yet set Express `trust proxy`, so behind a proxy every visitor looks like the same IP and shares the rate limits.
- Keep yt-dlp current on the server (`python3 -m pip install -U "yt-dlp[default]"`); platforms change often.

---

### 7) Facebook notes
- If a link returns audio-only or errors, try `quality=best`.
- Prefer canonical watch/reel URLs over share redirects.
- Private videos often require cookies:
  - Export facebook.com cookies to Netscape format as `cookies.txt`.
  - Set `YTDLP_COOKIES` to its full path and restart backend.

---

### 8) Troubleshooting
- YouTube says "The page needs to be reloaded" or shows only a few qualities
  - yt-dlp is out of date: `python -m pip install -U "yt-dlp[default]"`, then restart the backend.
- "No supported JavaScript runtime could be found" in backend logs
  - Make sure `node` is on PATH for the backend process and `YTDLP_JS_RUNTIMES=node`.
- FFmpeg not found
  - Install FFmpeg and ensure `ffmpeg`/`ffprobe` are on PATH or set `FFMPEG_PATH`.
- Merged video will not play
  - Update yt-dlp and FFmpeg; merges are written as fragmented MP4 (H.264 + AAC when available).
- CORS errors
  - Set `FRONTEND_URL` in backend `.env` to your frontend origin (comma-separate several).
- "Too many streaming requests"
  - Built-in limits: 100 requests per 15 minutes and 6 stream starts per minute per IP; adjust in `backend/server.js` if needed.
- "The video source took too long to respond"
  - The platform did not start sending within 30 seconds (common on slow connections); try again.

---

### 9) Useful endpoints
```
GET  /api/health
GET  /api/video/health
POST /api/video/info
GET  /api/video/platforms
GET  /api/video/stream?url=...&quality=240p|360p|480p|720p|1080p|1440p|2160p|best|audio
```

Errors return JSON: `{ "error": "...", "message": "readable sentence" }`.
