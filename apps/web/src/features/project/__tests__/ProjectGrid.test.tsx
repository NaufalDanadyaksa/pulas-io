import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectGrid } from '../components/ProjectGrid';
import type { ProjectWithRelations } from '../types/project.types';

const mockProjects: ProjectWithRelations[] = [
  {
    id: 'p-1',
    name: 'Zeta Project',
    description: 'Aplikasi Zeta',
    color: '#6366f1',
    icon: 'folder',
    owner_id: 'user-1',
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-05T10:00:00Z',
    canvases: [],
  },
  {
    id: 'p-2',
    name: 'Alpha Project',
    description: 'Frontend Pulas',
    color: '#10b981',
    icon: 'palette',
    owner_id: 'user-1',
    created_at: '2026-09-03T10:00:00Z',
    updated_at: '2026-09-15T10:00:00Z',
    canvases: [{ id: 'c-1', name: 'Board', thumbnail_url: null, updated_at: '2026-09-15T10:00:00Z', deleted_at: null }],
  },
  {
    id: 'p-3',
    name: 'Beta Project',
    description: 'Database design',
    color: '#f59e0b',
    icon: 'box',
    owner_id: 'user-1',
    created_at: '2026-09-02T10:00:00Z',
    updated_at: '2026-09-10T10:00:00Z',
    canvases: [],
  },
];

describe('ProjectGrid', () => {
  it('merender loading skeleton ketika isLoading bernilai true', () => {
    render(
      <ProjectGrid
        projects={[]}
        isLoading={true}
        searchQuery=""
        sortBy="updated_desc"
        currentPage={1}
        onSearchChange={vi.fn()}
        onSortChange={vi.fn()}
        onPageChange={vi.fn()}
        onCreateProject={vi.fn()}
      />
    );

    expect(screen.getByTestId('project-loading-grid')).toBeInTheDocument();
    expect(screen.getAllByTestId('project-card-skeleton').length).toBe(6);
  });

  it('merender empty state ketika belum ada project', () => {
    const handleCreate = vi.fn();
    render(
      <ProjectGrid
        projects={[]}
        isLoading={false}
        searchQuery=""
        sortBy="updated_desc"
        currentPage={1}
        onSearchChange={vi.fn()}
        onSortChange={vi.fn()}
        onPageChange={vi.fn()}
        onCreateProject={handleCreate}
      />
    );

    expect(screen.getByText('Belum ada project')).toBeInTheDocument();
    const ctaBtn = screen.getByRole('button', { name: /Buat Project Pertama/i });
    fireEvent.click(ctaBtn);
    expect(handleCreate).toHaveBeenCalledTimes(1);
  });

  it('merender kartu project dan mengurutkan secara default (updated_desc)', () => {
    render(
      <ProjectGrid
        projects={mockProjects}
        isLoading={false}
        searchQuery=""
        sortBy="updated_desc"
        currentPage={1}
        onSearchChange={vi.fn()}
        onSortChange={vi.fn()}
        onPageChange={vi.fn()}
        onCreateProject={vi.fn()}
      />
    );

    const projectCards = screen.getAllByRole('button', { name: /Buka project/i });
    expect(projectCards.length).toBe(3);
    // updated_desc: p-2 (Sep 15), p-3 (Sep 10), p-1 (Sep 5)
    expect(projectCards[0]).toHaveTextContent('Alpha Project');
    expect(projectCards[1]).toHaveTextContent('Beta Project');
    expect(projectCards[2]).toHaveTextContent('Zeta Project');
  });

  it('mengurutkan berdasarkan nama (A-Z) ketika sortBy="name_asc"', () => {
    render(
      <ProjectGrid
        projects={mockProjects}
        isLoading={false}
        searchQuery=""
        sortBy="name_asc"
        currentPage={1}
        onSearchChange={vi.fn()}
        onSortChange={vi.fn()}
        onPageChange={vi.fn()}
        onCreateProject={vi.fn()}
      />
    );

    const projectCards = screen.getAllByRole('button', { name: /Buka project/i });
    expect(projectCards[0]).toHaveTextContent('Alpha Project');
    expect(projectCards[1]).toHaveTextContent('Beta Project');
    expect(projectCards[2]).toHaveTextContent('Zeta Project');
  });

  it('memfilter project berdasarkan search query', () => {
    render(
      <ProjectGrid
        projects={mockProjects}
        isLoading={false}
        searchQuery="Database"
        sortBy="updated_desc"
        currentPage={1}
        onSearchChange={vi.fn()}
        onSortChange={vi.fn()}
        onPageChange={vi.fn()}
        onCreateProject={vi.fn()}
      />
    );

    expect(screen.getByText('Beta Project')).toBeInTheDocument();
    expect(screen.queryByText('Alpha Project')).not.toBeInTheDocument();
    expect(screen.queryByText('Zeta Project')).not.toBeInTheDocument();
  });

  it('merender tampilan tidak ada hasil jika pencarian nihil', () => {
    const handleSearchChange = vi.fn();
    render(
      <ProjectGrid
        projects={mockProjects}
        isLoading={false}
        searchQuery="KataKunciTidakAda"
        sortBy="updated_desc"
        currentPage={1}
        onSearchChange={handleSearchChange}
        onSortChange={vi.fn()}
        onPageChange={vi.fn()}
        onCreateProject={vi.fn()}
      />
    );

    expect(screen.getByText('Tidak ada project yang cocok')).toBeInTheDocument();
    const clearBtn = screen.getByRole('button', { name: /Hapus Pencarian/i });
    fireEvent.click(clearBtn);
    expect(handleSearchChange).toHaveBeenCalledWith('');
  });

  it('mendukung navigasi paginasi ketika data melebihi pageSize', () => {
    const handlePageChange = vi.fn();
    render(
      <ProjectGrid
        projects={mockProjects}
        isLoading={false}
        searchQuery=""
        sortBy="updated_desc"
        currentPage={1}
        pageSize={2}
        onSearchChange={vi.fn()}
        onSortChange={vi.fn()}
        onPageChange={handlePageChange}
        onCreateProject={vi.fn()}
      />
    );

    // Menampilkan 2 project di halaman 1
    const cards = screen.getAllByRole('button', { name: /Buka project/i });
    expect(cards.length).toBe(2);

    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    const nextBtn = screen.getByRole('button', { name: /Halaman berikutnya/i });
    fireEvent.click(nextBtn);
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });
});
