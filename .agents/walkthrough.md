# Walkthrough — Fase 1.2: Supabase Setup & Database Schema

**Tanggal Selesai:** 2026-09-16  
**Fase yang Dikerjakan:** Fase 1.2 (Supabase Setup & Database Schema)

---

## Ringkasan Perubahan

### File Baru
- **`supabase/migrations/001_initial_schema.sql`**:
  - Ekstensi `uuid-ossp`
  - Enums `project_role` (`viewer`, `editor`, `admin`), `share_access` (`view`, `edit`)
  - Tabel `profiles`: PK references `auth.users(id)` ON DELETE CASCADE, unique `username`, `display_name`, `avatar_url`, timestamps
  - Tabel `projects`: PK UUID, `owner_id` references `auth.users(id)`, `name`, `description`, `color`, `icon`, timestamps
  - Tabel `project_members`: Composite PK `(project_id, user_id)`, `role`, `invited_by`, `joined_at`
  - Tabel `canvases`: PK UUID, `project_id`, `name`, `data` (`jsonb`), `thumbnail_url`, `order_index`, soft delete `deleted_at`, `created_by`, `last_edited_by`, timestamps
  - Tabel `canvas_shares`: PK UUID, `canvas_id`, `created_by`, `access`, `password`, `is_active`, `expires_at`, timestamps
  - 6 Indexes sesuai PRD §8.1 (`idx_projects_owner`, `idx_project_members_user`, `idx_canvases_project`, `idx_canvases_deleted`, `idx_canvases_order`, `idx_canvas_shares_canvas`)
  - Trigger `update_updated_at()` otomatis pada `profiles`, `projects`, `canvases`
  - RLS Policies lengkap pada 5 tabel (`profiles`, `projects`, `project_members`, `canvases`, `canvas_shares`)
- **`supabase/migrations/002_profile_trigger.sql`**:
  - Fungsi `public.handle_new_user()` dengan `SECURITY DEFINER`
  - Trigger `on_auth_user_created` `AFTER INSERT ON auth.users` untuk auto-insert row ke tabel `public.profiles` saat registrasi
- **`supabase/seed.sql`**:
  - 2 test users (`alex@pulas.io`, `bella@pulas.io`)
  - 2 test projects ("Design System Whiteboard", "Sprint Planning Q4")
  - Project membership (Bella sebagai editor)
  - 3 canvases dengan data elemen dummy (`rectangle`, `ellipse`, `arrow`, `text`)
- **`.env.example` & `apps/web/.env.example`**:
  - Template konfigurasi kredensial `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`

### File Dimodifikasi
- **`packages/types/src/database.types.ts`**:
  - Sinkronisasi tipe `Database` TypeScript agar 100% presisi dengan skema database SQL
- **`.agents/task.md`**:
  - Checklist Fase 1.2 ditandai selesai (`[x]`)
- **`.agents/rules/rules.md`**:
  - Ditambahkan aturan pengecualian eksekusi langsung untuk perintah `/workflow`

---

## Langkah Pengujian Manual

1. **Review Migrasi SQL**:
   Buka file [001_initial_schema.sql](file:///Users/md101/dev/js/pulas-io/supabase/migrations/001_initial_schema.sql) dan [002_profile_trigger.sql](file:///Users/md101/dev/js/pulas-io/supabase/migrations/002_profile_trigger.sql).
   - **Expected result:** Semua definisi tabel memiliki constraint foreign key yang tepat, RLS di-enable, policy mencakup operasi CRUD sesuai role pengguna, dan trigger auto-update serta auto-create profile terpasang.
2. **Deploy ke Supabase Dashboard / Local**:
   - Jika menggunakan Supabase Cloud: Salin isi `001_initial_schema.sql` dan `002_profile_trigger.sql` ke Supabase SQL Editor atau jalankan `supabase db push --linked`.
   - Jika menggunakan Supabase Local: Jalankan `supabase db reset` saat Docker aktif.
   - **Expected result:** Skema terpasang tanpa sintaks error, tabel muncul di Table Editor, dan RLS policies aktif di Authentication → Policies.

---

## Pengujian Otomatis

### 1. Typecheck Workspace
```bash
pnpm run typecheck
```
- **Hasil:** 5 package lulus validasi tipe TypeScript (`@pulas/types`, `@pulas/utils`, `@pulas/canvas-core`, `@pulas/ui`, `@pulas/web`).

### 2. Unit Tests (Vitest)
```bash
pnpm run test
```
- **Hasil:** 22/22 unit tests lulus passing di `@pulas/utils` dan `@pulas/canvas-core`.

---

## Known Issues / Catatan
- File migrasi sepenuhnya dirancang idempotent (`IF NOT EXISTS`, `CREATE OR REPLACE`, `DROP POLICY IF EXISTS`).
- Siap digunakan langsung untuk tahap selanjutnya: **Fase 1.3 — Authentication**.
