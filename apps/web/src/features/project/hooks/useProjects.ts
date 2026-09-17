import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ProjectWithRelations } from '../types/project.types';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (userId?: string) => [...projectKeys.lists(), userId ?? 'all'] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

export async function fetchProjects(userId?: string): Promise<ProjectWithRelations[]> {
  let query = supabase
    .from('projects')
    .select(`
      *,
      project_members (
        user_id,
        role
      ),
      canvases (
        id,
        name,
        thumbnail_url,
        updated_at,
        deleted_at
      )
    `)
    .order('updated_at', { ascending: false });

  if (userId) {
    query = query.eq('owner_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  // Filter out soft-deleted canvases from summary
  const formatted: ProjectWithRelations[] = (data || []).map((project) => ({
    ...project,
    canvases: (project.canvases || []).filter(
      (c) => c.deleted_at === null || c.deleted_at === undefined
    ),
  }));

  return formatted;
}

export function useProjects(userId?: string) {
  return useQuery({
    queryKey: projectKeys.list(userId),
    queryFn: () => fetchProjects(userId),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5, // 5 menit
  });
}

export async function fetchProjectDetail(projectId: string): Promise<ProjectWithRelations> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_members (
        user_id,
        role
      ),
      canvases (
        id,
        name,
        thumbnail_url,
        updated_at,
        deleted_at
      )
    `)
    .eq('id', projectId)
    .single();

  if (error) {
    throw error;
  }

  return {
    ...data,
    canvases: (data.canvases || []).filter(
      (c) => c.deleted_at === null || c.deleted_at === undefined
    ),
  };
}

export function useProjectDetail(projectId: string) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => fetchProjectDetail(projectId),
    enabled: Boolean(projectId),
    staleTime: 1000 * 60 * 5,
  });
}
