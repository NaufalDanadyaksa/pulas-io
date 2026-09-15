---
description: Workflow untuk membuat fitur baru di frontend pulas.io menggunakan React 19, TanStack Query v5, Zustand, dan Tailwind CSS v4. Gunakan setiap kali membuat halaman, komponen, atau feature module baru.
---

# Workflow: Frontend Feature Development

## Kapan Digunakan
- Membuat halaman/route baru
- Membuat feature module baru (auth, dashboard, project, canvas)
- Membuat komponen UI yang reusable

## Struktur Feature Module

```
src/features/<nama-fitur>/
├── components/         # Komponen UI spesifik fitur
│   ├── FeatureName.tsx
│   └── FeatureNameSkeleton.tsx  # Loading skeleton wajib ada
├── hooks/              # Custom hooks (data fetching, logic)
│   ├── useFeatureName.ts
│   └── useFeatureNameMutation.ts
├── stores/             # Zustand store (jika ada UI state kompleks)
│   └── featureNameStore.ts
├── schemas/            # Zod validation schemas
│   └── featureName.schema.ts
├── types/              # TypeScript types lokal
│   └── featureName.types.ts
└── index.ts            # Public API exports
```

## Langkah-langkah

### 1. Definisikan Zod Schema Terlebih Dahulu
```typescript
// src/features/<fitur>/schemas/featureName.schema.ts
import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#6366f1'),
  icon: z.string().default('folder'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
```

### 2. Buat Supabase Query/Mutation Hook
```typescript
// src/features/<fitur>/hooks/useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { CreateProjectInput } from '../schemas/project.schema';

// Query keys — selalu gunakan factory pattern untuk konsistensi
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (userId: string) => [...projectKeys.lists(), userId] as const,
  detail: (id: string) => [...projectKeys.all, 'detail', id] as const,
};

export function useProjects(userId: string) {
  return useQuery({
    queryKey: projectKeys.list(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        // Gunakan relational query — HINDARI N+1
        .select(`
          *,
          project_members(user_id, role),
          canvases(id, name, thumbnail_url, updated_at)
        `)
        .eq('owner_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 menit
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      // Validasi Zod sebelum kirim ke Supabase
      const validated = createProjectSchema.parse(input);
      const { data, error } = await supabase
        .from('projects')
        .insert(validated)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate list agar re-fetch otomatis
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
```

### 3. Buat Zustand Store (Jika Ada UI State Kompleks)
```typescript
// src/features/<fitur>/stores/projectStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface ProjectUIState {
  selectedProjectId: string | null;
  isCreateModalOpen: boolean;
  // Actions
  selectProject: (id: string | null) => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
}

// Store granular — satu store per domain/fitur
export const useProjectUIStore = create<ProjectUIState>()(
  immer((set) => ({
    selectedProjectId: null,
    isCreateModalOpen: false,
    selectProject: (id) => set((state) => { state.selectedProjectId = id; }),
    openCreateModal: () => set((state) => { state.isCreateModalOpen = true; }),
    closeCreateModal: () => set((state) => { state.isCreateModalOpen = false; }),
  }))
);
```

### 4. Buat Komponen dengan Aksesibilitas
```tsx
// src/features/<fitur>/components/ProjectCard.tsx
import * as React from 'react';

interface ProjectCardProps {
  project: Project;
  onSelect: (id: string) => void;
}

export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  return (
    <article
      id={`project-card-${project.id}`}
      className="..."
      role="button"
      tabIndex={0}
      aria-label={`Buka project ${project.name}`}
      onClick={() => onSelect(project.id)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(project.id)}
    >
      {/* Loading skeleton: gunakan <ProjectCardSkeleton /> saat loading */}
      ...
    </article>
  );
}
```

### 5. Daftarkan Route di TanStack Router
```typescript
// src/routes/<nama>.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  // Prefetch data di loader sebelum render
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: projectKeys.list(context.auth.userId),
      queryFn: fetchProjects,
    }),
  component: DashboardPage,
});
```

## Checklist Sebelum PR
- [ ] Zod schema sudah mendefinisikan semua input/output
- [ ] Tidak ada query di dalam loop (N+1 check)
- [ ] Semua komponen interaktif punya `id` unik dan `aria-label`
- [ ] Loading skeleton tersedia untuk setiap komponen async
- [ ] Error state ditangani (tampilkan pesan, bukan crash)
- [ ] Query keys menggunakan factory pattern
- [ ] TypeScript strict — tidak ada `any`
