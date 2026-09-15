import { nanoid } from 'nanoid';

/**
 * Generates a unique URL-friendly ID with optional prefix.
 */
export function generateId(prefix?: string): string {
  const id = nanoid(12);
  return prefix ? `${prefix}_${id}` : id;
}
