import { describe, it, expect } from 'vitest';
import {
  createProjectSchema,
  updateProjectSchema,
  PROJECT_COLOR_PRESETS,
  PROJECT_ICON_NAMES,
} from '../schemas/project.schema';

describe('Project Schemas', () => {
  describe('createProjectSchema', () => {
    it('menerima input project yang valid dengan default values', () => {
      const result = createProjectSchema.safeParse({
        name: 'My Design System',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('My Design System');
        expect(result.data.color).toBe('#6366f1');
        expect(result.data.icon).toBe('folder');
      }
    });

    it('menerima input lengkap dengan semua field', () => {
      const result = createProjectSchema.safeParse({
        name: 'Pulas Whiteboard',
        description: 'Collaborative sketching project',
        color: '#10b981',
        icon: 'palette',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Pulas Whiteboard');
        expect(result.data.description).toBe('Collaborative sketching project');
        expect(result.data.color).toBe('#10b981');
        expect(result.data.icon).toBe('palette');
      }
    });

    it('menolak nama project yang kosong atau hanya spasi', () => {
      const result = createProjectSchema.safeParse({
        name: '   ',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('Nama project wajib diisi');
      }
    });

    it('menolak nama project yang melebihi 100 karakter', () => {
      const longName = 'a'.repeat(101);
      const result = createProjectSchema.safeParse({
        name: longName,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('maksimal 100 karakter');
      }
    });

    it('menolak deskripsi yang melebihi 500 karakter', () => {
      const longDesc = 'd'.repeat(501);
      const result = createProjectSchema.safeParse({
        name: 'Valid Name',
        description: longDesc,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('maksimal 500 karakter');
      }
    });

    it('menolak format hex color yang tidak valid', () => {
      const invalidColors = ['red', '#12345', '#gggggg', '123456', '#1234567'];
      for (const color of invalidColors) {
        const result = createProjectSchema.safeParse({
          name: 'Valid Name',
          color,
        });
        expect(result.success).toBe(false);
      }
    });

    it('menerima format 3-digit dan 6-digit hex color', () => {
      expect(
        createProjectSchema.safeParse({ name: 'Valid', color: '#fff' }).success
      ).toBe(true);
      expect(
        createProjectSchema.safeParse({ name: 'Valid', color: '#10b981' }).success
      ).toBe(true);
    });

    it('menyediakan preset warna dan ikon yang lengkap', () => {
      expect(PROJECT_COLOR_PRESETS.length).toBe(12);
      expect(PROJECT_ICON_NAMES.length).toBe(12);
      expect(PROJECT_COLOR_PRESETS).toContain('#6366f1');
      expect(PROJECT_ICON_NAMES).toContain('folder');
    });
  });

  describe('updateProjectSchema', () => {
    it('menerima payload parsial update', () => {
      const result = updateProjectSchema.safeParse({
        name: 'Updated Name Only',
      });
      expect(result.success).toBe(true);
    });

    it('menerima update warna dan ikon saja', () => {
      const result = updateProjectSchema.safeParse({
        color: '#f97316',
        icon: 'zap',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.color).toBe('#f97316');
        expect(result.data.icon).toBe('zap');
      }
    });

    it('menolak nama jika disediakan string kosong', () => {
      const result = updateProjectSchema.safeParse({
        name: '',
      });
      expect(result.success).toBe(false);
    });
  });
});
