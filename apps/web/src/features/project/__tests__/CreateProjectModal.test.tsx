import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateProjectModal } from '../components/CreateProjectModal';

const mockMutateAsync = vi.fn();

vi.mock('../hooks/useProjectMutations', () => ({
  useCreateProject: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

describe('CreateProjectModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('merender modal ketika open=true dengan elemen form yang lengkap', () => {
    render(<CreateProjectModal open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByText('Buat Project Baru')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nama Project/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Deskripsi/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Buat Project/i })).toBeInTheDocument();
  });

  it('tidak merender konten ketika open=false', () => {
    render(<CreateProjectModal open={false} onOpenChange={vi.fn()} />);

    expect(screen.queryByText('Buat Project Baru')).not.toBeInTheDocument();
  });

  it('menampilkan error validasi ketika submit nama kosong', async () => {
    render(<CreateProjectModal open={true} onOpenChange={vi.fn()} />);

    const submitBtn = screen.getByRole('button', { name: /Buat Project/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Nama project wajib diisi')).toBeInTheDocument();
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('mengirim form ketika input nama diisi dan memicu onSuccess', async () => {
    const handleSuccess = vi.fn();
    const handleOpenChange = vi.fn();
    mockMutateAsync.mockResolvedValue({ id: 'new-proj-1', name: 'Design Sprint' });

    render(
      <CreateProjectModal
        open={true}
        onOpenChange={handleOpenChange}
        onSuccess={handleSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/Nama Project/i);
    fireEvent.change(nameInput, { target: { value: 'Design Sprint' } });

    // Pilih salah satu warna
    const colorBtn = screen.getByRole('radio', { name: /Pilih warna #10b981/i });
    fireEvent.click(colorBtn);

    // Pilih salah satu ikon
    const iconBtn = screen.getByRole('radio', { name: /Pilih ikon palette/i });
    fireEvent.click(iconBtn);

    const submitBtn = screen.getByRole('button', { name: /Buat Project/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: 'Design Sprint',
        description: '',
        color: '#10b981',
        icon: 'palette',
      });
      expect(handleOpenChange).toHaveBeenCalledWith(false);
      expect(handleSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('menutup modal ketika tombol Batal diklik', () => {
    const handleOpenChange = vi.fn();
    render(<CreateProjectModal open={true} onOpenChange={handleOpenChange} />);

    const cancelBtn = screen.getByRole('button', { name: /Batal/i });
    fireEvent.click(cancelBtn);

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});
