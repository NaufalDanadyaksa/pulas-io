import { useAuthStore } from '@/stores/authStore';
import { Button, Avatar, AvatarFallback, AvatarImage, Badge } from '@pulas/ui';
import { LogOut, Plus, Sparkles, FolderPlus, UserCheck } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import {
  useProjects,
  useDuplicateProject,
  useProjectUIStore,
  ProjectGrid,
  CreateProjectModal,
  EditProjectModal,
  DeleteProjectDialog,
  type ProjectWithRelations,
} from '@/features/project';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();

  const { data: projects, isLoading } = useProjects(user?.id);
  const duplicateMutation = useDuplicateProject();

  // Project UI Store
  const {
    searchQuery,
    sortBy,
    currentPage,
    isCreateModalOpen,
    editingProject,
    deletingProject,
    setSearchQuery,
    setSortBy,
    setCurrentPage,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
  } = useProjectUIStore();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: '/login' });
  };

  const handleSelectProject = (project: ProjectWithRelations) => {
    navigate({
      to: '/projects/$projectId',
      params: { projectId: project.id },
    });
  };

  const handleDuplicateProject = async (project: ProjectWithRelations) => {
    try {
      await duplicateMutation.mutateAsync(project);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Gagal menduplikasi project:', error);
    }
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Kreator pulas.io';
  const email = user?.email || 'Tidak ada email';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Calculate dynamic stats
  const totalProjects = projects?.length || 0;
  const totalCanvases =
    projects?.reduce((acc, p) => acc + (p.canvases?.length || 0), 0) || 0;

  return (
    <div id="dashboard-container" className="mx-auto max-w-6xl px-6 py-8 space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border border-zinc-200 shadow-xs dark:border-zinc-700">
            <AvatarImage
              src={user?.user_metadata?.avatar_url}
              alt={displayName}
            />
            <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-lg dark:bg-indigo-950 dark:text-indigo-300">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Halo, {displayName}
              </h1>
              <Badge variant="secondary" className="gap-1">
                <UserCheck className="h-3 w-3 text-emerald-500" />
                Terverifikasi
              </Badge>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            id="btn-dashboard-signout"
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="gap-1.5 text-zinc-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
          <Button
            id="btn-create-project-top"
            size="sm"
            onClick={openCreateModal}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Project Baru
          </Button>
        </div>
      </div>

      {/* Overview / Quick Actions */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Total Projects
            </span>
            <FolderPlus className="h-4 w-4 text-indigo-600" />
          </div>
          <p
            id="stat-total-projects"
            className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50"
          >
            {isLoading ? '...' : totalProjects}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Kelola canvas dalam project terorganisir
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Canvas Aktif
            </span>
            <Sparkles className="h-4 w-4 text-indigo-600" />
          </div>
          <p
            id="stat-total-canvases"
            className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50"
          >
            {isLoading ? '...' : totalCanvases}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Gambar whiteboard dengan sensasi hand-drawn
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Session User ID
            </span>
            <span className="text-xs text-emerald-500 font-mono">AKTIF</span>
          </div>
          <p
            className="mt-2 text-xs font-mono text-zinc-600 dark:text-zinc-300 truncate"
            title={user?.id}
          >
            {user?.id || '—'}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Terhubung via Supabase Auth & RLS
          </p>
        </div>
      </div>

      {/* Project Management Section */}
      <section aria-labelledby="section-projects-heading" className="space-y-4">
        <h2
          id="section-projects-heading"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
        >
          Daftar Project
        </h2>

        <ProjectGrid
          projects={projects}
          isLoading={isLoading}
          searchQuery={searchQuery}
          sortBy={sortBy}
          currentPage={currentPage}
          duplicatingProjectId={
            duplicateMutation.isPending
              ? (duplicateMutation.variables as ProjectWithRelations | undefined)?.id ?? null
              : null
          }
          onSearchChange={setSearchQuery}
          onSortChange={setSortBy}
          onPageChange={setCurrentPage}
          onCreateProject={openCreateModal}
          onSelectProject={handleSelectProject}
          onEditProject={openEditModal}
          onDuplicateProject={handleDuplicateProject}
          onDeleteProject={openDeleteModal}
        />
      </section>

      {/* Modals & Dialogs */}
      <CreateProjectModal
        open={isCreateModalOpen}
        onOpenChange={(open) => (open ? openCreateModal() : closeCreateModal())}
      />

      <EditProjectModal
        project={editingProject}
        open={Boolean(editingProject)}
        onOpenChange={(open) => {
          if (!open) closeEditModal();
        }}
      />

      <DeleteProjectDialog
        project={deletingProject}
        open={Boolean(deletingProject)}
        onOpenChange={(open) => {
          if (!open) closeDeleteModal();
        }}
      />
    </div>
  );
}
