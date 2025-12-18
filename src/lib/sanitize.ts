import DOMPurify from 'dompurify';

/**
 * Sanitize user input to prevent XSS attacks
 * Removes all HTML tags and attributes
 */
export const sanitizeInput = (input: string | null | undefined): string => {
  if (!input) return '';
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

/**
 * Sanitize HTML content allowing only safe formatting tags
 */
export const sanitizeHTML = (html: string | null | undefined): string => {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
    ALLOWED_ATTR: []
  });
};

/**
 * Escape special characters for CSV export
 */
export const escapeCSV = (value: string | null | undefined): string => {
  if (!value) return '';
  const sanitized = sanitizeInput(value);
  return sanitized.replace(/"/g, '""');
};
