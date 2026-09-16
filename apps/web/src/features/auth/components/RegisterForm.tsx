import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '../schemas/auth.schema';
import { supabase } from '@/lib/supabase';
import { Button, Input } from '@pulas/ui';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [isSuccessConfirmation, setIsSuccessConfirmation] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setAuthError(null);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.displayName,
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      // Check if email confirmation is required (user created but no session)
      if (authData.user && !authData.session) {
        setIsSuccessConfirmation(true);
      } else {
        onSuccess?.();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Terjadi kesalahan saat registrasi';
      setAuthError(message);
    }
  };

  if (isSuccessConfirmation) {
    return (
      <div
        id="register-confirmation-card"
        className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-6 text-center dark:border-emerald-900/50 dark:bg-emerald-950/40"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="mt-3 text-lg font-semibold text-emerald-900 dark:text-emerald-100">
          Cek Email Anda
        </h3>
        <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-300">
          Kami telah mengirimkan tautan konfirmasi pendaftaran. Silakan periksa kotak masuk atau spam email Anda untuk mengaktifkan akun.
        </p>
      </div>
    );
  }

  return (
    <form
      id="register-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-4"
    >
      {authError && (
        <div
          id="register-auth-error"
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="register-name"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Nama Lengkap
        </label>
        <Input
          id="register-name"
          type="text"
          autoComplete="name"
          placeholder="Budi Santoso"
          aria-label="Nama Lengkap"
          aria-describedby={errors.displayName ? 'register-name-error' : undefined}
          aria-invalid={!!errors.displayName}
          error={errors.displayName?.message}
          {...register('displayName')}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="register-email"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Alamat Email
        </label>
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          placeholder="nama@perusahaan.com"
          aria-label="Alamat email"
          aria-describedby={errors.email ? 'register-email-error' : undefined}
          aria-invalid={!!errors.email}
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="register-password"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Kata Sandi (min. 8 karakter)
        </label>
        <Input
          id="register-password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          aria-label="Kata sandi"
          aria-describedby={errors.password ? 'register-password-error' : undefined}
          aria-invalid={!!errors.password}
          error={errors.password?.message}
          {...register('password')}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="register-confirm-password"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Konfirmasi Kata Sandi
        </label>
        <Input
          id="register-confirm-password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          aria-label="Konfirmasi kata sandi"
          aria-describedby={
            errors.confirmPassword ? 'register-confirm-password-error' : undefined
          }
          aria-invalid={!!errors.confirmPassword}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </div>

      <Button
        id="btn-submit-register"
        type="submit"
        className="w-full"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Mendaftarkan...
          </>
        ) : (
          'Daftar Akun'
        )}
      </Button>
    </form>
  );
}
