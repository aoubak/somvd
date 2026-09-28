import { describe, expect, it } from 'vitest';
import { defaultFormatId, describeStatus, downloaderReducer, initialState } from './downloaderReducer';

const formats = [
  { id: 'mp4_1080p', quality: '1080p', type: 'video' },
  { id: 'mp4_720p', quality: '720p', type: 'video' },
  { id: 'audio_m4a', quality: 'audio', type: 'audio' }
];
const info = { title: 'Clip', formats };
const run = (...actions) => actions.reduce(downloaderReducer, initialState);
const fetched = () => run({ type: 'FETCH_START', url: 'https://youtu.be/x' }, { type: 'FETCH_SUCCESS', info });
const downloading = () => downloaderReducer(fetched(), { type: 'DOWNLOAD_START' });

describe('defaultFormatId', () => {
  it('prefers 720p, then the best video, then anything', () => {
    expect(defaultFormatId(formats)).toBe('mp4_720p');
    expect(defaultFormatId([formats[0], formats[2]])).toBe('mp4_1080p');
    expect(defaultFormatId([formats[2]])).toBe('audio_m4a');
    expect(defaultFormatId([])).toBeNull();
  });
});

describe('downloaderReducer', () => {
  it('moves from fetching to ready with the default format selected', () => {
    const state = fetched();
    expect(state.status).toBe('ready');
    expect(state.url).toBe('https://youtu.be/x');
    expect(state.formatId).toBe('mp4_720p');
  });

  it('records an info error and clears it when the link is edited', () => {
    const failed = run({ type: 'FETCH_START', url: 'https://youtu.be/x' }, { type: 'FETCH_FAILURE', message: 'Private video' });
    expect(failed).toMatchObject({ status: 'error', error: { stage: 'info', message: 'Private video' } });
    expect(downloaderReducer(failed, { type: 'SET_URL', url: 'https://youtu.be/y' })).toMatchObject({ status: 'idle', error: null, url: 'https://youtu.be/y' });
  });

  it('ignores a second download start while one is running', () => {
    const state = downloading();
    expect(state.status).toBe('downloading');
    expect(downloaderReducer(state, { type: 'DOWNLOAD_START' })).toBe(state);
  });

  it('freezes the quality selection during a download', () => {
    const state = downloading();
    expect(downloaderReducer(state, { type: 'SELECT_FORMAT', formatId: 'audio_m4a' })).toBe(state);
  });

  it('ignores progress when not downloading', () => {
    const state = fetched();
    expect(downloaderReducer(state, { type: 'DOWNLOAD_PROGRESS', progress: { received: 1 } })).toBe(state);
  });

  it('returns to ready on cancel and keeps the chosen format', () => {
    const state = downloaderReducer(downloading(), { type: 'DOWNLOAD_CANCEL' });
    expect(state).toMatchObject({ status: 'ready', progress: null, formatId: 'mp4_720p' });
  });

  it('keeps the video after a download error and allows a retry', () => {
    const failed = downloaderReducer(downloading(), { type: 'DOWNLOAD_FAILURE', message: 'Too many requests' });
    expect(failed).toMatchObject({ status: 'error', info, error: { stage: 'download', message: 'Too many requests' } });
    expect(downloaderReducer(failed, { type: 'DOWNLOAD_START' }).status).toBe('downloading');
  });

  it('marks done, then clears the saved note when another quality is picked', () => {
    const done = downloaderReducer(downloading(), { type: 'DOWNLOAD_SUCCESS', filename: 'Clip.mp4', mode: 'blob' });
    expect(done).toMatchObject({ status: 'done', savedAs: { filename: 'Clip.mp4', mode: 'blob' } });
    expect(downloaderReducer(done, { type: 'SELECT_FORMAT', formatId: 'audio_m4a' })).toMatchObject({ status: 'ready', formatId: 'audio_m4a', savedAs: null });
  });

  it('drops a fetch result that arrives after a reset', () => {
    const state = run({ type: 'FETCH_START', url: 'https://youtu.be/x' }, { type: 'RESET' }, { type: 'FETCH_SUCCESS', info });
    expect(state).toEqual(initialState);
  });
});

describe('describeStatus', () => {
  it('announces the saved file or the browser handoff', () => {
    const done = (mode) => downloaderReducer(downloading(), { type: 'DOWNLOAD_SUCCESS', filename: 'Clip.mp4', mode });
    expect(describeStatus(done('blob'))).toBe('Saved Clip.mp4.');
    expect(describeStatus(done('native'))).toBe('Download handed to your browser.');
    expect(describeStatus(initialState)).toBe('');
  });
});
