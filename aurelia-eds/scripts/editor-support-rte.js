/**
 * Universal Editor — Rich Text Editor sanitisation bridge.
 * Wires DOMPurify for safe HTML when authoring rich text fields.
 */

import DOMPurify from './dompurify.min.js';

export function sanitizeRTE(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}
