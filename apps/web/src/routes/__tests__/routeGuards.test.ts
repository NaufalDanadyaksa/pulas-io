import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isRedirect } from '@tanstack/react-router';
import { requireAuthGuard } from '../_authenticated';
import { useAuthStore } from '@/stores/authStore';
import type { User, Session } from '@supabase/supabase-js';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: { unsubscribe: vi.fn() },
        },
      })),
    },
  },
}));

describe('Route Guards', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: false,
      isInitialized: true,
    });
  });

  it('requireAuthGuard melempar redirect ke /login jika user belum terautentikasi', async () => {
    let thrownError: unknown = null;
    try {
      await requireAuthGuard();
    } catch (err) {
      thrownError = err;
    }

    expect(thrownError).toBeDefined();
    expect(isRedirect(thrownError)).toBe(true);
    expect((thrownError as { options: { to: string } }).options.to).toBe('/login');
  });

  it('requireAuthGuard tidak melempar error jika user sudah terautentikasi', async () => {
    const mockUser: User = {
      id: 'user-auth-123',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2026-09-16T00:00:00Z',
      email: 'user@pulas.io',
    };

    useAuthStore.setState({
      user: mockUser,
      session: {} as Session,
      isLoading: false,
      isInitialized: true,
    });

    await expect(requireAuthGuard()).resolves.toBeUndefined();
  });
});
