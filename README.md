## SOMVD – Social Media Video Downloader (Frontend)

This is the React + Vite frontend for SOMVD. It provides a simple UI to paste a social media URL, preview metadata, select quality, and download via the backend streaming API.

### Features
- Paste URL (YouTube, TikTok, Instagram, Facebook, Twitter)
- Detect platform and show available formats
- Download via streaming (no server storage)
- Nice UI with status messages and progress states

### Prerequisites
- Node.js 18+
- Backend running (see `backend/README.md`)

### Environment
Create a `.env` file at the project root (frontend) if needed:
```
VITE_API_URL=http://localhost:3002/api
```
Defaults to `http://localhost:3002/api` if not set.

### Run locally
```bash
npm install
npm run dev
# open the URL shown (e.g., http://localhost:5173)
```

### How downloads work
- The frontend calls `POST /api/video/info` to fetch metadata.
- On Download, it opens `GET /api/video/stream?url=...&quality=...` which streams bytes directly to the browser with a proper filename. No files are stored on the server.

### Notes for Facebook
- Some Facebook links require login. The backend supports cookies via `YTDLP_COOKIES` (see backend README).
- For watch and reels/share links, try `quality=best` for best compatibility.

### Troubleshooting
- If downloads start a new tab but don’t save, ensure popups are allowed and check console for `🔗 Download URL` logs.
- If backend errors occur, see the backend logs.

### Related docs
- Backend: `backend/README.md`
- Future roadmap: `FUTURE.md`
