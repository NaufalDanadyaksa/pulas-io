import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectUIStore } from '../stores/projectUIStore';
import type { ProjectWithRelations } from '../types/project.types';

const mockProject: ProjectWithRelations = {
  id: 'proj-1',
  name: 'Store Test Project',
  description: 'Test',
  color: '#6366f1',
  icon: 'folder',
  owner_id: 'user-1',
  created_at: '2026-09-10T10:00:00Z',
  updated_at: '2026-09-10T10:00:00Z',
};

describe('projectUIStore', () => {
  beforeEach(() => {
    useProjectUIStore.getState().resetFilters();
    useProjectUIStore.getState().closeCreateModal();
    useProjectUIStore.getState().closeEditModal();
    useProjectUIStore.getState().closeDeleteModal();
  });

  it('mengatur initial state dengan benar', () => {
    const state = useProjectUIStore.getState();
    expect(state.searchQuery).toBe('');
    expect(state.sortBy).toBe('updated_desc');
    expect(state.currentPage).toBe(1);
    expect(state.isCreateModalOpen).toBe(false);
    expect(state.editingProject).toBe(null);
    expect(state.deletingProject).toBe(null);
  });

  it('mengupdate searchQuery dan mereset currentPage ke 1', () => {
    useProjectUIStore.getState().setCurrentPage(3);
    expect(useProjectUIStore.getState().currentPage).toBe(3);

    useProjectUIStore.getState().setSearchQuery('Wireframe');
    expect(useProjectUIStore.getState().searchQuery).toBe('Wireframe');
    expect(useProjectUIStore.getState().currentPage).toBe(1);
  });

  it('mengupdate sortBy dan mereset currentPage ke 1', () => {
    useProjectUIStore.getState().setCurrentPage(2);
    useProjectUIStore.getState().setSortBy('name_asc');
    expect(useProjectUIStore.getState().sortBy).toBe('name_asc');
    expect(useProjectUIStore.getState().currentPage).toBe(1);
  });

  it('mengatur modal create, edit, dan delete', () => {
    const store = useProjectUIStore.getState();

    // Create modal
    store.openCreateModal();
    expect(useProjectUIStore.getState().isCreateModalOpen).toBe(true);
    store.closeCreateModal();
    expect(useProjectUIStore.getState().isCreateModalOpen).toBe(false);

    // Edit modal
    store.openEditModal(mockProject);
    expect(useProjectUIStore.getState().editingProject).toEqual(mockProject);
    store.closeEditModal();
    expect(useProjectUIStore.getState().editingProject).toBe(null);

    // Delete modal
    store.openDeleteModal(mockProject);
    expect(useProjectUIStore.getState().deletingProject).toEqual(mockProject);
    store.closeDeleteModal();
    expect(useProjectUIStore.getState().deletingProject).toBe(null);
  });
});
