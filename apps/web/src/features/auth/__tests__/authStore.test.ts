import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      })),
    },
  },
}));

describe('authStore', () => {
  const mockUser: User = {
    id: 'user-id-123',
    app_metadata: {},
    user_metadata: { full_name: 'Budi Santoso' },
    aud: 'authenticated',
    created_at: '2026-09-16T00:00:00Z',
    email: 'budi@pulas.io',
  };

  const mockSession: Session = {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: true,
      isInitialized: false,
    });
  });

  it('memiliki initial state yang benar', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.isLoading).toBe(true);
    expect(state.isInitialized).toBe(false);
  });

  it('mengisi user dan session saat initialize dengan session aktif', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    await useAuthStore.getState().initialize();

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.session).toEqual(mockSession);
    expect(state.isLoading).toBe(false);
    expect(state.isInitialized).toBe(true);
  });

  it('mengosongkan state saat signOut dipanggil', async () => {
    useAuthStore.setState({
      user: mockUser,
      session: mockSession,
      isLoading: false,
      isInitialized: true,
    });

    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

    await useAuthStore.getState().signOut();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
  });
});
