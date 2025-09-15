import React, { useState, useEffect } from 'react';
import { FaDownload, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaPlay } from 'react-icons/fa';
import videoDownloadService from '../services/videoDownloadService';

export default function VideoDownloader() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState(null);
  const [videoInfo, setVideoInfo] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('mp4_720p');

  // Initialize with service defaults; update after fetch so UI re-renders reliably
  const [supportedPlatforms, setSupportedPlatforms] = useState(
    videoDownloadService.getSupportedPlatforms() || []
  );

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const res = await fetch(`${videoDownloadService.baseURL}/video/platforms`);
        if (!res.ok) throw new Error('Failed to load platforms');
        const json = await res.json();
        if (isMounted && json?.data) {
          setSupportedPlatforms(json.data);
        }
      } catch (err) {
        // Keep initial defaults from service on failure
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const detectPlatform = (url) => {
    return videoDownloadService.detectPlatform(url);
  };

  const validateUrl = (url) => {
    return videoDownloadService.validateUrl(url);
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setDownloadStatus({ type: 'error', message: 'Please enter a video URL' });
      return;
    }

    if (!validateUrl(url)) {
      setDownloadStatus({ type: 'error', message: 'Please enter a valid URL from supported platforms' });
      return;
    }

    setIsLoading(true);
    setDownloadStatus(null);
    setVideoInfo(null);

    try {
      const videoData = await videoDownloadService.getVideoInfo(url);
      setVideoInfo(videoData);
      setSelectedFormat(videoData.formats[1]?.id || 'mp4_720p'); // Default to 720p
      
      setDownloadStatus({ 
        type: 'success', 
        message: `Video from ${videoData.platform} is ready for download!` 
      });
    } catch (error) {
      setDownloadStatus({ 
        type: 'error', 
        message: error.message || 'Failed to process video. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleActualDownload = async (format) => {
    if (!videoInfo) return;

    setIsDownloading(true);
    try {
      // Use streaming endpoint (no disk) by default
      await videoDownloadService.streamVideo(videoInfo, format);
      setDownloadStatus({ type: 'success', message: 'Streaming download started...' });
    } catch (error) {
      setDownloadStatus({
        type: 'error',
        message: 'Download failed. Please try again.'
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const resetForm = () => {
    setUrl('');
    setVideoInfo(null);
    setDownloadStatus(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleDownload} className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste video URL here (YouTube, TikTok, Instagram, Facebook, Twitter)..."
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={isLoading}
          />
          {url && detectPlatform(url) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-lg">{detectPlatform(url).icon}</span>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px]"
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FaDownload />
              Download
            </>
          )}
        </button>
      </form>

      {/* Status Messages */}
      {downloadStatus && (
        <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${
          downloadStatus.type === 'success' 
            ? 'bg-green-900/50 border border-green-500 text-green-300' 
            : 'bg-red-900/50 border border-red-500 text-red-300'
        }`}>
          {downloadStatus.type === 'success' ? (
            <FaCheckCircle className="text-green-400" />
          ) : (
            <FaExclamationTriangle className="text-red-400" />
          )}
          <span>{downloadStatus.message}</span>
        </div>
      )}

      {/* Video Info Card */}
      {videoInfo && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative">
              <img 
                src={videoInfo.thumbnail} 
                alt="Video thumbnail"
                className="w-full md:w-64 h-36 object-cover rounded-lg"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <FaPlay className="text-white text-3xl opacity-80" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-3">{videoInfo.title}</h3>
              <div className="flex flex-wrap gap-4 text-gray-300 mb-4">
                <span className="flex items-center gap-2">
                  <span className="text-blue-400">Platform:</span> 
                  <span className="bg-blue-500/20 px-2 py-1 rounded text-blue-300">{videoInfo.platform}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-blue-400">Duration:</span> 
                  <span className="bg-gray-700 px-2 py-1 rounded">{videoInfo.duration}</span>
                </span>
              </div>

              {/* Format Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Choose Format & Quality:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {videoInfo.formats.map((format) => (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id)}
                      className={`p-3 rounded-lg border transition-all text-left ${
                        selectedFormat === format.id
                          ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                          : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="font-medium">{format.label}</div>
                      <div className="text-sm opacity-75">Size: ~{format.size}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Download Actions */}
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => handleActualDownload(selectedFormat)}
                  disabled={isDownloading}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition flex items-center gap-2 font-semibold"
                >
                  {isDownloading ? (
                    <>
                      <FaSpinner className="animate-spin" size={14} />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <FaDownload size={14} />
                      Download {videoInfo.formats.find(f => f.id === selectedFormat)?.label}
                    </>
                  )}
                </button>
                <button 
                  onClick={resetForm}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition"
                >
                  Download Another
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supported Platforms Info */}
      <div className="mt-8 text-center">
        <p className="text-gray-400 mb-3">Supported platforms:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {supportedPlatforms.map((platform) => (
            <span 
              key={platform.name}
              className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm flex items-center gap-1"
            >
              <span>{platform.icon}</span>
              {platform.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
