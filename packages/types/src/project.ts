import type { ProjectRole, ShareAccess } from './database.types';
import type { CanvasElement } from './canvas';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  role?: ProjectRole;
  memberCount?: number;
  canvasCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  profile?: UserProfile;
  createdAt: string;
}

export interface CanvasData {
  version: number;
  elements: CanvasElement[];
  appState?: {
    viewBackgroundColor?: string;
    gridSize?: number;
  };
}

export interface Canvas {
  id: string;
  projectId: string;
  name: string;
  data: CanvasData;
  thumbnailUrl: string | null;
  orderIndex: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CanvasShare {
  id: string;
  canvasId: string;
  shareToken: string;
  access: ShareAccess;
  expiresAt: string | null;
  createdAt: string;
}
