import { z } from 'zod';

export const PROJECT_COLOR_PRESETS = [
  '#6366f1', // Indigo (Default)
  '#3b82f6', // Blue
  '#0ea5e9', // Sky
  '#10b981', // Emerald
  '#14b8a6', // Teal
  '#84cc16', // Lime
  '#f59e0b', // Amber
  '#f97316', // Orange
  '#ef4444', // Red
  '#ec4899', // Pink
  '#a855f7', // Purple
  '#64748b', // Slate
] as const;

export const PROJECT_ICON_NAMES = [
  'folder',
  'palette',
  'layout',
  'briefcase',
  'star',
  'code',
  'book',
  'box',
  'zap',
  'globe',
  'smile',
  'coffee',
] as const;

export type ProjectIconName = (typeof PROJECT_ICON_NAMES)[number];

const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nama project wajib diisi')
    .max(100, 'Nama project maksimal 100 karakter'),
  description: z
    .string()
    .trim()
    .max(500, 'Deskripsi project maksimal 500 karakter')
    .optional()
    .or(z.literal('')),
  color: z
    .string()
    .regex(hexColorRegex, 'Format warna heksadesimal tidak valid (contoh: #6366f1)')
    .default('#6366f1'),
  icon: z
    .string()
    .min(1, 'Ikon wajib dipilih')
    .default('folder'),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nama project wajib diisi')
    .max(100, 'Nama project maksimal 100 karakter')
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, 'Deskripsi project maksimal 500 karakter')
    .optional()
    .or(z.literal('')),
  color: z
    .string()
    .regex(hexColorRegex, 'Format warna heksadesimal tidak valid (contoh: #6366f1)')
    .optional(),
  icon: z
    .string()
    .min(1, 'Ikon tidak boleh kosong')
    .optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
