import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
} from '@pulas/ui';
import { Check, Loader2 } from 'lucide-react';
import {
  updateProjectSchema,
  PROJECT_COLOR_PRESETS,
  PROJECT_ICON_NAMES,
  type UpdateProjectInput,
} from '../schemas/project.schema';
import { ProjectIcon } from './ProjectIcon';
import { useUpdateProject } from '../hooks/useProjectMutations';
import type { ProjectWithRelations } from '../types/project.types';

interface EditProjectModalProps {
  project: ProjectWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditProjectModal({
  project,
  open,
  onOpenChange,
  onSuccess,
}: EditProjectModalProps) {
  const updateMutation = useUpdateProject();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProjectInput>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#6366f1',
      icon: 'folder',
    },
  });

  React.useEffect(() => {
    if (project && open) {
      reset({
        name: project.name,
        description: project.description || '',
        color: project.color || '#6366f1',
        icon: project.icon || 'folder',
      });
    }
  }, [project, open, reset]);

  if (!project) return null;

  const onSubmit = async (data: UpdateProjectInput) => {
    try {
      await updateMutation.mutateAsync({
        projectId: project.id,
        input: data,
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Gagal memperbarui project:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        id="edit-project-modal"
        className="max-h-[90vh] overflow-y-auto sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle id="edit-project-modal-title">Edit Project</DialogTitle>
          <DialogDescription id="edit-project-modal-description">
            Ubah nama, deskripsi, warna, atau ikon project Anda.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
          {/* Project Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="edit-project-name"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Nama Project <span className="text-red-500">*</span>
            </label>
            <Input
              id="edit-project-name"
              placeholder="Nama project..."
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'edit-project-name-error' : undefined}
              {...register('name')}
            />
            {errors.name && (
              <p
                id="edit-project-name-error"
                className="text-xs text-red-500 font-medium"
                role="alert"
              >
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Project Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="edit-project-description"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Deskripsi (Opsional)
            </label>
            <textarea
              id="edit-project-description"
              rows={3}
              placeholder="Deskripsi singkat..."
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? 'edit-project-description-error' : undefined
              }
              {...register('description')}
            />
            {errors.description && (
              <p
                id="edit-project-description-error"
                className="text-xs text-red-500 font-medium"
                role="alert"
              >
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Warna Tema Project
            </label>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <div
                    className="grid grid-cols-6 gap-2"
                    role="radiogroup"
                    aria-label="Pilih warna project"
                  >
                    {PROJECT_COLOR_PRESETS.map((color) => {
                      const isSelected = field.value?.toLowerCase() === color.toLowerCase();
                      return (
                        <button
                          key={color}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          aria-label={`Pilih warna ${color}`}
                          onClick={() => field.onChange(color)}
                          className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-transform hover:scale-105 focus:outline-none ${
                            isSelected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        >
                          {isSelected && <Check className="h-4 w-4 text-white" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-zinc-400">Custom hex:</span>
                    <input
                      type="text"
                      id="edit-custom-color-input"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="#6366f1"
                      className="h-7 w-24 rounded border border-zinc-200 px-2 text-xs font-mono text-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                    />
                    <div
                      className="h-6 w-6 rounded border border-zinc-200 shadow-2xs"
                      style={{ backgroundColor: field.value }}
                    />
                  </div>
                </div>
              )}
            />
            {errors.color && (
              <p className="text-xs text-red-500 font-medium">{errors.color.message}</p>
            )}
          </div>

          {/* Icon Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Ikon Project
            </label>
            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <div
                  className="grid grid-cols-6 gap-2"
                  role="radiogroup"
                  aria-label="Pilih ikon project"
                >
                  {PROJECT_ICON_NAMES.map((iconName) => {
                    const isSelected = field.value === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`Pilih ikon ${iconName}`}
                        onClick={() => field.onChange(iconName)}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-xs dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-300'
                            : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <ProjectIcon name={iconName} className="h-5 w-5" />
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {errors.icon && (
              <p className="text-xs text-red-500 font-medium">{errors.icon.message}</p>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              id="btn-cancel-edit-project"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              id="btn-submit-edit-project"
              disabled={isSubmitting || updateMutation.isPending}
              aria-busy={isSubmitting || updateMutation.isPending}
              className="gap-2"
            >
              {(isSubmitting || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
