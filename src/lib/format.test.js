import { describe, expect, it } from 'vitest';
import { formatBytes, formatSpeed, platformLabel, qualityLabel } from './format';

describe('formatBytes', () => {
  it('formats bytes, kilobytes, megabytes and gigabytes', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(52_100_000)).toBe('49.7 MB');
    expect(formatBytes(150 * 1024 * 1024)).toBe('150 MB');
    expect(formatBytes(3 * 1024 ** 3)).toBe('3.0 GB');
  });

  it('shows a dash for missing or invalid values', () => {
    expect(formatBytes(NaN)).toBe('—');
    expect(formatBytes(-1)).toBe('—');
    expect(formatBytes(undefined)).toBe('—');
  });
});

describe('formatSpeed', () => {
  it('appends per second and hides zero or invalid speeds', () => {
    expect(formatSpeed(6.2 * 1024 * 1024)).toBe('6.2 MB/s');
    expect(formatSpeed(0)).toBe('');
    expect(formatSpeed(NaN)).toBe('');
  });
});

describe('qualityLabel', () => {
  it('labels 2160p as 4K, audio as Audio and passes other qualities through', () => {
    expect(qualityLabel({ type: 'video', quality: '2160p' })).toBe('4K');
    expect(qualityLabel({ type: 'video', quality: '720p' })).toBe('720p');
    expect(qualityLabel({ type: 'video', quality: 'best' })).toBe('Best');
    expect(qualityLabel({ type: 'audio', quality: 'audio' })).toBe('Audio');
    expect(qualityLabel(null)).toBe('');
  });
});

describe('platformLabel', () => {
  it('shows Twitter as X and leaves other names alone', () => {
    expect(platformLabel('Twitter')).toBe('X');
    expect(platformLabel('YouTube')).toBe('YouTube');
    expect(platformLabel(undefined)).toBe('');
  });
});
