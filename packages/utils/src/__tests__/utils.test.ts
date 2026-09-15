import { describe, it, expect } from 'vitest';
import { cn } from '../cn';
import { generateUserColor } from '../color';
import { formatDate, formatRelativeTime } from '../date';
import { generateId } from '../id';

describe('cn()', () => {
  it('merges class names correctly', () => {
    expect(cn('px-2 py-1', 'bg-blue-500')).toBe('px-2 py-1 bg-blue-500');
  });

  it('handles conditional classes properly', () => {
    const isPrimary = false;
    const isLarge = true;
    expect(cn('base-btn', isPrimary && 'bg-primary', isLarge && 'text-lg')).toBe('base-btn text-lg');
  });

  it('resolves conflicting tailwind classes', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });
});

describe('generateUserColor()', () => {
  it('returns deterministic color for the same user id', () => {
    const colorA = generateUserColor('user-12345');
    const colorB = generateUserColor('user-12345');
    expect(colorA).toBe(colorB);
    expect(colorA).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it('handles empty input gracefully', () => {
    const color = generateUserColor('');
    expect(color).toMatch(/^#[0-9A-F]{6}$/i);
  });
});

describe('formatDate() & formatRelativeTime()', () => {
  it('formats dates consistently', () => {
    const date = new Date('2026-01-15T10:00:00Z');
    expect(formatDate(date)).toContain('2026');
  });

  it('handles invalid dates gracefully', () => {
    expect(formatDate('invalid-date')).toBe('');
    expect(formatRelativeTime('invalid-date')).toBe('');
  });

  it('returns relative time for recent events', () => {
    const now = Date.now();
    expect(formatRelativeTime(now - 1000)).toBe('just now');
    expect(formatRelativeTime(now - 60000)).toBe('1m ago');
    expect(formatRelativeTime(now - 3600000)).toBe('1h ago');
  });
});

describe('generateId()', () => {
  it('generates unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
    expect(id1.length).toBeGreaterThan(0);
  });

  it('supports prefix', () => {
    const id = generateId('elem');
    expect(id.startsWith('elem_')).toBe(true);
  });
});
