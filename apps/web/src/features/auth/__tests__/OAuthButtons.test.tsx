import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OAuthButtons } from '../components/OAuthButtons';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: vi.fn(),
    },
  },
}));

describe('OAuthButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('merender tombol Google dan GitHub', () => {
    render(<OAuthButtons />);
    expect(
      screen.getByRole('button', { name: /lanjutkan dengan google/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /lanjutkan dengan github/i })
    ).toBeInTheDocument();
  });

  it('memanggil signInWithOAuth saat tombol Google diklik', async () => {
    vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
      data: { provider: 'google', url: 'https://accounts.google.com' },
      error: null,
    });

    render(<OAuthButtons />);
    fireEvent.click(
      screen.getByRole('button', { name: /lanjutkan dengan google/i })
    );

    await waitFor(() => {
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'google',
        })
      );
    });
  });

  it('memanggil signInWithOAuth saat tombol GitHub diklik', async () => {
    vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
      data: { provider: 'github', url: 'https://github.com/login/oauth' },
      error: null,
    });

    render(<OAuthButtons />);
    fireEvent.click(
      screen.getByRole('button', { name: /lanjutkan dengan github/i })
    );

    await waitFor(() => {
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'github',
        })
      );
    });
  });

  it('memanggil onError callback saat signInWithOAuth gagal', async () => {
    const onError = vi.fn();
    vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
      data: { provider: 'google', url: null },
      error: new Error('OAuth connection failed') as never,
    });

    render(<OAuthButtons onError={onError} />);
    fireEvent.click(
      screen.getByRole('button', { name: /lanjutkan dengan google/i })
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('OAuth connection failed');
    });
  });
});
