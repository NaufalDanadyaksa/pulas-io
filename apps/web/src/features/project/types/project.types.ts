import type { Database } from '@pulas/types';

export type ProjectRow = Database['public']['Tables']['projects']['Row'];
export type CanvasRow = Database['public']['Tables']['canvases']['Row'];
export type ProjectMemberRow = Database['public']['Tables']['project_members']['Row'];

export interface ProjectCanvasSummary {
  id: string;
  name: string;
  thumbnail_url: string | null;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProjectMemberSummary {
  user_id: string;
  role: Database['public']['Enums']['project_role'];
}

export interface ProjectWithRelations extends ProjectRow {
  canvases?: ProjectCanvasSummary[];
  project_members?: ProjectMemberSummary[];
}

export type ProjectSortOption = 'updated_desc' | 'created_desc' | 'name_asc';
