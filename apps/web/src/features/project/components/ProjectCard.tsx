import * as React from 'react';
import { formatRelativeTime } from '@pulas/utils';
import { Button } from '@pulas/ui';
import {
  Pencil,
  Copy,
  Trash2,
  Layers,
  Users,
} from 'lucide-react';
import type { ProjectWithRelations } from '../types/project.types';
import { ProjectIcon } from './ProjectIcon';

interface ProjectCardProps {
  project: ProjectWithRelations;
  onSelect?: (project: ProjectWithRelations) => void;
  onEdit?: (project: ProjectWithRelations) => void;
  onDuplicate?: (project: ProjectWithRelations) => void;
  onDelete?: (project: ProjectWithRelations) => void;
  isDuplicating?: boolean;
}

export function ProjectCard({
  project,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  isDuplicating = false,
}: ProjectCardProps) {
  const canvasCount = project.canvases?.length || 0;
  const memberCount = project.project_members?.length || 1;
  const projectColor = project.color || '#6366f1';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(project);
    }
  };

  return (
    <article
      id={`project-card-${project.id}`}
      role="button"
      tabIndex={0}
      aria-label={`Buka project ${project.name}`}
      onClick={() => onSelect?.(project)}
      onKeyDown={handleKeyDown}
      className="group relative flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 cursor-pointer"
    >
      <div>
        {/* Header: Icon + Color + Actions */}
        <div className="flex items-start justify-between">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-lg shadow-xs transition-transform duration-200 group-hover:scale-105"
            style={{
              backgroundColor: `${projectColor}1A`, // 10% opacity
              color: projectColor,
              border: `1px solid ${projectColor}33`,
            }}
          >
            <ProjectIcon name={project.icon} className="h-6 w-6" />
          </div>

          <div
            className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                aria-label={`Edit project ${project.name}`}
                id={`btn-edit-project-${project.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(project);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}

            {onDuplicate && (
              <Button
                variant="ghost"
                size="sm"
                disabled={isDuplicating}
                className="h-8 w-8 p-0 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
                aria-label={`Duplikasi project ${project.name}`}
                id={`btn-duplicate-project-${project.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(project);
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}

            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
                aria-label={`Hapus project ${project.name}`}
                id={`btn-delete-project-${project.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div className="mt-4">
          <h3
            className="font-semibold text-zinc-900 line-clamp-1 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400 transition-colors"
            title={project.name}
          >
            {project.name}
          </h3>
          <p
            className="mt-1 text-sm text-zinc-500 line-clamp-2 dark:text-zinc-400 min-h-[2.5rem]"
            title={project.description || ''}
          >
            {project.description || 'Tidak ada deskripsi.'}
          </p>
        </div>
      </div>

      {/* Footer: Stats & Timestamp */}
      <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1" title={`${canvasCount} canvas`}>
            <Layers className="h-3.5 w-3.5 text-zinc-400" />
            <span>{canvasCount} {canvasCount === 1 ? 'canvas' : 'canvases'}</span>
          </span>

          {memberCount > 1 && (
            <span className="inline-flex items-center gap-1" title={`${memberCount} member`}>
              <Users className="h-3.5 w-3.5 text-zinc-400" />
              <span>{memberCount}</span>
            </span>
          )}
        </div>

        <span title={`Diperbarui pada ${project.updated_at}`}>
          {formatRelativeTime(project.updated_at)}
        </span>
      </div>
    </article>
  );
}
