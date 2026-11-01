import { useCallback, useEffect, useReducer, useRef } from 'react';
import videoDownloadService from '../../services/videoDownloadService';
import { downloaderReducer, initialState } from './downloaderReducer';

const UNSUPPORTED_MESSAGE = videoDownloadService.allowAllSites
  ? "That doesn't look like a link. Paste the full address, starting with https://"
  : "That link isn't from a supported platform. Try YouTube, TikTok, Instagram, Facebook or X.";

export function useDownloader() {
  const [state, dispatch] = useReducer(downloaderReducer, initialState);
  const fetchAbort = useRef(null);
  const downloadAbort = useRef(null);

  // Stop in-flight requests when the downloader unmounts
  useEffect(() => () => {
    fetchAbort.current?.abort();
    downloadAbort.current?.abort();
  }, []);

  const setUrl = useCallback((url) => dispatch({ type: 'SET_URL', url }), []);
  const selectFormat = useCallback((formatId) => dispatch({ type: 'SELECT_FORMAT', formatId }), []);

  const fetchInfo = useCallback(async (rawUrl) => {
    const url = (rawUrl || '').trim();
    if (!url) {
      dispatch({ type: 'FETCH_FAILURE', message: 'Paste a video link first.' });
      return;
    }
    if (!videoDownloadService.validateUrl(url)) {
      dispatch({ type: 'SET_URL', url });
      dispatch({ type: 'FETCH_FAILURE', message: UNSUPPORTED_MESSAGE });
      return;
    }

    fetchAbort.current?.abort();
    const controller = new AbortController();
    fetchAbort.current = controller;
    dispatch({ type: 'FETCH_START', url });

    try {
      const info = await videoDownloadService.getVideoInfo(url, { signal: controller.signal });
      dispatch({ type: 'FETCH_SUCCESS', info });
    } catch (error) {
      if (error.name !== 'AbortError') dispatch({ type: 'FETCH_FAILURE', message: error.message });
    } finally {
      if (fetchAbort.current === controller) fetchAbort.current = null;
    }
  }, []);

  const startDownload = useCallback(async (info, format) => {
    if (downloadAbort.current || !info || !format) return; // one download at a time
    const controller = new AbortController();
    downloadAbort.current = controller;
    dispatch({ type: 'DOWNLOAD_START' });

    try {
      const result = await videoDownloadService.download(info, format, {
        signal: controller.signal,
        onProgress: (progress) => dispatch({ type: 'DOWNLOAD_PROGRESS', progress })
      });
      dispatch({ type: 'DOWNLOAD_SUCCESS', filename: result.filename, mode: result.mode });
    } catch (error) {
      if (error.name === 'AbortError') dispatch({ type: 'DOWNLOAD_CANCEL' });
      else dispatch({ type: 'DOWNLOAD_FAILURE', message: error.message });
    } finally {
      downloadAbort.current = null;
    }
  }, []);

  const cancelDownload = useCallback(() => downloadAbort.current?.abort(), []);

  const reset = useCallback(() => {
    fetchAbort.current?.abort();
    downloadAbort.current?.abort();
    dispatch({ type: 'RESET' });
  }, []);

  return { state, setUrl, fetchInfo, selectFormat, startDownload, cancelDownload, reset };
}
