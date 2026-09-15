# Walkthrough — Fase 1.1: Monorepo & Infrastruktur Dasar

**Tanggal Selesai:** 2026-09-15  
**Fase yang Dikerjakan:** Sub-Fase 1.1.A, Sub-Fase 1.1.B, Sub-Fase 1.1.C

---

## Ringkasan Perubahan

### File Baru
- **Root**: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.json`, `.gitignore`
- **`packages/types/`**:
  - `package.json`, `tsconfig.json`
  - `src/database.types.ts` — Stubs schema database Supabase (profiles, projects, project_members, canvases, canvas_shares)
  - `src/canvas.ts` — Tipe CanvasElement (rectangle, ellipse, arrow, line, text, freedraw, image), Viewport, Tools
  - `src/collaboration.ts` — Tipe UserPresence, BroadcastMessage
  - `src/project.ts` — Tipe entitas Project, Canvas, CanvasShare
  - `src/index.ts`
- **`packages/utils/`**:
  - `package.json`, `tsconfig.json`
  - `src/cn.ts` — Class name merge helper (`clsx` + `tailwind-merge`)
  - `src/color.ts` — Deterministic user color generator (`generateUserColor`)
  - `src/date.ts` — `formatDate`, `formatRelativeTime`
  - `src/id.ts` — Unique ID generator (`generateId`)
  - `src/index.ts`
  - `src/__tests__/utils.test.ts` — 10 unit tests Vitest
- **`packages/canvas-core/`**:
  - `package.json`, `tsconfig.json`
  - `src/schemas.ts` — Zod runtime schemas untuk semua tipe elemen canvas
  - `src/elements.ts` — Factory function `createCanvasElement`
  - `src/history.ts` — `HistoryManager` (undo/redo stack, max 100 limit)
  - `src/culling.ts` — Algoritma viewport culling
  - `src/renderer.ts` — Adapter Rough.js generator
  - `src/index.ts`
  - `src/__tests__/history.test.ts` — 4 unit tests
  - `src/__tests__/schemas.test.ts` — 4 unit tests
  - `src/__tests__/culling.test.ts` — 4 unit tests
- **`packages/ui/`**:
  - `package.json`, `tsconfig.json`
  - `src/components/button.tsx` — Button dengan varian CVA
  - `src/components/input.tsx` — Accessible input
  - `src/components/dialog.tsx` — Radix Dialog
  - `src/components/select.tsx` — Radix Select
  - `src/components/badge.tsx` — Badge indikator status
  - `src/components/avatar.tsx` — Radix Avatar
  - `src/components/skeleton.tsx` — Loading skeleton
  - `src/components/toast.tsx` — Radix Toast notification
  - `src/index.ts`
- **`apps/web/`**:
  - `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`
  - `src/index.css` — Tailwind CSS v4 setup & theme variables
  - `src/main.tsx` — Entry point dengan QueryClientProvider, RouterProvider, ToastProvider
  - `src/routes/router.tsx` — Root layout TanStack Router & landing placeholder view
  - `src/lib/query-client.ts` — TanStack QueryClient setup
  - `src/stores/use-app-store.ts` — Zustand store dengan immer middleware

### File Dimodifikasi
- `.agents/implementation_plan.md` — Rincian fase & tracker
- `.agents/task.md` — Status checklist real-time per sub-fase

---

## Langkah Pengujian Manual

1. Jalankan dev server aplikasi web:
   ```bash
   pnpm --filter @pulas/web dev
   ```
   - **Expected result:** Vite dev server menyala pada port 5173 (`http://localhost:5173/`).
2. Buka URL `http://localhost:5173/` di web browser:
   - **Expected result:** Halaman landing pulas.io tampil dengan header, logo pulas.io, tombol "New Canvas", judul hero, dan 3 kartu fitur (Hierarchy, CRDT Realtime, Enterprise RLS) berestetika bersih.

---

## Pengujian Otomatis

### 1. Typecheck Workspace
```bash
pnpm run typecheck
```
- **Hasil:** 5 package lulus tanpa error TypeScript (`@pulas/types`, `@pulas/utils`, `@pulas/canvas-core`, `@pulas/ui`, `@pulas/web`).

### 2. Unit Tests (Vitest)
```bash
pnpm run test
```
- **Hasil:** 22/22 unit tests passing (10 di `@pulas/utils`, 12 di `@pulas/canvas-core`).

### 3. Production Build
```bash
pnpm run build
```
- **Hasil:** Bundle production berhasil di-generate di `apps/web/dist` dalam waktu 7.53 detik.

---

## Known Issues / Catatan
- Database types di `@pulas/types/src/database.types.ts` saat ini berupa stubs yang siap disinkronkan langsung via `supabase gen types typescript` saat Supabase CLI dihubungkan pada Fase 1.2.
