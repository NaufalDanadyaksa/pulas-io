import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
} from '@pulas/ui';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useDeleteProject } from '../hooks/useProjectMutations';
import type { ProjectWithRelations } from '../types/project.types';

interface DeleteProjectDialogProps {
  project: ProjectWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteProjectDialog({
  project,
  open,
  onOpenChange,
  onSuccess,
}: DeleteProjectDialogProps) {
  const deleteMutation = useDeleteProject();

  if (!project) return null;

  const canvasCount = project.canvases?.length || 0;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(project.id);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Gagal menghapus project:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent id="delete-project-dialog" className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 sm:mx-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle id="delete-project-dialog-title" className="text-left pt-2">
            Hapus Project &quot;{project.name}&quot;?
          </DialogTitle>
          <DialogDescription id="delete-project-dialog-description" className="text-left">
            Tindakan ini tidak dapat dibatalkan. Menghapus project ini akan menghapus semua{' '}
            <strong className="text-zinc-900 dark:text-zinc-100">
              {canvasCount} canvas
            </strong>{' '}
            dan data di dalamnya secara permanen.
          </DialogDescription>
        </DialogHeader>

        {deleteMutation.isError && (
          <div
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            role="alert"
          >
            {deleteMutation.error instanceof Error
              ? deleteMutation.error.message
              : 'Gagal menghapus project.'}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <Button
            type="button"
            variant="outline"
            id="btn-cancel-delete-project"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            id="btn-confirm-delete-project"
            disabled={deleteMutation.isPending}
            aria-busy={deleteMutation.isPending}
            onClick={handleDelete}
            className="gap-2"
          >
            {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Hapus Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
