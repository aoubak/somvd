const isApple = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Paste shortcut label for this device
export const pasteShortcut = isApple ? '⌘ V' : 'Ctrl V';
