// Downloader state machine: idle → fetching → ready → downloading → done,
// with error reachable from fetching (stage 'info') and downloading (stage 'download')

export const initialState = {
  status: 'idle',
  url: '',
  info: null,
  formatId: null,
  progress: null,
  error: null,
  savedAs: null
};

// 720p when offered, else the best video, else whatever exists
export function defaultFormatId(formats = []) {
  const pick = formats.find(f => f.quality === '720p') || formats.find(f => f.type === 'video') || formats[0];
  return pick ? pick.id : null;
}

// A video is loaded and nothing is in flight
function canPickOrDownload(state) {
  if (!state.info) return false;
  return state.status === 'ready' || state.status === 'done' ||
    (state.status === 'error' && state.error?.stage === 'download');
}

export function downloaderReducer(state, action) {
  switch (action.type) {
    case 'SET_URL':
      if (state.status === 'fetching' || state.status === 'downloading') return state;
      if (state.status === 'error' && state.error?.stage === 'info') {
        return { ...state, url: action.url, status: 'idle', error: null };
      }
      return { ...state, url: action.url };

    case 'FETCH_START':
      if (state.status === 'downloading') return state;
      return { ...initialState, url: action.url ?? state.url, status: 'fetching' };

    case 'FETCH_SUCCESS':
      if (state.status !== 'fetching') return state;
      return { ...state, status: 'ready', info: action.info, formatId: defaultFormatId(action.info.formats) };

    case 'FETCH_FAILURE':
      if (state.status === 'downloading') return state;
      return { ...state, status: 'error', info: null, error: { stage: 'info', message: action.message } };

    case 'SELECT_FORMAT':
      if (!canPickOrDownload(state)) return state;
      return { ...state, status: 'ready', formatId: action.formatId, error: null, savedAs: null };

    case 'DOWNLOAD_START':
      if (!canPickOrDownload(state)) return state;
      return {
        ...state,
        status: 'downloading',
        progress: { received: 0, total: null, bytesPerSecond: 0 },
        error: null,
        savedAs: null
      };

    case 'DOWNLOAD_PROGRESS':
      if (state.status !== 'downloading') return state;
      return { ...state, progress: action.progress };

    case 'DOWNLOAD_SUCCESS':
      if (state.status !== 'downloading') return state;
      return { ...state, status: 'done', progress: null, savedAs: { filename: action.filename, mode: action.mode } };

    case 'DOWNLOAD_FAILURE':
      if (state.status !== 'downloading') return state;
      return { ...state, status: 'error', progress: null, error: { stage: 'download', message: action.message } };

    case 'DOWNLOAD_CANCEL':
      if (state.status !== 'downloading') return state;
      return { ...state, status: 'ready', progress: null };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// One sentence for the screen-reader live region; progress ticks are left to the progressbar
export function describeStatus(state) {
  switch (state.status) {
    case 'fetching':
      return 'Fetching video details.';
    case 'ready':
      return state.info ? `Ready: ${state.info.title}. Choose a quality and download.` : '';
    case 'downloading':
      return 'Download started.';
    case 'done':
      return state.savedAs?.mode === 'native'
        ? 'Download handed to your browser.'
        : `Saved ${state.savedAs?.filename ?? 'the file'}.`;
    case 'error':
      return state.error?.message ?? '';
    default:
      return '';
  }
}
