import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '../schemas/auth.schema';
import { supabase } from '@/lib/supabase';
import { Button, Input } from '@pulas/ui';
import { AlertCircle, Loader2 } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPasswordClick?: () => void;
}

export function LoginForm({
  onSuccess,
  onForgotPasswordClick,
}: LoginFormProps) {
  const [authError, setAuthError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      onSuccess?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Terjadi kesalahan saat masuk';
      setAuthError(message);
    }
  };

  return (
    <form
      id="login-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-4"
    >
      {authError && (
        <div
          id="login-auth-error"
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="login-email"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Alamat Email
        </label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="nama@perusahaan.com"
          aria-label="Alamat email"
          aria-describedby={errors.email ? 'login-email-error' : undefined}
          aria-invalid={!!errors.email}
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="login-password"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Kata Sandi
          </label>
          {onForgotPasswordClick && (
            <button
              id="btn-forgot-password"
              type="button"
              onClick={onForgotPasswordClick}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-500 hover:underline dark:text-indigo-400"
            >
              Lupa sandi?
            </button>
          )}
        </div>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-label="Kata sandi"
          aria-describedby={errors.password ? 'login-password-error' : undefined}
          aria-invalid={!!errors.password}
          error={errors.password?.message}
          {...register('password')}
        />
      </div>

      <Button
        id="btn-submit-login"
        type="submit"
        className="w-full"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          'Masuk'
        )}
      </Button>
    </form>
  );
}
