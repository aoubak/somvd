import { describe, expect, it } from 'vitest';
import { isEditableTarget, linkFromPaste } from './globalPaste';

const body = { tagName: 'BODY', isContentEditable: false };

describe('isEditableTarget', () => {
  it('treats inputs, textareas, selects and contenteditable as editable', () => {
    expect(isEditableTarget({ tagName: 'INPUT' })).toBe(true);
    expect(isEditableTarget({ tagName: 'TEXTAREA' })).toBe(true);
    expect(isEditableTarget({ tagName: 'SELECT' })).toBe(true);
    expect(isEditableTarget({ tagName: 'DIV', isContentEditable: true })).toBe(true);
    expect(isEditableTarget(body)).toBe(false);
    expect(isEditableTarget(null)).toBe(false);
  });
});

describe('linkFromPaste', () => {
  it('returns a trimmed http(s) link pasted onto the page', () => {
    expect(linkFromPaste(body, '  https://youtu.be/abc \n')).toBe('https://youtu.be/abc');
  });

  it('ignores pastes into text fields', () => {
    expect(linkFromPaste({ tagName: 'INPUT' }, 'https://youtu.be/abc')).toBeNull();
    expect(linkFromPaste({ tagName: 'DIV', isContentEditable: true }, 'https://youtu.be/abc')).toBeNull();
  });

  it('ignores text that is not a single link', () => {
    expect(linkFromPaste(body, 'hello world')).toBeNull();
    expect(linkFromPaste(body, 'ftp://example.com/file')).toBeNull();
    expect(linkFromPaste(body, 'https://a.com/x https://b.com/y')).toBeNull();
    expect(linkFromPaste(body, '')).toBeNull();
    expect(linkFromPaste(body, undefined)).toBeNull();
  });
});
