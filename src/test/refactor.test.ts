// Unit tests for Consolidated shared utilities
// File: src/test/refactor.test.ts

import { describe, it, expect } from 'vitest';
import { cn, formatFriendlyDate, safeClone, truncateString } from '../services/utils/shared';
import { FITSYNC_CONFIG } from '../services/utils/config';

describe('Shared Utility helper functions', () => {
  it('cn() merges string and boolean classes correctly', () => {
    const res = cn('bg-red-500', false && 'text-white', 'p-4');
    expect(res).toBe('bg-red-500 p-4');
  });

  it('formatFriendlyDate() yields expected date layout', () => {
    const formatted = formatFriendlyDate('2026-07-25T12:00:00Z');
    expect(formatted).toContain('2026');
  });

  it('safeClone() creates deep copy reference', () => {
    const original = { a: { b: 2 } };
    const cloned = safeClone(original);
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
  });

  it('truncateString() clips exceeding lengths', () => {
    const str = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
    const clipped = truncateString(str, 10);
    expect(clipped).toBe('Lorem ipsu...');
  });

  it('FITSYNC_CONFIG loads constants correctly', () => {
    expect(FITSYNC_CONFIG.VERSION).toBe('1.4.0');
    expect(FITSYNC_CONFIG.MAX_FILE_SIZE_BYTES).toBe(5 * 1024 * 1024);
  });
});
