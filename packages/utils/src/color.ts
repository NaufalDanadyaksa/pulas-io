const COLLABORATOR_PALETTE = [
  '#F43F5E', // Rose
  '#EC4899', // Pink
  '#D946EF', // Fuchsia
  '#A855F7', // Purple
  '#8B5CF6', // Violet
  '#6366F1', // Indigo
  '#3B82F6', // Blue
  '#0EA5E9', // Sky
  '#06B6D4', // Cyan
  '#14B8A6', // Teal
  '#10B981', // Emerald
  '#22C55E', // Green
  '#84CC16', // Lime
  '#EAB308', // Yellow
  '#F97316', // Orange
  '#EF4444', // Red
];

/**
 * Deterministically generates a vibrant HEX color from a user ID or string.
 */
export function generateUserColor(userId: string): string {
  if (!userId) return COLLABORATOR_PALETTE[0]!;

  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }

  const index = Math.abs(hash) % COLLABORATOR_PALETTE.length;
  return COLLABORATOR_PALETTE[index]!;
}
