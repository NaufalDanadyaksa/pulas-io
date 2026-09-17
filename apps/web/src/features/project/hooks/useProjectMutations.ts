import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
} from '../schemas/project.schema';
import { projectKeys } from './useProjects';
import type { Database } from '@pulas/types';
import type { ProjectWithRelations } from '../types/project.types';

type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export function useCreateProject() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      if (!user) {
        throw new Error('Anda harus login untuk membuat project.');
      }

      // Validasi Zod di sisi client
      const validated = createProjectSchema.parse(input);

      // Insert project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: validated.name,
          description: validated.description || null,
          color: validated.color,
          icon: validated.icon,
          owner_id: user.id,
        })
        .select()
        .single();

      if (projectError) {
        throw projectError;
      }

      // Pastikan owner terdaftar sebagai admin di project_members
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: project.id,
          user_id: user.id,
          role: 'admin',
          invited_by: user.id,
        });

      if (memberError) {
        // Log error tapi jangan gagalkan pembuatan project jika ada constraint trigger
        // eslint-disable-next-line no-console
        console.warn('Gagal menambahkan project member owner:', memberError.message);
      }

      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      input,
    }: {
      projectId: string;
      input: UpdateProjectInput;
    }) => {
      // Validasi Zod di sisi client
      const validated = updateProjectSchema.parse(input);

      const updatePayload: ProjectUpdate = {};
      if (validated.name !== undefined) updatePayload.name = validated.name;
      if (validated.description !== undefined)
        updatePayload.description = validated.description || null;
      if (validated.color !== undefined) updatePayload.color = validated.color;
      if (validated.icon !== undefined) updatePayload.icon = validated.icon;

      const { data, error } = await supabase
        .from('projects')
        .update(updatePayload)
        .eq('id', projectId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: projectKeys.detail(data.id) });
      }
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      // Hapus data canvas terlebih dahulu atau gunakan cascade DB
      const { error: canvasError } = await supabase
        .from('canvases')
        .delete()
        .eq('project_id', projectId);

      if (canvasError) {
        // eslint-disable-next-line no-console
        console.warn('Gagal menghapus canvas:', canvasError.message);
      }

      // Hapus member project
      await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId);

      // Hapus project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        throw error;
      }

      return projectId;
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

export function useDuplicateProject() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (sourceProject: ProjectWithRelations) => {
      if (!user) {
        throw new Error('Anda harus login untuk menduplikasi project.');
      }

      // 1. Buat project baru
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: `${sourceProject.name} (Salinan)`,
          description: sourceProject.description,
          color: sourceProject.color,
          icon: sourceProject.icon,
          owner_id: user.id,
        })
        .select()
        .single();

      if (projectError) {
        throw projectError;
      }

      // 2. Tambahkan owner ke project_members
      await supabase.from('project_members').insert({
        project_id: newProject.id,
        user_id: user.id,
        role: 'admin',
        invited_by: user.id,
      });

      // 3. Ambil data canvas lengkap dari project sumber
      const { data: sourceCanvases } = await supabase
        .from('canvases')
        .select('*')
        .eq('project_id', sourceProject.id)
        .is('deleted_at', null);

      if (sourceCanvases && sourceCanvases.length > 0) {
        const duplicatedCanvases = sourceCanvases.map((canvas) => ({
          project_id: newProject.id,
          name: canvas.name,
          data: canvas.data,
          thumbnail_url: canvas.thumbnail_url,
          order_index: canvas.order_index,
          created_by: user.id,
          last_edited_by: user.id,
        }));

        const { error: copyError } = await supabase
          .from('canvases')
          .insert(duplicatedCanvases);

        if (copyError) {
          // eslint-disable-next-line no-console
          console.warn('Gagal menyalin canvas:', copyError.message);
        }
      }

      return newProject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
