# Implementation Plan — pulas.io Collaborative Visual Whiteboard

**Versi PRD:** 1.0.0  
**Tanggal Plan:** 15 September 2026  
**Status:** 🟡 Phase 1 sedang berjalan — Fase 1.1 ✅ selesai

---

## Konteks

pulas.io adalah aplikasi virtual whiteboard kolaboratif berbasis web dengan estetika *hand-drawn* (Rough.js). Arsitektur monorepo Turborepo + pnpm dengan React 19 (Vite) di frontend dan Supabase sebagai BaaS (Auth, PostgreSQL + RLS, Realtime, Storage, Edge Functions). Kolaborasi real-time menggunakan Yjs (CRDT) di atas Supabase Realtime Broadcast.

Plan ini mencakup 4 fase dari PRD. Setiap fase bisa dirilis secara independen.

---

## Keputusan Arsitektur

> Pertanyaan-pertanyaan berikut telah dijawab. Semua pilihan mengutamakan **free tier** dan **efisiensi operasional**.

| # | Topik | Keputusan | Alasan |
|---|---|---|---|
| 1 | **Yjs Transport** | ✅ **Supabase Realtime Broadcast** | Sudah included dalam free tier Supabase. Tidak butuh server websocket dedicated berbayar. Cocok untuk MVP dan scaling awal. `y-websocket` akan dipertimbangkan hanya jika terjadi bottleneck di skala >1000 concurrent users. |
| 2 | **Thumbnail Generation** | ✅ **`OffscreenCanvas` di client-side** | Thumbnail di-generate di browser saat canvas di-save, lalu di-upload ke Supabase Storage. Tidak memerlukan Edge Function berat (Puppeteer butuh memory tinggi & cold start lambat). Hemat compute quota. |
| 3 | **Rate Limiting** | ✅ **Supabase project settings** | Built-in, gratis, zero kode tambahan. Rate limit di Edge Function memerlukan Redis/Deno KV yang menambah kompleksitas. Cukup untuk MVP. |
| 4 | **Analytics (Posthog)** | ✅ **Mulai di Phase 4** | MVP tidak memerlukan analytics. PostHog free tier (1 juta events/bulan) akan diintegrasikan di Phase 4 (Scaling & Analytics). |

---

## Phase 1 — MVP (Bulan 1–2)

> **Goal:** User dapat login, buat project, buat canvas, gambar, dan data tersimpan.

---

### Fase 1.1 — Monorepo & Infrastruktur Dasar ✅

**Workflows:** `02-frontend-feature.md`, `03-canvas-editor.md`, `06-testing.md`

#### Sub-Fase 1.1.A — Monorepo Root & Core Packages (`packages/types`, `packages/utils`)
- [NEW] `turbo.json` — Pipeline: `build`, `dev`, `test`, `lint`, `typecheck`
- [NEW] `pnpm-workspace.yaml` — Workspace: `apps/*`, `packages/*`
- [NEW] `package.json` & `tsconfig.json` — Root config dengan TypeScript strict mode
- [NEW] `packages/types/` (`@pulas/types`) — Database stubs, canvas element types, presence/collaboration types
- [NEW] `packages/utils/` (`@pulas/utils`) — `cn()`, `formatDate()`, `generateUserColor()`, `nanoid` helper + Vitest unit tests

#### Sub-Fase 1.1.B — Canvas Engine Foundation (`packages/canvas-core`)
- [NEW] `packages/canvas-core/` (`@pulas/canvas-core`) — Element factories (`createCanvasElement`), Rough.js renderer wrapper
- [NEW] Zod schemas untuk semua tipe elemen (`rectangle`, `ellipse`, `arrow`, `line`, `text`, `freedraw`, `image`)
- [NEW] Viewport culling algorithm helper
- [NEW] `HistoryManager` class (Undo/Redo stack dengan batas 100 langkah) + Vitest unit tests

#### Sub-Fase 1.1.C — UI Package & Web App Shell (`packages/ui`, `apps/web`)
- [NEW] `packages/ui/` (`@pulas/ui`) — Radix UI + Tailwind CSS v4 primitives (`Button`, `Input`, `Dialog`, `Select`, `Toast`, `Skeleton`, `Avatar`, `Badge`)
- [NEW] `apps/web/` (`@pulas/web`) — Vite + React 19 + TypeScript strict mode
- [NEW] TanStack Router configuration + root route shell
- [NEW] TanStack Query client setup + Zustand store boilerplate
- [NEW] Tailwind CSS v4 design tokens & theme setup
- [NEW] Full verification: `pnpm run typecheck`, `pnpm run test`, `pnpm run build`


---

### Fase 1.2 — Supabase Setup & Schema Database

**Workflow:** `01-supabase-migration.md`

#### [NEW] `supabase/migrations/001_initial_schema.sql`
- **Tabel:** `profiles`, `projects`, `project_members`, `canvases`, `canvas_shares`
- **Enum:** `project_role` (viewer, editor, admin), `share_access` (view, edit)
- **Indexes** (sesuai PRD §8.1):
  - `idx_projects_owner` on `projects(owner_id)`
  - `idx_project_members_user` on `project_members(user_id)`
  - `idx_canvases_project` on `canvases(project_id)`
  - `idx_canvases_deleted` on `canvases(deleted_at) WHERE deleted_at IS NULL`
  - `idx_canvases_order` on `canvases(project_id, order_index)`
  - `idx_canvas_shares_canvas` on `canvas_shares(canvas_id)`
- **Trigger:** `update_updated_at()` untuk `profiles`, `projects`, `canvases`
- **RLS enabled** + policies untuk semua tabel (sesuai PRD §8.1)

#### [NEW] `supabase/migrations/002_profile_trigger.sql`
- Fungsi `handle_new_user()` — auto-create profil saat user register via `auth.users`
- Trigger `on_auth_user_created` AFTER INSERT ON `auth.users`

#### [NEW] `supabase/seed.sql`
- 2 test users, 2 projects, 3 canvases dengan data dummy untuk development

---

### Fase 1.3 — Authentication

**Workflow:** `05-authentication.md`

#### [NEW] `apps/web/src/lib/supabase.ts`
- Supabase client dengan `persistSession: true`, `autoRefreshToken: true`, `detectSessionInUrl: true`
- Typed dengan `Database` type

#### [NEW] `apps/web/src/stores/authStore.ts`
- State: `user`, `session`, `isLoading`
- `initialize()`: ambil session + subscribe `onAuthStateChange`
- `signOut()`: clear state

#### [NEW] `apps/web/src/features/auth/schemas/auth.schema.ts`
- `loginSchema`: email + password (min 8 char)
- `registerSchema`: extend login + displayName + confirmPassword refine
- `resetPasswordSchema`: email only

#### [NEW] `apps/web/src/features/auth/components/LoginForm.tsx`
- React Hook Form + Zod, `aria-describedby` per field error, `aria-busy` submit button

#### [NEW] `apps/web/src/features/auth/components/RegisterForm.tsx`
- Konfirmasi password dengan Zod `.refine()`

#### [NEW] `apps/web/src/features/auth/components/OAuthButtons.tsx`
- Login Google + GitHub dengan redirect ke `/auth/callback`

#### [NEW] `apps/web/src/routes/auth/callback.tsx`
- Handle OAuth redirect, redirect ke `/dashboard` setelah `SIGNED_IN` event

#### [NEW] `apps/web/src/routes/_authenticated.tsx`
- Layout route: redirect ke `/login` jika `!user`

---

### Fase 1.4 — Dashboard & Manajemen Project

**Workflow:** `02-frontend-feature.md`

#### [NEW] `apps/web/src/features/project/schemas/project.schema.ts`
- `createProjectSchema`: name (1–100), description (max 500), color (hex regex), icon
- `updateProjectSchema`: semua field optional

#### [NEW] `apps/web/src/features/project/hooks/useProjects.ts`
- Relational query: `projects.select('*, canvases(id, thumbnail_url, updated_at)')` — anti N+1
- Query key factory: `projectKeys.list(userId)`
- `staleTime: 5 menit`

#### [NEW] `apps/web/src/features/project/hooks/useProjectMutations.ts`
- `useCreateProject`: validate Zod → insert → invalidate list
- `useUpdateProject`: validate → update → invalidate detail
- `useDeleteProject`: konfirmasi modal → cascade delete → invalidate
- `useDuplicateProject`: insert project baru + semua canvasnya dalam satu transaksi

#### [NEW] `apps/web/src/features/project/components/ProjectCard.tsx`
- `role="button"`, `tabIndex={0}`, unique `id="project-card-{id}"`
- Tampilkan: nama, warna/ikon, jumlah canvas, thumbnail cover, waktu update

#### [NEW] `apps/web/src/features/project/components/ProjectGrid.tsx`
- Loading: Skeleton grid (3 kolom)
- Empty state: ilustrasi + CTA "Buat Project Pertama"
- Sort: `updated_at DESC` (default), `created_at DESC`, `name ASC`

#### [NEW] `apps/web/src/features/project/components/CreateProjectModal.tsx`
- Field: nama, deskripsi, color picker (12 preset warna + custom), ikon selector

#### [NEW] `apps/web/src/routes/(authenticated)/dashboard.tsx`
- Loader: `ensureQueryData(projectKeys.list(userId))`
- Search project by name (client-side filter)
- Pagination: 12 project per halaman

---

### Fase 1.5 — Project View & Manajemen Canvas

**Workflow:** `02-frontend-feature.md`

#### [NEW] `apps/web/src/features/canvas/schemas/canvas.schema.ts`
- `createCanvasSchema`: name (default "Untitled Canvas"), project_id
- `canvasDataSchema`: `{ elements: CanvasElement[], appState: AppState }`

#### [NEW] `apps/web/src/features/canvas/hooks/useCanvases.ts`
- Relational query: filter `deleted_at IS NULL`, order by `order_index ASC`
- Include `last_edited_by` → join profil (satu query, anti N+1)

#### [NEW] `apps/web/src/features/canvas/hooks/useCanvasMutations.ts`
- `useCreateCanvas`, `useRenameCanvas`, `useDeleteCanvas` (soft delete: set `deleted_at`)
- `useDuplicateCanvas`: copy element data, reset `order_index`
- `useReorderCanvases`: batch update `order_index` menggunakan `.upsert()`
- `useRestoreCanvas`: set `deleted_at = null`

#### [NEW] `apps/web/src/features/canvas/components/CanvasCard.tsx`
- Thumbnail preview (fallback: placeholder dengan warna project)
- Nama: inline editable (double-click to rename)
- Meta: "Diedit 2j lalu oleh [Nama]"
- Drag handle (`@dnd-kit/core`)

#### [NEW] `apps/web/src/features/canvas/components/CanvasGrid.tsx`
- Grid/list view toggle (simpan preferensi di localStorage)
- Drag-and-drop reorder
- Loading skeleton per card
- Empty state: "+ Buat Canvas Pertama"

#### [NEW] `apps/web/src/routes/(authenticated)/projects/$projectId/index.tsx`
- Loader: prefetch canvases
- Breadcrumb: Dashboard → [Project Name]

---

### Fase 1.6 — Canvas Editor Core

**Workflow:** `03-canvas-editor.md`

#### [NEW] `apps/web/src/features/canvas/stores/canvasStore.ts`
- Zustand + immer + subscribeWithSelector
- State: `elements[]`, `selectedIds[]`, `activeTool`, `zoom`, `scrollX`, `scrollY`, `isDirty`, `saveStatus`, `appState`
- Actions: `addElement`, `updateElement`, `deleteElements`, `selectElements`, `setActiveTool`, `setZoom`, `markSaved`, `setSaveStatus`

#### [NEW] `apps/web/src/features/canvas/hooks/useCanvasTools.ts`
- Keyboard shortcuts (V/1, R/2, D/3, O/4, A/5, L/6, P/7, T/8, I/9, E/0, H/Space)
- Skip shortcut saat focus di input/textarea

#### [NEW] `apps/web/src/features/canvas/hooks/useCanvasHistory.ts`
- Undo (`Ctrl+Z`), Redo (`Ctrl+Y`, `Ctrl+Shift+Z`)
- Snapshot strategy: snapshot per completed action (mouseup, text confirm)

#### [NEW] `apps/web/src/features/canvas/hooks/useAutoSave.ts`
- Debounce 1000ms, localStorage fallback, retry saat online

#### [NEW] `apps/web/src/features/canvas/components/CanvasEditor.tsx`
- HTML5 Canvas element: pointer events, wheel zoom, touch pinch
- Rough.js rendering loop (requestAnimationFrame)
- Viewport culling (render hanya elemen dalam viewport + 100px buffer)
- Target: ≥ 60 FPS dengan 500+ elemen

#### [NEW] `apps/web/src/features/canvas/components/Toolbar.tsx`
- 11 tools sesuai PRD §5.4 F-EDITOR-01
- `role="toolbar"`, aria-label, keyboard shortcut tooltip

#### [NEW] `apps/web/src/features/canvas/components/PropertiesPanel.tsx`
- Stroke color, background color, stroke width, stroke style, fill style, opacity, roughness
- Font, font size, text alignment (khusus text element)
- Edge style (khusus arrow: sharp/round/elbow)

#### [NEW] `apps/web/src/features/canvas/components/SaveIndicator.tsx`
- "Saving…" (spinner), "Saved ✓", "Unsaved changes ●", "Error saving ✕"

#### [NEW] `apps/web/src/features/canvas/components/SelectionHandler.tsx`
- Rubber band selection (drag untuk multi-select)
- Resize handles (8 arah)
- Rotation handle
- Lock icon untuk element yang di-lock

#### [NEW] `apps/web/src/routes/(authenticated)/projects/$projectId/canvas/$canvasId.tsx`
- Loader: fetch canvas data
- Mount: CanvasEditor + Toolbar + PropertiesPanel + SaveIndicator

---

### Fase 1.7 — Canvas Export

#### [NEW] `apps/web/src/features/canvas/hooks/useCanvasExport.ts`
- PNG: `canvas.toDataURL('image/png', quality)` + download
- SVG: generate SVG dari elements
- JSON: JSON.stringify canvas data + download `.json`
- Clipboard: `navigator.clipboard.write([ClipboardItem])`

#### [NEW] `apps/web/src/features/canvas/components/ExportModal.tsx`
- Format selector: PNG, SVG, JSON, Clipboard
- Opsi: background transparan (checkbox), padding (px), scale factor (1x–3x)

---

### Fase 1.8 — CI/CD & Deployment

#### [NEW] `.github/workflows/ci.yml`
- Trigger: push `main`, PR ke `main`
- Steps: `pnpm install` → lint → typecheck → `pnpm test` → `pnpm test:e2e`
- Cache: pnpm store, Turbo

#### [NEW] `.github/workflows/deploy.yml`
- Trigger: merge ke `main` setelah CI pass
- Supabase: `supabase db push --linked`
- Vercel: deploy via Vercel CLI

---

## Phase 2 — Collaboration (Bulan 3)

> **Goal:** Tim dapat berkolaborasi secara real-time di satu canvas.

---

### Fase 2.1 — Yjs + Supabase Realtime

**Workflow:** `04-realtime-collaboration.md`

#### [NEW] `apps/web/src/lib/yjs.ts`
- `getOrCreateYDoc(canvasId)` — singleton Map, satu doc per canvas session
- `destroyYDoc(canvasId)` — destroy + hapus dari Map

#### [NEW] `apps/web/src/features/canvas/hooks/useCollaboration.ts`
- Channel: `canvas:{canvasId}` dengan `self: false`
- Broadcast Yjs binary update (delta only, tidak kirim full state)
- Apply update dari user lain (origin check `'remote'` untuk cegah echo)
- Presence: track user online di canvas

#### [NEW] `apps/web/src/features/canvas/hooks/useCursorBroadcast.ts`
- Throttle 50ms (max 20 broadcast/detik)
- Payload: `{ userId, displayName, cursor: { x, y } }`

#### [MODIFY] `apps/web/src/features/canvas/stores/canvasStore.ts`
- Tambah: `collabUsers: Record<string, CollabUser>`
- Tambah actions: `setCollabUsers`, `updateUserCursor`

#### [NEW] `apps/web/src/features/canvas/components/CollabCursors.tsx`
- Render semua cursor user lain sebagai overlay di atas canvas
- Label nama + warna unik (deterministik dari userId)
- CSS transition untuk smooth movement

#### [NEW] `apps/web/src/features/canvas/components/PresenceBar.tsx`
- Avatar stack user yang sedang online
- Tooltip nama saat hover avatar
- Klik avatar → follow cursor + viewport sync

---

### Fase 2.2 — Manajemen Anggota Project

**Workflow:** `07-edge-functions.md`

#### [NEW] `supabase/functions/invite-member/index.ts`
- Verifikasi caller adalah Owner atau Admin project
- Kirim email via `supabase.auth.admin.inviteUserByEmail()`
- CORS + auth verify (`_shared/`)

#### [NEW] `supabase/functions/_shared/cors.ts` + `auth.ts`
- Shared CORS headers dan JWT verifier

#### [NEW] `apps/web/src/features/project/components/MemberManagement.tsx`
- List anggota: nama, avatar, peran, joined date
- Dropdown ubah peran (Admin/Editor/Viewer)
- Hapus anggota dengan konfirmasi
- Form invite via email + pilihan role
- Transfer ownership (dengan konfirmasi double)

#### [NEW] `apps/web/src/features/project/hooks/useProjectMembers.ts`
- Relational query: `project_members.select('*, profiles(display_name, avatar_url)')` — anti N+1
- Mutations: invite, update role, remove member

---

### Fase 2.3 — Share Link Canvas

#### [NEW] `supabase/migrations/003_canvas_share_policy.sql`
- RLS tambahan: public SELECT pada `canvas_shares` jika `is_active = true AND (expires_at IS NULL OR expires_at > now())`

#### [NEW] `apps/web/src/features/canvas/hooks/useCanvasShare.ts`
- Create share link: insert ke `canvas_shares`
- Revoke: update `is_active = false`
- Fetch active links untuk canvas

#### [NEW] `apps/web/src/features/canvas/components/ShareModal.tsx`
- Radio: Private / View Only / Edit
- Generate link → copy to clipboard
- Opsi expired date (opsional)
- Revoke button

#### [NEW] `apps/web/src/routes/share/$shareId.tsx`
- Public route (tidak perlu auth untuk view-only)
- Load canvas data via `canvas_shares`
- Mode read-only jika `access = 'view'`

---

## Phase 3 — Polish & Library (Bulan 4)

---

### Fase 3.1 — Thumbnail Auto-generate

**Workflow:** `07-edge-functions.md`

#### [NEW] `supabase/functions/generate-thumbnail/index.ts`
- Dipanggil dari `useAutoSave` setelah save berhasil
- Render canvas data ke PNG (server-side)
- Upload ke Storage bucket `thumbnails/{canvasId}.webp`
- Update `canvases.thumbnail_url`

#### [NEW] `supabase/migrations/004_storage_policies.sql`
- Bucket `thumbnails`: public read, authenticated write (owner/editor)

---

### Fase 3.2 — Element Library

#### [NEW] `packages/canvas-core/src/library/presets/`
- JSON presets: `flowchart.json`, `basic-shapes.json`, `arrows.json`, `uml.json`
- Setiap preset: array of `CanvasElement` template

#### [NEW] `apps/web/src/features/canvas/components/LibraryPanel.tsx`
- Slideover panel di kanan canvas
- Tab: "Bawaan" (presets) + "Library Saya"
- Drag-and-drop dari panel ke canvas
- Import library dari file JSON (input[type=file])
- Simpan selection ke library: tombol "Save to Library"

#### [NEW] `apps/web/src/features/canvas/hooks/useElementLibrary.ts`
- Load presets dari `canvas-core`
- Personal library: simpan di localStorage (phase 3) → Supabase (phase 4)

---

### Fase 3.3 — Advanced Canvas Operations

#### [MODIFY] `apps/web/src/features/canvas/hooks/useCanvasAdvanced.ts` [NEW]
- Snap to grid: grid overlay + snap logic per element drag/resize
- Align: left/center/right/top/middle/bottom berdasarkan bounding box
- Distribute: equalize spacing horizontal/vertikal
- Z-index: bring to front, send to back, forward, backward
- Group/Ungroup (`Ctrl+G` / `Ctrl+Shift+G`)
- Lock/Unlock elemen

#### [NEW] `apps/web/src/features/canvas/components/TrashView.tsx`
- List canvas dengan `deleted_at IS NOT NULL AND deleted_at > now() - interval '30 days'`
- Restore (set `deleted_at = null`) atau Hapus Permanent

---

### Fase 3.4 — Offline Mode

#### [MODIFY] `apps/web/src/features/canvas/hooks/useAutoSave.ts`
- Deteksi `navigator.onLine` + event listeners `online`/`offline`
- Offline: queue perubahan di localStorage
- Online: flush queue → sync semua pending ke Supabase

#### [NEW] `apps/web/src/components/OfflineBanner.tsx`
- Banner fixed bottom: "⚡ Mode Offline — perubahan disimpan lokal"
- "Syncing..." saat kembali online

---

## Phase 4 — Growth Features (Bulan 5–6)

---

### Fase 4.1 — Version History

#### [NEW] `supabase/migrations/005_canvas_versions.sql`
- Tabel `canvas_versions(id, canvas_id, data JSONB, created_by, created_at)`
- Index: `(canvas_id, created_at DESC)`
- RLS: member project bisa SELECT

#### [MODIFY] `apps/web/src/features/canvas/hooks/useAutoSave.ts`
- Setelah save berhasil: insert snapshot ke `canvas_versions`
- Maksimal simpan 50 versi per canvas (hapus yang lama via Edge Function)

#### [NEW] `apps/web/src/features/canvas/components/VersionHistory.tsx`
- Sidebar: list versi dengan timestamp + nama user
- Klik versi → preview read-only di panel kanan
- Tombol "Restore ke versi ini"

---

### Fase 4.2 — Presentation Mode

#### [NEW] `apps/web/src/features/canvas/hooks/usePresentationMode.ts`
- Definisikan "frame": rectangular area di canvas yang menjadi satu slide
- Navigasi: arrow keys, klik area frame
- Fullscreen API

#### [NEW] `apps/web/src/features/canvas/components/PresentationBar.tsx`
- Bottom bar: ◄ Slide N/M ►, Exit Presentation

---

### Fase 4.3 — Embed & Public Canvas

#### [NEW] `apps/web/src/routes/embed/$shareId.tsx`
- Minimal shell: hanya canvas, tanpa sidebar/toolbar utama
- Responsive untuk iframe embedding
- Open Graph meta tags untuk preview

---

### Fase 4.4 — Template Gallery

#### [NEW] `supabase/migrations/006_templates.sql`
- Tabel `canvas_templates(id, name, category, data JSONB, preview_url, is_public)`

#### [NEW] `apps/web/src/features/canvas/components/TemplateGallery.tsx`
- Kategori: Flowchart, Wireframe, Diagram, Retrospective, Blank
- Thumbnail + preview modal
- "Gunakan Template" → `useCreateCanvas` dengan data template

---

## Verification Plan

### Phase 1 (MVP)
- [ ] `pnpm dev` berjalan di semua packages tanpa error
- [ ] `supabase db reset` berjalan bersih dari nol
- [ ] Registrasi Email, login Google, login GitHub berfungsi
- [ ] Profile auto-created setelah register (trigger)
- [ ] CRUD project: buat, edit nama/warna/ikon, hapus (cascade)
- [ ] CRUD canvas: buat, rename, hapus (soft delete), duplicate, reorder
- [ ] Editor: 10 tools berfungsi + properti element dapat diubah
- [ ] Undo/redo 100 langkah
- [ ] Auto-save ke Supabase setelah 1 detik idle
- [ ] localStorage fallback saat koneksi gagal
- [ ] Export PNG, SVG, JSON, Clipboard
- [ ] Lighthouse ≥ 90 (Performance + Accessibility)
- [ ] `pnpm test --coverage` ≥ 70%
- [ ] `pnpm test:e2e`: login, buat project, buka canvas, gambar, auto-save

### Phase 2 (Collaboration)
- [ ] 2 user di 2 tab berbeda bisa edit canvas bersamaan
- [ ] Cursor user lain visible (< 100ms latency)
- [ ] Invite member via email → user dapat akses sesuai role
- [ ] RLS: viewer tidak bisa edit, editor bisa, admin bisa kelola member
- [ ] Share link view-only: non-member bisa lihat
- [ ] Share link edit: non-member bisa edit

### Phase 3 (Polish)
- [ ] Thumbnail muncul di Project View setelah save
- [ ] Library preset tersedia dan bisa di-drag ke canvas
- [ ] Soft delete canvas + restore dalam 30 hari
- [ ] Offline banner muncul saat disconnect, sync saat online

### Phase 4 (Growth)
- [ ] Version history list snapshot per save
- [ ] Restore ke versi lama berfungsi
- [ ] Presentation mode fullscreen dengan navigasi slide
- [ ] Embed canvas accessible tanpa login (jika share link aktif)
- [ ] Template gallery dapat membuat canvas baru dari template
