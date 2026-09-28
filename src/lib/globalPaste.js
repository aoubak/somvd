// Page-level paste: only a single http(s) link pasted outside any text field counts

export function isEditableTarget(target) {
  if (!target || typeof target !== 'object') return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || Boolean(target.isContentEditable);
}

export function linkFromPaste(target, text) {
  if (isEditableTarget(target)) return null;
  const candidate = (text || '').trim();
  return /^https?:\/\/\S+$/i.test(candidate) ? candidate : null;
}
