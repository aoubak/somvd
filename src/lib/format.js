// Display helpers shared by the downloader UI

const UNITS = ['B', 'KB', 'MB', 'GB'];

// 1536 -> "1.5 KB", 157286400 -> "150 MB"
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit++;
  }
  const digits = unit === 0 || value >= 100 ? 0 : 1;
  return `${value.toFixed(digits)} ${UNITS[unit]}`;
}

export function formatSpeed(bytesPerSecond) {
  if (!Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0) return '';
  return `${formatBytes(bytesPerSecond)}/s`;
}

// Chip label for a backend format: '2160p' -> '4K', audio -> 'Audio'
export function qualityLabel(format) {
  if (!format) return '';
  if (format.type === 'audio') return 'Audio';
  if (format.quality === '2160p') return '4K';
  if (format.quality === 'best') return 'Best';
  return format.quality;
}

// Brand name shown to users (the backend still calls X "Twitter")
export function platformLabel(name) {
  return name === 'Twitter' ? 'X' : name || '';
}
