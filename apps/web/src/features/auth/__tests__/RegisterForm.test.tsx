import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterForm } from '../components/RegisterForm';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
    },
  },
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('merender semua input pendaftaran dan tombol submit', () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/nama lengkap/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/alamat email/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/^kata sandi \(min\. 8 karakter\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/konfirmasi kata sandi/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /daftar akun/i })
    ).toBeInTheDocument();
  });

  it('menolak pengiriman ketika konfirmasi password berbeda', async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/nama lengkap/i), {
      target: { value: 'Budi Santoso' },
    });
    fireEvent.change(screen.getByLabelText(/alamat email/i), {
      target: { value: 'budi@pulas.io' },
    });
    fireEvent.change(
      screen.getByLabelText(/^kata sandi \(min\. 8 karakter\)/i),
      {
        target: { value: 'password123' },
      }
    );
    fireEvent.change(screen.getByLabelText(/konfirmasi kata sandi/i), {
      target: { value: 'berbeda123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /daftar akun/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/konfirmasi password tidak sesuai/i)
      ).toBeInTheDocument();
    });
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });

  it('memanggil signUp dengan metadata full_name yang sesuai', async () => {
    const onSuccess = vi.fn();
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: {
        user: { id: 'u1' } as never,
        session: { access_token: 'tk' } as never,
      },
      error: null,
    });

    render(<RegisterForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/nama lengkap/i), {
      target: { value: 'Budi Santoso' },
    });
    fireEvent.change(screen.getByLabelText(/alamat email/i), {
      target: { value: 'budi@pulas.io' },
    });
    fireEvent.change(
      screen.getByLabelText(/^kata sandi \(min\. 8 karakter\)/i),
      {
        target: { value: 'password123' },
      }
    );
    fireEvent.change(screen.getByLabelText(/konfirmasi kata sandi/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /daftar akun/i }));

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'budi@pulas.io',
        password: 'password123',
        options: {
          data: {
            full_name: 'Budi Santoso',
          },
        },
      });
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('menampilkan banner cek email jika pendaftaran membutuhkan verifikasi', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: {
        user: { id: 'u1' } as never,
        session: null,
      },
      error: null,
    });

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/nama lengkap/i), {
      target: { value: 'Budi Santoso' },
    });
    fireEvent.change(screen.getByLabelText(/alamat email/i), {
      target: { value: 'budi@pulas.io' },
    });
    fireEvent.change(
      screen.getByLabelText(/^kata sandi \(min\. 8 karakter\)/i),
      {
        target: { value: 'password123' },
      }
    );
    fireEvent.change(screen.getByLabelText(/konfirmasi kata sandi/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /daftar akun/i }));

    await waitFor(() => {
      expect(screen.getByText(/cek email anda/i)).toBeInTheDocument();
      expect(
        screen.getByText(/tautan konfirmasi pendaftaran/i)
      ).toBeInTheDocument();
    });
  });
});
