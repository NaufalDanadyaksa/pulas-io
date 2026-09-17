import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectCard } from '../components/ProjectCard';
import type { ProjectWithRelations } from '../types/project.types';

const mockProject: ProjectWithRelations = {
  id: 'proj-123',
  name: 'Alpha Project',
  description: 'Proyek desain sistem visual',
  color: '#6366f1',
  icon: 'palette',
  owner_id: 'user-1',
  created_at: '2026-09-10T10:00:00Z',
  updated_at: '2026-09-15T12:00:00Z',
  canvases: [
    {
      id: 'canvas-1',
      name: 'Flowchart 1',
      thumbnail_url: null,
      updated_at: '2026-09-15T12:00:00Z',
      deleted_at: null,
    },
    {
      id: 'canvas-2',
      name: 'Wireframe 2',
      thumbnail_url: null,
      updated_at: '2026-09-14T10:00:00Z',
      deleted_at: null,
    },
  ],
  project_members: [
    { user_id: 'user-1', role: 'admin' },
    { user_id: 'user-2', role: 'editor' },
  ],
};

describe('ProjectCard', () => {
  it('merender informasi project dengan benar', () => {
    render(<ProjectCard project={mockProject} />);

    expect(screen.getByText('Alpha Project')).toBeInTheDocument();
    expect(screen.getByText('Proyek desain sistem visual')).toBeInTheDocument();
    expect(screen.getByText('2 canvases')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 members
  });

  it('memiliki atribut aksesibilitas yang benar (role="button", tabIndex, id, aria-label)', () => {
    render(<ProjectCard project={mockProject} />);

    const card = screen.getByRole('button', { name: /Buka project Alpha Project/i });
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('id', 'project-card-proj-123');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('memanggil onSelect saat kartu diklik', () => {
    const handleSelect = vi.fn();
    render(<ProjectCard project={mockProject} onSelect={handleSelect} />);

    const card = screen.getByRole('button', { name: /Buka project Alpha Project/i });
    fireEvent.click(card);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(mockProject);
  });

  it('memanggil onSelect saat tombol Enter atau Spasi ditekan', () => {
    const handleSelect = vi.fn();
    render(<ProjectCard project={mockProject} onSelect={handleSelect} />);

    const card = screen.getByRole('button', { name: /Buka project Alpha Project/i });
    fireEvent.keyDown(card, { key: 'Enter' });
    fireEvent.keyDown(card, { key: ' ' });

    expect(handleSelect).toHaveBeenCalledTimes(2);
  });

  it('memanggil onEdit, onDuplicate, dan onDelete tanpa memicu onSelect (stop propagation)', () => {
    const handleSelect = vi.fn();
    const handleEdit = vi.fn();
    const handleDuplicate = vi.fn();
    const handleDelete = vi.fn();

    render(
      <ProjectCard
        project={mockProject}
        onSelect={handleSelect}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />
    );

    const editBtn = screen.getByRole('button', { name: /Edit project Alpha Project/i });
    const duplicateBtn = screen.getByRole('button', {
      name: /Duplikasi project Alpha Project/i,
    });
    const deleteBtn = screen.getByRole('button', { name: /Hapus project Alpha Project/i });

    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalledTimes(1);
    expect(handleSelect).not.toHaveBeenCalled();

    fireEvent.click(duplicateBtn);
    expect(handleDuplicate).toHaveBeenCalledTimes(1);
    expect(handleSelect).not.toHaveBeenCalled();

    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalledTimes(1);
    expect(handleSelect).not.toHaveBeenCalled();
  });
});
