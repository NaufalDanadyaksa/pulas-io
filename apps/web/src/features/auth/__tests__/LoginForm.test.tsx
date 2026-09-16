import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginForm } from '../components/LoginForm';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('merender elemen form dengan atribut aksesibilitas yang benar', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/alamat email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/kata sandi/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /masuk/i })
    ).toBeInTheDocument();
  });

  it('menampilkan error validasi ketika submit dengan input kosong', async () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole('button', { name: /masuk/i }));

    await waitFor(() => {
      expect(screen.getByText(/email wajib diisi/i)).toBeInTheDocument();
    });
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('memanggil signInWithPassword dan memicu onSuccess saat kredensial valid', async () => {
    const onSuccess = vi.fn();
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: {} as never, session: {} as never },
      error: null,
    });

    render(<LoginForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/alamat email/i), {
      target: { value: 'user@pulas.io' },
    });
    fireEvent.change(screen.getByLabelText(/kata sandi/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /masuk/i }));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'user@pulas.io',
        password: 'password123',
      });
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('menampilkan pesan error saat signInWithPassword gagal', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: new Error('Invalid login credentials') as never,
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/alamat email/i), {
      target: { value: 'user@pulas.io' },
    });
    fireEvent.change(screen.getByLabelText(/kata sandi/i), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /masuk/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Invalid login credentials'
      );
    });
  });
});
