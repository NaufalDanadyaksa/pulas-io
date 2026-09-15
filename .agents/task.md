# Task Tracker — pulas.io

**Terakhir diupdate:** 15 September 2026  
**Status keseluruhan:** Belum dimulai

Legend: `[ ]` belum dimulai · `[/]` sedang berjalan · `[x]` selesai

---

## PHASE 1 — MVP (Bulan 1–2)

### Fase 1.1 — Monorepo & Infrastruktur Dasar
- [x] **Sub-Fase 1.1.A — Monorepo Root & Core Packages**
  - [x] Setup root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.json`, `.gitignore`
  - [x] Setup `packages/types/` (`@pulas/types`) — DB stubs, canvas types, presence types
  - [x] Setup `packages/utils/` (`@pulas/utils`) — `cn()`, `formatDate()`, `generateUserColor()`, `nanoid` helper
  - [x] Tulis unit tests di `packages/utils/` dengan Vitest
- [x] **Sub-Fase 1.1.B — Canvas Engine Foundation**
  - [x] Setup `packages/canvas-core/` (`@pulas/canvas-core`)
  - [x] Element types + Zod schema validation (rectangle, ellipse, arrow, line, text, freedraw, image)
  - [x] Element factories (`createCanvasElement`)
  - [x] Rough.js renderer wrapper adapter
  - [x] Viewport culling calculation helper
  - [x] History manager class (undo/redo stack, max 100 langkah)
  - [x] Tulis unit tests di `packages/canvas-core/` dengan Vitest
- [x] **Sub-Fase 1.1.C — UI Package & Web App Shell**
  - [x] Setup `packages/ui/` (`@pulas/ui`) — Tailwind v4 + Radix UI primitives (`Button`, `Input`, `Dialog`, `Select`, `Toast`, `Skeleton`, `Avatar`, `Badge`)
  - [x] Setup `apps/web/` (`@pulas/web`) — Vite + React 19 + TypeScript strict mode
  - [x] Setup TanStack Router route tree & root layout shell
  - [x] Setup TanStack Query client & Zustand store boilerplate
  - [x] Setup Tailwind CSS v4 design tokens di `apps/web/`
  - [x] Verifikasi build monorepo: `pnpm run typecheck`, `pnpm run test`, `pnpm run build`


---

### Fase 1.2 — Supabase Setup & Database Schema

- [ ] Buat Supabase project (Auth + DB + Storage + Realtime)
- [ ] Setup Supabase CLI dan link ke project
- [ ] Buat `supabase/migrations/001_initial_schema.sql`
  - [ ] Tabel `profiles`
  - [ ] Tabel `projects`
  - [ ] Tabel `project_members` + enum `project_role`
  - [ ] Tabel `canvases`
  - [ ] Tabel `canvas_shares` + enum `share_access`
  - [ ] Semua indexes (6 indexes sesuai PRD §8.1)
  - [ ] Trigger `update_updated_at()` + 3 trigger bindings
  - [ ] RLS enabled + policies semua tabel
- [ ] Buat `supabase/migrations/002_profile_trigger.sql`
  - [ ] Fungsi `handle_new_user()`
  - [ ] Trigger `on_auth_user_created`
- [ ] Buat `supabase/seed.sql` (2 users, 2 projects, 3 canvases)
- [ ] Jalankan `supabase db reset` — pastikan clean
- [ ] Generate TypeScript types: `supabase gen types typescript`
- [ ] Verifikasi RLS: test setiap policy dengan user berbeda

---

### Fase 1.3 — Authentication

- [ ] Buat `apps/web/src/lib/supabase.ts` — client dengan typed Database
- [ ] Enable Email auth di Supabase Dashboard
- [ ] Enable Google OAuth di Supabase Dashboard (setup Google Console)
- [ ] Enable GitHub OAuth di Supabase Dashboard (setup GitHub App)
- [ ] Buat `apps/web/src/stores/authStore.ts`
  - [ ] State: user, session, isLoading
  - [ ] Action: `initialize()`, `signOut()`
  - [ ] Subscribe `onAuthStateChange`
- [ ] Buat `apps/web/src/features/auth/schemas/auth.schema.ts`
  - [ ] `loginSchema`, `registerSchema`, `resetPasswordSchema`
- [ ] Buat `apps/web/src/features/auth/components/LoginForm.tsx`
  - [ ] RHF + Zod, error display per field, aria-* attributes
- [ ] Buat `apps/web/src/features/auth/components/RegisterForm.tsx`
  - [ ] Konfirmasi password dengan `.refine()`
- [ ] Buat `apps/web/src/features/auth/components/OAuthButtons.tsx`
  - [ ] Google + GitHub OAuth buttons
- [ ] Buat `apps/web/src/routes/auth/callback.tsx`
- [ ] Buat `apps/web/src/routes/_authenticated.tsx` — protected layout
- [ ] Test: login email, register, OAuth Google, OAuth GitHub
- [ ] Test: unauthenticated access redirect ke `/login`

---

### Fase 1.4 — Dashboard & Manajemen Project

- [ ] Buat `apps/web/src/features/project/schemas/project.schema.ts`
  - [ ] `createProjectSchema`, `updateProjectSchema`
- [ ] Buat `apps/web/src/features/project/hooks/useProjects.ts`
  - [ ] Relational query (anti N+1)
  - [ ] Query key factory
- [ ] Buat `apps/web/src/features/project/hooks/useProjectMutations.ts`
  - [ ] `useCreateProject`, `useUpdateProject`, `useDeleteProject`, `useDuplicateProject`
- [ ] Buat `apps/web/src/features/project/components/ProjectCard.tsx`
  - [ ] role="button", tabIndex, unique id, keyboard accessible
- [ ] Buat `apps/web/src/features/project/components/ProjectGrid.tsx`
  - [ ] Loading skeleton, empty state, sort options
- [ ] Buat `apps/web/src/features/project/components/CreateProjectModal.tsx`
  - [ ] Nama, deskripsi, color picker (12 preset), ikon selector
- [ ] Buat `apps/web/src/routes/(authenticated)/dashboard.tsx`
  - [ ] Loader: prefetch project list
  - [ ] Search, sort, pagination (12 per halaman)
- [ ] Test: CRUD project semua berfungsi
- [ ] Test: RLS — user tidak bisa lihat project orang lain

---

### Fase 1.5 — Project View & Manajemen Canvas

- [ ] Buat `apps/web/src/features/canvas/schemas/canvas.schema.ts`
  - [ ] `createCanvasSchema`, `canvasDataSchema`
- [ ] Buat `apps/web/src/features/canvas/hooks/useCanvases.ts`
  - [ ] Filter `deleted_at IS NULL`, join profil last_edited_by
- [ ] Buat `apps/web/src/features/canvas/hooks/useCanvasMutations.ts`
  - [ ] Create, rename, soft delete, duplicate, reorder (batch upsert), restore
- [ ] Buat `apps/web/src/features/canvas/components/CanvasCard.tsx`
  - [ ] Thumbnail, inline rename, last edit meta, drag handle
- [ ] Buat `apps/web/src/features/canvas/components/CanvasGrid.tsx`
  - [ ] Grid/list toggle, drag-and-drop (`@dnd-kit/core`), skeleton, empty state
- [ ] Buat `apps/web/src/routes/(authenticated)/projects/$projectId/index.tsx`
  - [ ] Loader: prefetch canvases
  - [ ] Breadcrumb
- [ ] Test: CRUD canvas semua berfungsi
- [ ] Test: reorder drag-and-drop berfungsi
- [ ] Test: soft delete → canvas tidak muncul di list

---

### Fase 1.6 — Canvas Editor Core

- [ ] Buat `apps/web/src/features/canvas/stores/canvasStore.ts`
  - [ ] Zustand + immer + subscribeWithSelector
  - [ ] Semua state dan actions terdefinisi
- [ ] Buat `apps/web/src/features/canvas/hooks/useCanvasTools.ts`
  - [ ] 11 keyboard shortcuts (V/1 hingga H/Space)
  - [ ] Skip saat focus di input/textarea
- [ ] Buat `apps/web/src/features/canvas/hooks/useCanvasHistory.ts`
  - [ ] Undo Ctrl+Z, Redo Ctrl+Y / Ctrl+Shift+Z
- [ ] Buat `apps/web/src/features/canvas/hooks/useAutoSave.ts`
  - [ ] Debounce 1000ms
  - [ ] localStorage fallback
  - [ ] Sync saat online
- [ ] Buat `apps/web/src/features/canvas/components/CanvasEditor.tsx`
  - [ ] HTML5 Canvas + pointer events
  - [ ] Wheel zoom + pan
  - [ ] Touch pinch zoom
  - [ ] Rough.js rendering loop (rAF)
  - [ ] Viewport culling
- [ ] Buat `apps/web/src/features/canvas/components/Toolbar.tsx`
  - [ ] 11 tools dengan active state, shortcut tooltip
  - [ ] role="toolbar", aria-label
- [ ] Buat `apps/web/src/features/canvas/components/PropertiesPanel.tsx`
  - [ ] Stroke color + color picker
  - [ ] Background color + color picker
  - [ ] Stroke width (3 pilihan)
  - [ ] Stroke style (solid/dashed/dotted)
  - [ ] Fill style (none/hachure/cross-hatch/solid)
  - [ ] Opacity slider (0–100)
  - [ ] Roughness slider (0–2)
  - [ ] Font + font size (untuk text)
  - [ ] Text alignment (untuk text)
  - [ ] Edge style (untuk arrow)
- [ ] Buat `apps/web/src/features/canvas/components/SaveIndicator.tsx`
- [ ] Buat `apps/web/src/features/canvas/components/SelectionHandler.tsx`
  - [ ] Rubber band selection
  - [ ] Resize handles (8 arah)
  - [ ] Rotation handle
- [ ] Buat `apps/web/src/routes/(authenticated)/projects/$projectId/canvas/$canvasId.tsx`
- [ ] Test: semua 10 tools menggambar dengan benar
- [ ] Test: properti elemen dapat diubah
- [ ] Test: undo/redo 100 langkah
- [ ] Test: auto-save setelah 1 detik (cek Supabase)
- [ ] Test: Lighthouse Performance ≥ 90, Accessibility ≥ 90
- [ ] Test: 500+ elemen → ≥ 60 FPS

---

### Fase 1.7 — Canvas Export

- [ ] Buat `apps/web/src/features/canvas/hooks/useCanvasExport.ts`
  - [ ] Export PNG, SVG, JSON, Clipboard
- [ ] Buat `apps/web/src/features/canvas/components/ExportModal.tsx`
  - [ ] Format selector, opsi transparan/padding/scale
- [ ] Test: download PNG berfungsi
- [ ] Test: download SVG berfungsi dan bisa dibuka di browser
- [ ] Test: download JSON berfungsi dan bisa di-restore
- [ ] Test: copy ke clipboard berfungsi

---

### Fase 1.8 — CI/CD & Deployment

- [ ] Buat `.github/workflows/ci.yml`
  - [ ] lint, typecheck, test, e2e
  - [ ] Cache pnpm + Turbo
- [ ] Buat `.github/workflows/deploy.yml`
  - [ ] Supabase DB push + Vercel deploy
- [ ] Setup Vercel project + environment variables
- [ ] Setup Supabase production project + link
- [ ] Test: CI pipeline hijau di GitHub Actions
- [ ] Test: deploy ke Vercel production berhasil

---

## PHASE 2 — Collaboration (Bulan 3)

### Fase 2.1 — Yjs + Supabase Realtime

- [ ] Install: `yjs`, `@supabase/realtime-js`
- [ ] Buat `apps/web/src/lib/yjs.ts`
  - [ ] `getOrCreateYDoc()`, `destroyYDoc()`
- [ ] Buat `apps/web/src/features/canvas/hooks/useCollaboration.ts`
  - [ ] Channel subscribe, Yjs update broadcast
  - [ ] Apply update dari user lain (origin check)
  - [ ] Presence tracking
- [ ] Buat `apps/web/src/features/canvas/hooks/useCursorBroadcast.ts`
  - [ ] Throttle 50ms
- [ ] Modifikasi `canvasStore.ts` — tambah collabUsers state
- [ ] Buat `apps/web/src/features/canvas/components/CollabCursors.tsx`
  - [ ] Render cursor user lain, label nama + warna
- [ ] Buat `apps/web/src/features/canvas/components/PresenceBar.tsx`
  - [ ] Avatar stack, tooltip, follow viewport
- [ ] Test: 2 tab → edit bersamaan
- [ ] Test: cursor user lain visible real-time (< 100ms)
- [ ] Test: tidak ada echo loop

---

### Fase 2.2 — Manajemen Anggota Project

- [ ] Buat `supabase/functions/_shared/cors.ts`
- [ ] Buat `supabase/functions/_shared/auth.ts`
- [ ] Buat `supabase/functions/invite-member/index.ts`
  - [ ] Verifikasi caller sebagai Admin/Owner
  - [ ] Kirim email via `auth.admin.inviteUserByEmail()`
- [ ] Deploy Edge Function: `supabase functions deploy invite-member`
- [ ] Buat `apps/web/src/features/project/hooks/useProjectMembers.ts`
  - [ ] Relational query (join profiles, anti N+1)
- [ ] Buat `apps/web/src/features/project/components/MemberManagement.tsx`
  - [ ] List member + peran
  - [ ] Ubah peran, hapus, transfer ownership
  - [ ] Form invite
- [ ] Test: invite → user dapat akses sesuai role
- [ ] Test: RLS viewer tidak bisa edit
- [ ] Test: RLS admin bisa kelola member

---

### Fase 2.3 — Share Link Canvas

- [ ] Buat `supabase/migrations/003_canvas_share_policy.sql`
- [ ] Buat `apps/web/src/features/canvas/hooks/useCanvasShare.ts`
- [ ] Buat `apps/web/src/features/canvas/components/ShareModal.tsx`
  - [ ] Private/View Only/Edit toggle
  - [ ] Copy link, expired date, revoke
- [ ] Buat `apps/web/src/routes/share/$shareId.tsx`
  - [ ] Public access canvas read-only
- [ ] Test: share link view-only accessible tanpa login
- [ ] Test: share link edit bisa mengedit
- [ ] Test: revoke link → 404/forbidden

---

## PHASE 3 — Polish & Library (Bulan 4)

### Fase 3.1 — Thumbnail Auto-generate
- [ ] Buat `supabase/migrations/004_storage_policies.sql`
- [ ] Buat `supabase/functions/generate-thumbnail/index.ts`
- [ ] Integrasikan panggilan thumbnail setelah auto-save berhasil
- [ ] Test: thumbnail muncul di CanvasCard setelah save

### Fase 3.2 — Element Library
- [ ] Buat preset JSON di `packages/canvas-core/src/library/presets/`
  - [ ] `flowchart.json`, `basic-shapes.json`, `arrows.json`
- [ ] Buat `apps/web/src/features/canvas/components/LibraryPanel.tsx`
  - [ ] Tab bawaan + personal, drag-and-drop, import JSON
- [ ] Buat `apps/web/src/features/canvas/hooks/useElementLibrary.ts`
- [ ] Test: drag elemen dari library ke canvas

### Fase 3.3 — Advanced Canvas Operations
- [ ] Buat `apps/web/src/features/canvas/hooks/useCanvasAdvanced.ts`
  - [ ] Snap to grid, align, distribute, z-index, group, lock
- [ ] Buat `apps/web/src/features/canvas/components/TrashView.tsx`
  - [ ] List deleted canvas, restore, permanent delete
- [ ] Test: semua fitur advanced berfungsi

### Fase 3.4 — Offline Mode
- [ ] Modifikasi `useAutoSave.ts` — deteksi online/offline, queue + flush
- [ ] Buat `apps/web/src/components/OfflineBanner.tsx`
- [ ] Test: disconnect WiFi → banner muncul, reconnect → sync

---

## PHASE 4 — Growth Features (Bulan 5–6)

### Fase 4.1 — Version History
- [ ] Buat `supabase/migrations/005_canvas_versions.sql`
- [ ] Modifikasi `useAutoSave.ts` → insert snapshot ke `canvas_versions`
- [ ] Buat `apps/web/src/features/canvas/components/VersionHistory.tsx`
- [ ] Test: list versi, preview, restore

### Fase 4.2 — Presentation Mode
- [ ] Buat `apps/web/src/features/canvas/hooks/usePresentationMode.ts`
- [ ] Buat `apps/web/src/features/canvas/components/PresentationBar.tsx`
- [ ] Test: fullscreen, navigasi antar frame

### Fase 4.3 — Embed Canvas
- [ ] Buat `apps/web/src/routes/embed/$shareId.tsx`
- [ ] Test: embed iframe berfungsi di halaman eksternal

### Fase 4.4 — Template Gallery
- [ ] Buat `supabase/migrations/006_templates.sql`
- [ ] Buat `apps/web/src/features/canvas/components/TemplateGallery.tsx`
- [ ] Test: pilih template → canvas baru dengan data template

---

## Testing Checklist (Setiap Phase)

### Unit + Integration Tests (Vitest)
- [ ] Zod schemas: valid input, invalid input, default values
- [ ] Custom hooks: happy path + error path (mock Supabase)
- [ ] Canvas store: setiap action menghasilkan state yang benar
- [ ] History manager: undo/redo tidak merusak state

### Component Tests (Testing Library)
- [ ] ProjectCard: render, klik, keyboard
- [ ] LoginForm: submit valid, submit invalid, error display
- [ ] CanvasCard: rename inline, drag handle
- [ ] ShareModal: toggle akses, copy link

### E2E Tests (Playwright)
- [ ] Flow 1: Register → Dashboard → Buat Project → Buat Canvas → Gambar → Auto-save
- [ ] Flow 2: Login Google → Dashboard
- [ ] Flow 3: Invite member → member login → akses project
- [ ] Flow 4: Share link → non-member buka canvas read-only
- [ ] Flow 5: Offline → gambar → reconnect → tersinkron

### Coverage Target
- [ ] `pnpm test:coverage` ≥ 70%
