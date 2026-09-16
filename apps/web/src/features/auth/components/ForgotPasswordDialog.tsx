import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from '../schemas/auth.schema';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
} from '@pulas/ui';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordDialog({
  open,
  onOpenChange,
}: ForgotPasswordDialogProps) {
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '' },
  });

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
      setAuthError(null);
      setIsSuccess(false);
    }
    onOpenChange(newOpen);
  };

  const onSubmit = async (data: ResetPasswordInput) => {
    setAuthError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Gagal mengirim instruksi reset kata sandi';
      setAuthError(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent id="dialog-forgot-password" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atur Ulang Kata Sandi</DialogTitle>
          <DialogDescription>
            Masukkan email terdaftar Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="space-y-4 py-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Email pemulihan kata sandi telah dikirim. Silakan periksa inbox email Anda.
            </p>
            <Button
              id="btn-close-forgot-dialog"
              variant="outline"
              className="w-full"
              onClick={() => handleClose(false)}
            >
              Tutup
            </Button>
          </div>
        ) : (
          <form
            id="forgot-password-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            {authError && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="forgot-email"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Alamat Email
              </label>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="nama@perusahaan.com"
                aria-label="Alamat email pemulihan"
                aria-describedby={errors.email ? 'forgot-email-error' : undefined}
                aria-invalid={!!errors.email}
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                id="btn-cancel-forgot"
                type="button"
                variant="ghost"
                onClick={() => handleClose(false)}
              >
                Batal
              </Button>
              <Button
                id="btn-submit-forgot"
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  'Kirim Tautan Reset'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
