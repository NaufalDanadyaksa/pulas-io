import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@pulas/ui';
import { AlertCircle, Loader2 } from 'lucide-react';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isSubscribed = true;
    let authSubscription: { unsubscribe: () => void } | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function handleAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          if (isSubscribed) setErrorMessage(error.message);
          return;
        }

        if (data.session) {
          await useAuthStore.getState().initialize();
          if (isSubscribed) {
            navigate({ to: '/dashboard' });
          }
          return;
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' || session) {
            await useAuthStore.getState().initialize();
            if (isSubscribed) {
              navigate({ to: '/dashboard' });
            }
          }
        });
        authSubscription = subscription;

        timer = setTimeout(() => {
          if (isSubscribed && !useAuthStore.getState().user) {
            setErrorMessage(
              'Gagal memverifikasi sesi autentikasi. Tautan mungkin telah kedaluwarsa.'
            );
          }
        }, 6000);
      } catch (err) {
        if (isSubscribed) {
          setErrorMessage(
            err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat proses login'
          );
        }
      }
    }

    handleAuth();

    return () => {
      isSubscribed = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [navigate]);

  if (errorMessage) {
    return (
      <div
        id="auth-callback-error-view"
        className="flex min-h-[70vh] flex-col items-center justify-center p-4"
      >
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-lg dark:border-red-900/50 dark:bg-zinc-900">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Autentikasi Tidak Berhasil
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {errorMessage}
          </p>
          <Button
            id="btn-callback-back-login"
            className="mt-6 w-full"
            onClick={() => navigate({ to: '/login' })}
          >
            Kembali ke Halaman Masuk
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="auth-callback-loading-view"
      className="flex min-h-[70vh] flex-col items-center justify-center p-4 text-center"
    >
      <Loader2 className="h-10 w-10 animate-spin text-indigo-600 dark:text-indigo-400" />
      <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Memverifikasi Autentikasi...
      </h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Mohon tunggu sebentar, Anda akan segera dialihkan ke Dashboard.
      </p>
    </div>
  );
}
