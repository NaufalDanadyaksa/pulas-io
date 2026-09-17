import * as React from 'react';
import {
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@pulas/ui';
import {
  Search,
  Plus,
  FolderOpen,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import type { ProjectWithRelations, ProjectSortOption } from '../types/project.types';
import { ProjectCard } from './ProjectCard';
import { ProjectCardSkeleton } from './ProjectCardSkeleton';

interface ProjectGridProps {
  projects: ProjectWithRelations[] | undefined;
  isLoading: boolean;
  searchQuery: string;
  sortBy: ProjectSortOption;
  currentPage: number;
  pageSize?: number;
  duplicatingProjectId?: string | null;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: ProjectSortOption) => void;
  onPageChange: (page: number) => void;
  onCreateProject: () => void;
  onSelectProject?: (project: ProjectWithRelations) => void;
  onEditProject?: (project: ProjectWithRelations) => void;
  onDuplicateProject?: (project: ProjectWithRelations) => void;
  onDeleteProject?: (project: ProjectWithRelations) => void;
}

export function ProjectGrid({
  projects,
  isLoading,
  searchQuery,
  sortBy,
  currentPage,
  pageSize = 12,
  duplicatingProjectId = null,
  onSearchChange,
  onSortChange,
  onPageChange,
  onCreateProject,
  onSelectProject,
  onEditProject,
  onDuplicateProject,
  onDeleteProject,
}: ProjectGridProps) {
  // 1. Filter projects based on search query
  const filteredProjects = React.useMemo(() => {
    if (!projects) return [];
    if (!searchQuery.trim()) return projects;

    const query = searchQuery.toLowerCase().trim();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
    );
  }, [projects, searchQuery]);

  // 2. Sort filtered projects
  const sortedProjects = React.useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'created_desc') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      // default: updated_desc
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [filteredProjects, sortBy]);

  // 3. Paginate
  const totalItems = sortedProjects.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedProjects = React.useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return sortedProjects.slice(start, start + pageSize);
  }, [sortedProjects, validCurrentPage, pageSize]);

  return (
    <div id="project-management-section" className="space-y-6">
      {/* Controls Bar: Search + Sort + New Project CTA */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              id="search-projects-input"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari nama atau deskripsi project..."
              className="pl-9 pr-8"
              aria-label="Cari project"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                aria-label="Bersihkan pencarian"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="w-48">
            <Select
              value={sortBy}
              onValueChange={(val) => onSortChange(val as ProjectSortOption)}
            >
              <SelectTrigger id="sort-projects-trigger" aria-label="Urutkan project">
                <div className="flex items-center gap-2 truncate">
                  <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />
                  <SelectValue placeholder="Urutkan" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated_desc">Terakhir Diperbarui</SelectItem>
                <SelectItem value="created_desc">Terbaru Dibuat</SelectItem>
                <SelectItem value="name_asc">Nama (A–Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Create Project Button */}
        <Button
          id="btn-grid-create-project"
          onClick={onCreateProject}
          className="gap-2 shadow-xs shrink-0"
        >
          <Plus className="h-4 w-4" />
          Project Baru
        </Button>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div
          data-testid="project-loading-grid"
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <ProjectCardSkeleton key={index} />
          ))}
        </div>
      ) : projects && projects.length === 0 ? (
        /* Empty State: Belum ada project sama sekali */
        <div
          id="projects-empty-state"
          className="rounded-2xl border-2 border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 shadow-xs">
            <FolderOpen className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Belum ada project
          </h3>
          <p className="mt-1.5 max-w-sm mx-auto text-sm text-zinc-500 dark:text-zinc-400">
            Project membantu Anda mengelompokkan dan mengelola berbagai canvas whiteboard secara rapi.
          </p>
          <div className="mt-6">
            <Button
              id="btn-empty-create-project"
              onClick={onCreateProject}
              className="gap-2 shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Buat Project Pertama
            </Button>
          </div>
        </div>
      ) : paginatedProjects.length === 0 ? (
        /* Empty Filter State: Pencarian tidak menemukan hasil */
        <div
          id="projects-no-search-results"
          className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/50"
        >
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            <Search className="h-5 w-5" />
          </div>
          <h4 className="mt-3 font-semibold text-zinc-900 dark:text-zinc-100">
            Tidak ada project yang cocok
          </h4>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Tidak ditemukan project dengan kata kunci &quot;{searchQuery}&quot;.
          </p>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSearchChange('')}
              id="btn-clear-project-search"
            >
              Hapus Pencarian
            </Button>
          </div>
        </div>
      ) : (
        /* Project Cards Grid */
        <div
          id="projects-grid"
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {paginatedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isDuplicating={duplicatingProjectId === project.id}
              onSelect={onSelectProject}
              onEdit={onEditProject}
              onDuplicate={onDuplicateProject}
              onDelete={onDeleteProject}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div
          id="projects-pagination"
          className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800"
        >
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Menampilkan{' '}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {(validCurrentPage - 1) * pageSize + 1}
            </span>{' '}
            sampai{' '}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {Math.min(validCurrentPage * pageSize, totalItems)}
            </span>{' '}
            dari{' '}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {totalItems}
            </span>{' '}
            project
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={validCurrentPage <= 1}
              onClick={() => onPageChange(validCurrentPage - 1)}
              aria-label="Halaman sebelumnya"
              id="btn-pagination-prev"
              className="h-8 gap-1 px-2.5"
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>

            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 px-2">
              {validCurrentPage} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={validCurrentPage >= totalPages}
              onClick={() => onPageChange(validCurrentPage + 1)}
              aria-label="Halaman berikutnya"
              id="btn-pagination-next"
              className="h-8 gap-1 px-2.5"
            >
              Berikutnya
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
