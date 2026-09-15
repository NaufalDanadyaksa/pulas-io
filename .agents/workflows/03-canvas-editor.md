---
description: Workflow untuk mengembangkan fitur Canvas Editor — tools menggambar, manipulasi elemen, auto-save, dan integrasi Rough.js. Gunakan setiap kali menambah atau mengubah fungsionalitas di dalam canvas editor.
---

# Workflow: Canvas Editor Development

## Kapan Digunakan
- Menambah tool baru ke toolbar canvas
- Mengubah properti elemen (stroke, fill, opacity, dll.)
- Implementasi undo/redo
- Implementasi auto-save
- Optimasi performa canvas rendering

## Arsitektur Canvas

```
packages/canvas-core/          # Framework-agnostic canvas logic
├── src/
│   ├── elements/              # Element factories & validators
│   │   ├── rectangle.ts
│   │   ├── ellipse.ts
│   │   ├── arrow.ts
│   │   └── text.ts
│   ├── renderer/              # Rough.js rendering engine
│   │   ├── roughRenderer.ts
│   │   └── selectionRenderer.ts
│   ├── history/               # Undo/Redo stack
│   │   └── historyManager.ts
│   └── types/
│       └── element.types.ts

apps/web/src/features/canvas/
├── components/
│   ├── CanvasEditor.tsx        # Main canvas container
│   ├── Toolbar.tsx             # Tool selector
│   ├── PropertiesPanel.tsx     # Element properties sidebar
│   └── SaveIndicator.tsx       # "Saving..." / "Saved" indicator
├── hooks/
│   ├── useCanvasTools.ts       # Tool selection & keyboard shortcuts
│   ├── useCanvasHistory.ts     # Undo/redo management
│   ├── useAutoSave.ts          # Debounced auto-save to Supabase
│   └── useCanvasElements.ts    # Element CRUD operations
└── stores/
    └── canvasStore.ts          # Zustand store for canvas state
```

## Langkah-langkah

### 1. Definisikan Element Type
```typescript
// packages/canvas-core/src/types/element.types.ts
import { z } from 'zod';

export const baseElementSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['rectangle', 'ellipse', 'arrow', 'line', 'text', 'freedraw', 'image']),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  angle: z.number().default(0),
  strokeColor: z.string().default('#1e1e2e'),
  backgroundColor: z.string().default('transparent'),
  strokeWidth: z.number().min(1).max(10).default(2),
  strokeStyle: z.enum(['solid', 'dashed', 'dotted']).default('solid'),
  fillStyle: z.enum(['none', 'hachure', 'cross-hatch', 'solid']).default('none'),
  roughness: z.number().min(0).max(2).default(1),
  opacity: z.number().min(0).max(100).default(100),
  seed: z.number(),
  version: z.number().default(1),
  groupIds: z.array(z.string()).default([]),
  isLocked: z.boolean().default(false),
});

export type CanvasElement = z.infer<typeof baseElementSchema>;
```

### 2. Implementasi Canvas Store (Zustand)
```typescript
// apps/web/src/features/canvas/stores/canvasStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';

interface CanvasState {
  elements: CanvasElement[];
  selectedIds: string[];
  activeTool: ToolType;
  zoom: number;
  scrollX: number;
  scrollY: number;
  isDirty: boolean;      // apakah ada perubahan belum disimpan
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'error';

  // Actions
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElements: (ids: string[]) => void;
  setSelectedIds: (ids: string[]) => void;
  setActiveTool: (tool: ToolType) => void;
  markSaved: () => void;
}

export const useCanvasStore = create<CanvasState>()(
  subscribeWithSelector(
    immer((set) => ({
      elements: [],
      selectedIds: [],
      activeTool: 'select',
      zoom: 1,
      scrollX: 0,
      scrollY: 0,
      isDirty: false,
      saveStatus: 'saved',

      addElement: (element) => set((state) => {
        state.elements.push(element);
        state.isDirty = true;
        state.saveStatus = 'unsaved';
      }),

      updateElement: (id, updates) => set((state) => {
        const index = state.elements.findIndex((el) => el.id === id);
        if (index !== -1) {
          Object.assign(state.elements[index], updates);
          state.elements[index].version += 1;
          state.isDirty = true;
          state.saveStatus = 'unsaved';
        }
      }),

      deleteElements: (ids) => set((state) => {
        state.elements = state.elements.filter((el) => !ids.includes(el.id));
        state.selectedIds = state.selectedIds.filter((id) => !ids.includes(id));
        state.isDirty = true;
        state.saveStatus = 'unsaved';
      }),

      setSelectedIds: (ids) => set((state) => { state.selectedIds = ids; }),
      setActiveTool: (tool) => set((state) => { state.activeTool = tool; }),
      markSaved: () => set((state) => { state.isDirty = false; state.saveStatus = 'saved'; }),
    }))
  )
);
```

### 3. Implementasi Auto-save dengan Debounce
```typescript
// apps/web/src/features/canvas/hooks/useAutoSave.ts
import { useEffect, useRef } from 'react';
import { useCanvasStore } from '../stores/canvasStore';
import { supabase } from '@/lib/supabase';
import { canvasDataSchema } from '../schemas/canvas.schema';

const AUTOSAVE_DEBOUNCE_MS = 1000;

export function useAutoSave(canvasId: string) {
  const elements = useCanvasStore((s) => s.elements);
  const isDirty = useCanvasStore((s) => s.isDirty);
  const markSaved = useCanvasStore((s) => s.markSaved);
  const setSaveStatus = useCanvasStore((s) => s.setSaveStatus);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const localStorageKey = `canvas-draft-${canvasId}`;

  useEffect(() => {
    if (!isDirty) return;

    // Simpan ke localStorage segera sebagai fallback offline
    const draft = { elements, savedAt: new Date().toISOString() };
    localStorage.setItem(localStorageKey, JSON.stringify(draft));

    // Debounce save ke Supabase
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const canvasData = canvasDataSchema.parse({ elements });
        const { error } = await supabase
          .from('canvases')
          .update({ data: canvasData, updated_at: new Date().toISOString() })
          .eq('id', canvasId);

        if (error) throw error;

        markSaved();
        // Hapus draft localStorage setelah berhasil disimpan
        localStorage.removeItem(localStorageKey);
      } catch {
        setSaveStatus('error');
        // Data tetap aman di localStorage, retry saat online
      }
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [elements, isDirty]);
}
```

### 4. Keyboard Shortcuts
```typescript
// apps/web/src/features/canvas/hooks/useCanvasTools.ts
const TOOL_SHORTCUTS: Record<string, ToolType> = {
  'v': 'select', '1': 'select',
  'r': 'rectangle', '2': 'rectangle',
  'o': 'ellipse', '4': 'ellipse',
  'a': 'arrow', '5': 'arrow',
  'l': 'line', '6': 'line',
  'p': 'freedraw', '7': 'freedraw',
  't': 'text', '8': 'text',
  'e': 'eraser', '0': 'eraser',
  'h': 'hand',
};

export function useCanvasTools() {
  const setActiveTool = useCanvasStore((s) => s.setActiveTool);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Jangan intercept saat user sedang mengetik di input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const tool = TOOL_SHORTCUTS[e.key.toLowerCase()];
      if (tool) setActiveTool(tool);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool]);
}
```

## Performa: Aturan Canvas Rendering

- **Virtualisasi**: Hanya render elemen yang ada dalam viewport + buffer 100px
- **Memoize** komponen elemen dengan `React.memo` — hindari re-render cascade
- **Canvas layer**: Gunakan layer terpisah untuk selection indicator dan cursor
- **Target**: ≥ 60 FPS dengan 500+ elemen (sesuai PRD §13)

## Checklist Canvas Feature
- [ ] Element type terdefinisi dengan Zod schema
- [ ] Canvas store menggunakan `immer` untuk immutability
- [ ] Auto-save menggunakan debounce 1000ms
- [ ] Fallback localStorage aktif saat save gagal
- [ ] Keyboard shortcut tidak konflik dengan shortcuts sistem
- [ ] Rendering teroptimasi (hanya render elemen dalam viewport)
