// FitSync Consolidated Shared Utilities
// Eliminates repetitive date formatting, string escaping, and class names merging

/**
 * Merges CSS class names with conditional evaluations
 */
export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format timestamp to friendly local representation
 */
export function formatFriendlyDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Deep clone utility for safely replicating complex payloads
 */
export function safeClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Truncate characters safely
 */
export function truncateString(str: string, maxLength = 60): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}
