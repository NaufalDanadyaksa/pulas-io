import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from '../schemas/auth.schema';

describe('Auth Schemas', () => {
  describe('loginSchema', () => {
    it('menerima kredensial valid', () => {
      const result = loginSchema.safeParse({
        email: 'user@pulas.io',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('menolak format email tidak valid', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('Format email tidak valid');
      }
    });

    it('menolak password kurang dari 8 karakter', () => {
      const result = loginSchema.safeParse({
        email: 'user@pulas.io',
        password: '123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('minimal 8 karakter');
      }
    });
  });

  describe('registerSchema', () => {
    it('menerima input registrasi valid', () => {
      const result = registerSchema.safeParse({
        displayName: 'Budi Kreatif',
        email: 'budi@pulas.io',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('menolak konfirmasi password yang tidak cocok', () => {
      const result = registerSchema.safeParse({
        displayName: 'Budi Kreatif',
        email: 'budi@pulas.io',
        password: 'password123',
        confirmPassword: 'differentpassword',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('Konfirmasi password tidak sesuai');
      }
    });

    it('menolak nama kurang dari 2 karakter', () => {
      const result = registerSchema.safeParse({
        displayName: 'A',
        email: 'budi@pulas.io',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('Nama minimal 2 karakter');
      }
    });
  });

  describe('resetPasswordSchema', () => {
    it('menerima email yang valid', () => {
      const result = resetPasswordSchema.safeParse({
        email: 'reset@pulas.io',
      });
      expect(result.success).toBe(true);
    });

    it('menolak format email yang salah', () => {
      const result = resetPasswordSchema.safeParse({
        email: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updatePasswordSchema', () => {
    it('menerima password baru yang sesuai konfirmasi', () => {
      const result = updatePasswordSchema.safeParse({
        password: 'new-password-123',
        confirmPassword: 'new-password-123',
      });
      expect(result.success).toBe(true);
    });

    it('menolak konfirmasi password yang berbeda', () => {
      const result = updatePasswordSchema.safeParse({
        password: 'new-password-123',
        confirmPassword: 'different-password',
      });
      expect(result.success).toBe(false);
    });
  });
});
