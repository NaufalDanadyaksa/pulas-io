---
description: Workflow untuk membuat dan menjalankan migrasi database Supabase menggunakan Supabase CLI. Gunakan setiap kali ada perubahan schema database (tabel baru, kolom baru, RLS policy, index).
---

# Workflow: Supabase Database Migration

## Kapan Digunakan
- Menambah tabel baru
- Mengubah kolom atau tipe data
- Menambah/mengubah RLS policy
- Menambah/mengubah index
- Menambah enum baru

## Langkah-langkah

### 1. Buat file migrasi baru
```bash
# Selalu gunakan nama deskriptif dengan snake_case
supabase migration new <nama_deskriptif>
# Contoh:
supabase migration new add_canvas_shares_table
supabase migration new add_rls_policy_project_members
```

### 2. Tulis SQL di file migrasi
File akan dibuat di `supabase/migrations/<timestamp>_<nama>.sql`.

**Struktur wajib untuk setiap migrasi:**
```sql
-- ============================================================
-- Migration: <nama migrasi>
-- Tanggal: <tanggal>
-- Deskripsi: <apa yang diubah dan mengapa>
-- ============================================================

-- PASTIKAN: idempotent dengan IF NOT EXISTS / IF EXISTS
CREATE TABLE IF NOT EXISTS nama_tabel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);

-- INDEX: selalu buat untuk foreign key dan kolom yang sering di-query
CREATE INDEX IF NOT EXISTS idx_nama_tabel_kolom ON nama_tabel(kolom);

-- RLS: wajib untuk semua tabel yang diakses client
ALTER TABLE nama_tabel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deskripsi policy yang jelas"
  ON nama_tabel FOR SELECT
  USING (auth.uid() = user_id);
```

**Aturan SQL:**
- Selalu gunakan `IF NOT EXISTS` / `IF EXISTS` agar idempotent
- Setiap tabel WAJIB punya RLS enabled + minimal satu policy
- Setiap foreign key WAJIB punya index
- Gunakan `gen_random_uuid()` untuk primary key UUID
- Timestamps: `TIMESTAMPTZ DEFAULT now() NOT NULL`

### 3. Jalankan migrasi di local
```bash
# Reset dan jalankan ulang semua migrasi (development)
supabase db reset

# Atau push hanya migrasi baru
supabase db push
```

### 4. Verifikasi di Supabase Studio
```bash
# Buka Supabase Studio local
supabase studio
# Cek di: Table Editor → pastikan tabel/kolom ada
# Cek di: Authentication → Policies → pastikan RLS aktif
```

### 5. Generate TypeScript types
```bash
# Setelah migrasi berhasil, selalu generate ulang types
supabase gen types typescript --local > packages/types/src/database.types.ts
```

### 6. Push ke production (jika siap)
```bash
# Hanya setelah di-test di local dan staging
supabase db push --linked
```

## Checklist Sebelum Commit
- [ ] Migrasi bisa dijalankan ulang (idempotent)
- [ ] Semua tabel baru punya RLS enabled
- [ ] Semua foreign key punya index
- [ ] TypeScript types sudah di-generate ulang
- [ ] `supabase db reset` berjalan tanpa error
