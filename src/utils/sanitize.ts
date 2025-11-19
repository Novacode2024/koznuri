import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param dirty - The HTML string to sanitize
 * @returns Sanitized HTML string safe for dangerouslySetInnerHTML
 */
export const sanitizeHtml = (dirty: string | null | undefined): string => {
  if (!dirty) {
    return '';
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
      'img',
      'div',
      'span',
      'blockquote',
      'code',
      'pre',
      'table',
      'thead',
      'tbody',
      'tr',
      'td',
      'th',
      'svg',
      'path',
      'circle',
      'rect',
      'line',
      'polyline',
      'polygon',
      'g',
      'defs',
      'use',
    ],
    ALLOWED_ATTR: [
      'href',
      'src',
      'alt',
      'title',
      'class',
      'id',
      'target',
      'rel',
      'style',
      'width',
      'height',
      'viewBox',
      'xmlns',
      'fill',
      'stroke',
      'stroke-width',
      'stroke-linecap',
      'stroke-linejoin',
      'd',
      'cx',
      'cy',
      'r',
      'x',
      'y',
      'x1',
      'y1',
      'x2',
      'y2',
      'points',
      'preserveAspectRatio',
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
};

