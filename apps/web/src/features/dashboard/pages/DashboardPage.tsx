import { useAuthStore } from '@/stores/authStore';
import { Button, Avatar, AvatarFallback, AvatarImage, Badge } from '@pulas/ui';
import { LogOut, Plus, Sparkles, FolderPlus, UserCheck } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: '/login' });
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

  return (
    <div id="dashboard-container" className="mx-auto max-w-6xl px-6 py-8">
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
          <Button id="btn-create-project-top" size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Project Baru
          </Button>
        </div>
      </div>

      {/* Overview / Quick Actions */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Total Projects
            </span>
            <FolderPlus className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            0
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
          <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            0
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

      {/* Empty State placeholder ready for Fase 1.4 */}
      <div className="mt-10 rounded-2xl border-2 border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
          <FolderPlus className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Belum ada canvas atau project
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Mulai dengan membuat project baru untuk mengorganisir lembar kerja Anda.
        </p>
        <div className="mt-6">
          <Button id="btn-empty-create-project">Buat Project Pertama</Button>
        </div>
      </div>
    </div>
  );
}
