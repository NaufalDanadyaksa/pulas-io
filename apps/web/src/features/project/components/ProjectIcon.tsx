import * as React from 'react';
import {
  Folder,
  Palette,
  Layout,
  Briefcase,
  Star,
  Code,
  Book,
  Box,
  Zap,
  Globe,
  Smile,
  Coffee,
  type LucideProps,
} from 'lucide-react';
import type { ProjectIconName } from '../schemas/project.schema';

interface ProjectIconProps extends Omit<LucideProps, 'name'> {
  name?: string | null;
}

const ICON_MAP: Record<ProjectIconName, React.ComponentType<LucideProps>> = {
  folder: Folder,
  palette: Palette,
  layout: Layout,
  briefcase: Briefcase,
  star: Star,
  code: Code,
  book: Book,
  box: Box,
  zap: Zap,
  globe: Globe,
  smile: Smile,
  coffee: Coffee,
};

export function ProjectIcon({ name, ...props }: ProjectIconProps) {
  const IconComponent = (name && ICON_MAP[name as ProjectIconName]) || Folder;
  return <IconComponent {...props} />;
}
