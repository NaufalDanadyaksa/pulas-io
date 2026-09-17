import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ProjectWithRelations, ProjectSortOption } from '../types/project.types';

interface ProjectUIState {
  searchQuery: string;
  sortBy: ProjectSortOption;
  currentPage: number;
  isCreateModalOpen: boolean;
  editingProject: ProjectWithRelations | null;
  deletingProject: ProjectWithRelations | null;

  // Actions
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: ProjectSortOption) => void;
  setCurrentPage: (page: number) => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (project: ProjectWithRelations) => void;
  closeEditModal: () => void;
  openDeleteModal: (project: ProjectWithRelations) => void;
  closeDeleteModal: () => void;
  resetFilters: () => void;
}

export const useProjectUIStore = create<ProjectUIState>()(
  immer((set) => ({
    searchQuery: '',
    sortBy: 'updated_desc',
    currentPage: 1,
    isCreateModalOpen: false,
    editingProject: null,
    deletingProject: null,

    setSearchQuery: (query) =>
      set((state) => {
        state.searchQuery = query;
        state.currentPage = 1; // Reset to first page on search
      }),

    setSortBy: (sort) =>
      set((state) => {
        state.sortBy = sort;
        state.currentPage = 1;
      }),

    setCurrentPage: (page) =>
      set((state) => {
        state.currentPage = page;
      }),

    openCreateModal: () =>
      set((state) => {
        state.isCreateModalOpen = true;
      }),

    closeCreateModal: () =>
      set((state) => {
        state.isCreateModalOpen = false;
      }),

    openEditModal: (project) =>
      set((state) => {
        state.editingProject = project;
      }),

    closeEditModal: () =>
      set((state) => {
        state.editingProject = null;
      }),

    openDeleteModal: (project) =>
      set((state) => {
        state.deletingProject = project;
      }),

    closeDeleteModal: () =>
      set((state) => {
        state.deletingProject = null;
      }),

    resetFilters: () =>
      set((state) => {
        state.searchQuery = '';
        state.sortBy = 'updated_desc';
        state.currentPage = 1;
      }),
  }))
);
