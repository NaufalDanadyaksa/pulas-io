import * as React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { LoginForm } from '../components/LoginForm';
import { OAuthButtons } from '../components/OAuthButtons';
import { ForgotPasswordDialog } from '../components/ForgotPasswordDialog';
import { Palette, Sparkles } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const [isForgotOpen, setIsForgotOpen] = React.useState(false);
  const [oauthError, setOauthError] = React.useState<string | null>(null);

  const handleLoginSuccess = () => {
    navigate({ to: '/dashboard' });
  };

  return (
    <div
      id="login-page-container"
      className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <Palette className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Selamat Datang Kembali
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Masuk ke pulas.io untuk melanjutkan whiteboard Anda
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {oauthError && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
              {oauthError}
            </div>
          )}

          <OAuthButtons onError={(err) => setOauthError(err)} />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500">
                Atau masuk dengan email
              </span>
            </div>
          </div>

          <LoginForm
            onSuccess={handleLoginSuccess}
            onForgotPasswordClick={() => setIsForgotOpen(true)}
          />

          <div className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Belum memiliki akun?{' '}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline dark:text-indigo-400"
            >
              Daftar sekarang
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span>Hand-drawn whiteboarding made collaborative</span>
        </div>
      </div>

      <ForgotPasswordDialog
        open={isForgotOpen}
        onOpenChange={setIsForgotOpen}
      />
    </div>
  );
}
