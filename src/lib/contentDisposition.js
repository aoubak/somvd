// Filename from a Content-Disposition header; prefers RFC 5987 filename* over filename
export function filenameFromContentDisposition(header, fallback = 'video.mp4') {
  if (!header) return fallback;

  const extended = /filename\*\s*=\s*[^']*'[^']*'([^;]+)/i.exec(header);
  if (extended) {
    try {
      return decodeURIComponent(extended[1].trim());
    } catch {
      // Malformed percent-encoding: fall back to the plain filename
    }
  }

  const plain = /filename\s*=\s*(?:"([^"]*)"|([^;]+))/i.exec(header);
  const name = plain ? (plain[1] ?? plain[2] ?? '').trim() : '';
  return name || fallback;
}
