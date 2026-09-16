import { Outlet, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import { Loader2 } from 'lucide-react';

export async function requireAuthGuard() {
  const authStore = useAuthStore.getState();
  if (!authStore.isInitialized) {
    await authStore.initialize();
  }
  const current = useAuthStore.getState();
  if (!current.user) {
    throw redirect({
      to: '/login',
    });
  }
}

export function AuthenticatedLayout() {
  const { isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div
        id="auth-loading-state"
        className="flex h-64 w-full items-center justify-center p-8"
      >
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <Outlet />;
}

export default AuthenticatedLayout;
