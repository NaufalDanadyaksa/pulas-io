# Walkthrough — Fase 1.4: Dashboard & Manajemen Project

**Tanggal Selesai:** 2026-09-17  
**Fase yang Dikerjakan:** Fase 1.4 (Dashboard & Manajemen Project)

---

## Ringkasan Perubahan

### File Baru

1. **`apps/web/src/features/project/schemas/project.schema.ts`**:
   - Skema validasi Zod untuk pembuatan dan pembaruan project (`createProjectSchema`, `updateProjectSchema`).
   - Validasi nama (1–100 karakter, trim), deskripsi (maksimal 500 karakter), validasi format hex warna (`/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/`), dan ikon project.
   - Definisi 12 preset warna tema (`PROJECT_COLOR_PRESETS`) dan 12 ikon project terkurasi (`PROJECT_ICON_NAMES`).
   - Ekspor TypeScript types yang terinferensi: `CreateProjectInput`, `UpdateProjectInput`, `ProjectIconName`.

2. **`apps/web/src/features/project/types/project.types.ts`**:
   - Definisi tipe data relasional project berbasis schema Supabase: `ProjectRow`, `CanvasRow`, `ProjectMemberRow`.
   - Antarmuka relasional: `ProjectCanvasSummary`, `ProjectMemberSummary`, `ProjectWithRelations` (mengikutsertakan relasi `canvases` dan `project_members`).
   - Tipe opsi pengurutan: `ProjectSortOption` (`'updated_desc' | 'created_desc' | 'name_asc'`).

3. **`apps/web/src/features/project/hooks/useProjects.ts`**:
   - Query key factory `projectKeys` untuk TanStack Query v5 (`all`, `lists`, `list(userId)`, `details`, `detail(id)`).
   - Relational query Supabase anti N+1:
     ```typescript
     projects.select('*, project_members(user_id, role), canvases(id, name, thumbnail_url, updated_at, deleted_at)')
     ```
   - Penyaringan soft-deleted canvases (`deleted_at IS NULL`).
   - Konfigurasi caching `staleTime: 5 menit`.
   - Fungsi `useProjects(userId)` dan `useProjectDetail(projectId)`.

4. **`apps/web/src/features/project/hooks/useProjectMutations.ts`**:
   - `useCreateProject`: Memvalidasi input via Zod di client-side, insert data project dengan `owner_id = user.id`, mendaftarkan owner sebagai `admin` di `project_members`, serta invalidasi cache daftar project.
   - `useUpdateProject`: Memvalidasi payload parsial via Zod, update baris di tabel `projects`, dan otomatis menginvalidasi detail & daftar project.
   - `useDeleteProject`: Menghapus project beserta relasi canvas dan members dengan clean error handling serta invalidasi cache.
   - `useDuplicateProject`: Duplikasi project dan seluruh canvas aktif di dalamnya dalam satu alur operasi dengan penamaan `(Salinan)`.

5. **`apps/web/src/features/project/stores/projectUIStore.ts`**:
   - Granular UI state management menggunakan Zustand + Immer:
     - State pencarian (`searchQuery`), pengurutan (`sortBy`), paginasi (`currentPage`).
     - State modal: `isCreateModalOpen`, `editingProject`, `deletingProject`.
     - Actions: `setSearchQuery` (otomatis reset ke halaman 1), `setSortBy`, `setCurrentPage`, `openCreateModal`, `openEditModal`, `openDeleteModal`, dll.

6. **`apps/web/src/features/project/components/ProjectIcon.tsx`**:
   - Komponen pemetaan nama ikon string (`folder`, `palette`, `layout`, `briefcase`, `star`, `code`, `book`, `box`, `zap`, `globe`, `smile`, `coffee`) ke komponen Lucide Icons secara dinamis dengan fallback aman.

7. **`apps/web/src/features/project/components/ProjectCard.tsx`**:
   - Komponen kartu project yang aksesibel:
     - Atribut aksesibilitas: `role="button"`, `tabIndex={0}`, unique id `project-card-{id}`, keyboard accessible (`Enter` dan `Space`).
     - Visual hand-drawn accents: Icon container dengan tint warna custom (`${color}1A`) dan border dinamis.
     - Menampilkan nama, deskripsi, jumlah canvas (`X canvases`), jumlah member, serta waktu pembaruan relatif via `formatRelativeTime`.
     - Tombol aksi: Edit, Duplikasi, dan Hapus dengan `e.stopPropagation()` dan `aria-label` deskriptif.

8. **`apps/web/src/features/project/components/ProjectCardSkeleton.tsx`**:
   - Loading placeholder skeleton untuk kartu project menggunakan komponen `@pulas/ui` `Skeleton`.

9. **`apps/web/src/features/project/components/ProjectGrid.tsx`**:
   - Komponen manajemen tampilan daftar project:
     - Search bar dengan input pembersih (clear icon `X`).
     - Sort selector dropdown: "Terakhir Diperbarui", "Terbaru Dibuat", dan "Nama (A–Z)".
     - Responsive grid layout (1 kolom mobile, 2 kolom tablet, 3 kolom desktop).
     - Empty state ramah pengguna: Ilustrasi `FolderOpen` dan tombol ajakan aksi "Buat Project Pertama".
     - State pencarian nihil: Ilustrasi not found dan tombol "Hapus Pencarian".
     - Paginasi: 12 project per halaman dengan tombol sebelumnya/berikutnya dan indikator halaman.

10. **`apps/web/src/features/project/components/CreateProjectModal.tsx`**:
    - Dialog pembuatan project menggunakan Radix UI + React Hook Form + Zod.
    - Input nama (wajib), textarea deskripsi (opsional).
    - Grid pemilih 12 preset warna tema dengan indikator radio check + input hex manual.
    - Grid pemilih 12 ikon project interaktif.
    - Status loading interaktif (`aria-busy`, spinner `Loader2`).

11. **`apps/web/src/features/project/components/EditProjectModal.tsx`**:
    - Dialog pembaruan project yang memuat nilai awal project dan menangani mutasi `useUpdateProject`.

12. **`apps/web/src/features/project/components/DeleteProjectDialog.tsx`**:
    - Dialog konfirmasi destruktif dengan peringatan jumlah canvas yang akan terhapus secara permanen.

13. **`apps/web/src/features/project/index.ts`**:
    - Barrel export publik untuk seluruh hooks, schemas, types, dan komponen modul project.

14. **Suite Pengujian Unit & Komponen**:
    - `apps/web/src/features/project/__tests__/project.schema.test.ts` (11 tests)
    - `apps/web/src/features/project/__tests__/ProjectCard.test.tsx` (5 tests)
    - `apps/web/src/features/project/__tests__/ProjectGrid.test.tsx` (7 tests)
    - `apps/web/src/features/project/__tests__/CreateProjectModal.test.tsx` (5 tests)
    - `apps/web/src/features/project/__tests__/useProjects.test.ts` (4 tests)
    - `apps/web/src/features/project/__tests__/projectUIStore.test.ts` (4 tests)

### File Dimodifikasi

1. **`apps/web/src/features/dashboard/pages/DashboardPage.tsx`**:
   - Terintegrasi penuh dengan hook data riil `useProjects(user?.id)` dan state `useProjectUIStore`.
   - Metrik statistik atas terhitung secara dinamis:
     - **Total Projects**: jumlah project aktif milik pengguna.
     - **Canvas Aktif**: total akumulasi canvas aktif di seluruh project pengguna.
     - **Session User ID**: ID sesi Supabase pengguna aktif.
   - Menghubungkan kontrol modal: Buat Project Baru, Edit Project, Hapus Project, dan Duplikasi.
2. **`apps/web/src/routes/router.tsx`**:
   - Pendaftaran rute rujukan `projectDetailRoute` (`/projects/$projectId`) di dalam layout terautentikasi `_authenticated` untuk transisi mulus ke Fase 1.5.
3. **`.agents/task.md`**:
   - Memperbarui status keseluruhan dan menandai semua item Fase 1.4 sebagai selesai (`[x]`).

---

## Langkah Pengujian Manual

1. **Jalankan Aplikasi Frontend**:
   ```bash
   pnpm --filter @pulas/web dev
   ```
   Buka peramban pada `http://localhost:5173/login`.

2. **Login dan Masuk ke Dashboard**:
   - Masukkan akun yang sudah terdaftar atau daftar akun baru di `/register`.
   - Setelah masuk, pengguna akan diarahkan ke `/dashboard`.
   - **Expected result:**
     - Header atas menampilkan Avatar nama pengguna dan status "Terverifikasi".
     - Tiga kartu ringkasan di atas menampilkan `Total Projects`, `Canvas Aktif`, dan `Session User ID`.
     - Jika belum ada project, tampil container empty state dengan ikon dan tombol "Buat Project Pertama".

3. **Membuat Project Baru**:
   - Klik tombol "Project Baru" di header atau tombol di empty state.
   - **Expected result:** Modal dialog "Buat Project Baru" terbuka.
   - Masukkan nama: "Design System Whiteboard".
   - Masukkan deskripsi: "Sketsa komponen UI pulas.io".
   - Pilih warna tema (misal: Hijau Emerald `#10b981`).
   - Pilih ikon (misal: `palette`).
   - Klik "Buat Project".
   - **Expected result:** Modal tertutup, kartu project muncul seketika di grid dengan aksen warna hijau dan ikon palette. Metrik "Total Projects" bertambah menjadi `1`.

4. **Mencari dan Mengurutkan Project**:
   - Ketik kata kunci pada kotak pencarian (misal: "Design").
   - **Expected result:** Grid memfilter secara langsung menampilkan project yang sesuai.
   - Ketik kata kunci yang tidak ada (misal: "XYZABC").
   - **Expected result:** Tampil pesan "Tidak ada project yang cocok" dengan tombol "Hapus Pencarian".
   - Klik "Hapus Pencarian": semua project kembali ditampilkan.
   - Ganti opsi urutan ke "Nama (A–Z)": kartu terurut sesuai abjad.

5. **Aksi Kartu Project (Duplikasi, Edit, Hapus)**:
   - Klik tombol **Duplikasi** (ikon copy): project baru dengan nama "Design System Whiteboard (Salinan)" terbuat.
   - Klik tombol **Edit** (ikon pensil): modal edit terbuka; ubah nama atau warna; klik simpan; kartu diperbarui.
   - Klik tombol **Hapus** (ikon tempat sampah): dialog konfirmasi terbuka; klik "Hapus Project"; project terhapus dan statistik total project berkurang.
   - Klik pada badan kartu project: diarahkan ke rute `/projects/<projectId>` (halaman placeholder siap untuk Fase 1.5).

---

## Pengujian Otomatis

### 1. Typecheck Monorepo (TypeScript Strict Mode)
```bash
pnpm run typecheck
```
- **Hasil:** 5 dari 5 paket (`@pulas/types`, `@pulas/utils`, `@pulas/canvas-core`, `@pulas/ui`, `@pulas/web`) lulus 100% tanpa error ketik.

### 2. Unit & Component Test Suite
```bash
pnpm run test
```
- **Hasil:** 12 test files dan **63 tests lulus** tanpa kegagalan:
  - `apps/web/src/features/project/__tests__/project.schema.test.ts` (11 tests)
  - `apps/web/src/features/project/__tests__/ProjectCard.test.tsx` (5 tests)
  - `apps/web/src/features/project/__tests__/ProjectGrid.test.tsx` (7 tests)
  - `apps/web/src/features/project/__tests__/CreateProjectModal.test.tsx` (5 tests)
  - `apps/web/src/features/project/__tests__/useProjects.test.ts` (4 tests)
  - `apps/web/src/features/project/__tests__/projectUIStore.test.ts` (4 tests)
  - `apps/web/src/features/auth/__tests__/*` (27 tests)

### 3. Production Build Monorepo
```bash
pnpm run build
```
- **Hasil:** Berhasil mengompilasi bundel produksi Vite (`dist/assets/index-*.js` dan `dist/assets/index-*.css`) tanpa error.

---

## Known Issues / Catatan
- Navigasi saat memilih kartu project saat ini mengarah ke rute placeholder `/projects/$projectId`. Halaman detail project dengan manajemen canvas (kanvas list, kanvas drag-and-drop, duplikasi kanvas) akan diimplementasikan secara komprehensif pada **Fase 1.5 (Project View & Manajemen Canvas)**.
