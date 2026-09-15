---
trigger: always_on
glob:
description: Rules utama proyek pulas.io — wajib diikuti di setiap sesi tanpa pengecualian.
---

# pulas.io — Agent Rules

## 0. Referensi Utama

Sebelum memulai **task apapun**, baca dokumen-dokumen ini terlebih dahulu:

- **PRD**: `.agents/PRD.md` — sumber kebenaran tunggal untuk semua fitur, schema database, dan arsitektur.
- **Workflows**: `.agents/workflows/` — semua file di direktori ini wajib dibaca dan diikuti sesuai konteks task.
- **Task tracker**: `.agents/task.md` — daftar tugas aktif saat ini.
- **Implementation plan**: `.agents/implementation_plan.md` — rencana implementasi yang sedang berjalan.
- **Walkthrough**: `.agents/walkthrough.md` — dokumen pengujian dan ringkasan perubahan.

---

## 1. WAJIB: Plan Sebelum Eksekusi

> **Jangan eksekusi kode apapun sebelum mendapat persetujuan eksplisit dari user.**

### 1.1 Tulis Implementation Plan Terlebih Dahulu

Setiap kali menerima task baru, **langkah pertama** adalah menulis atau memperbarui `.agents/implementation_plan.md` dengan format berikut:

```markdown
# [Nama Task / Goal]

## Konteks
Penjelasan singkat masalah dan latar belakang.

## Open Questions
Pertanyaan yang perlu dijawab user sebelum eksekusi (jika ada).

## Proposed Changes
### Fase 1 — [Nama Fase]
#### [MODIFY/NEW/DELETE] path/to/file
- Deskripsi perubahan spesifik

### Fase 2 — [Nama Fase]
...

## Verification Plan
Langkah pengujian setelah implementasi selesai.
```

**Aturan penting:**
- Pecah setiap task menjadi **minimal 2 fase kecil yang independen**.
- Setiap fase harus bisa di-review dan di-rollback secara terpisah.
- Tandai file dengan `[NEW]`, `[MODIFY]`, atau `[DELETE]`.
- Setelah menulis plan, **STOP dan tunggu approval user** sebelum melanjutkan.

### 1.2 Tulis Task Tracker

Segera setelah implementation plan disetujui, buat atau perbarui `.agents/task.md`:

```markdown
- `[ ]` Task belum dimulai
- `[/]` Task sedang berjalan
- `[x]` Task selesai
```

Update status task secara real-time selama eksekusi berlangsung.

---

## 2. Gunakan Workflows yang Tersedia

Sebelum memulai implementasi, **selalu cek** `.agents/workflows/` dan baca semua file workflow yang relevan.

- Jika ada workflow yang sesuai, **ikuti langkah-langkahnya secara eksak**.
- Jika tidak ada workflow yang sesuai, lanjutkan dengan best practice umum dan **catat** di implementation plan bahwa tidak ada workflow yang applicable.
- Jangan membuat pendekatan baru jika sudah ada workflow yang mengatur hal tersebut.

---

## 3. Code Quality & Best Practices

### 3.1 Aturan Umum

- **TypeScript strict mode** — tidak ada `any` kecuali ada alasan kuat dan didokumentasikan.
- **Immutability** — gunakan `const` by default; hindari mutasi state langsung.
- **Single Responsibility** — setiap fungsi/komponen hanya melakukan satu hal.
- **DRY** — abstrak logika yang dipakai lebih dari 2 kali menjadi fungsi atau hook tersendiri.
- **Naming** — nama variabel, fungsi, dan komponen harus deskriptif (bahasa Inggris).
- **Error Handling** — setiap operasi async wajib memiliki error handling eksplisit; jangan biarkan error tertangkap secara silent.
- **Comments** — tulis komentar hanya untuk menjelaskan *mengapa* (intent), bukan *apa* (yang sudah jelas dari kode).

### 3.2 React & Frontend (sesuai tech stack PRD)

- Gunakan **React 19** dengan functional components dan hooks.
- State management menggunakan **Zustand** — buat store yang granular, hindari satu store raksasa.
- Data fetching menggunakan **TanStack Query v5** — manfaatkan `staleTime`, `gcTime`, dan `enabled` untuk cache yang efisien.
- Routing menggunakan **TanStack Router** — manfaatkan type-safe params dan loaders.
- Styling dengan **Tailwind CSS v4** — ikuti design system yang ada; hindari inline style.
- Form handling menggunakan **React Hook Form + Zod** — validasi schema di sisi client wajib.
- Komponen UI dari **Radix UI** — selalu tambahkan atribut aksesibilitas (`aria-*`, `role`).

### 3.3 Supabase & Database

- Selalu gunakan **Row Level Security (RLS)** — jangan pernah bypass dengan `service_role` di client-side.
- Setiap mutation ke database wajib melalui **validasi Zod** sebelum dikirim.
- Gunakan **Supabase Edge Functions** untuk business logic sensitif, bukan di client.
- Migration schema selalu menggunakan **Supabase CLI** — jangan modifikasi database secara manual di production.
- Gunakan **indexes** yang sudah didefinisikan di PRD; jangan query kolom tanpa index untuk data besar.

### 3.4 Aksesibilitas & SEO

- Setiap komponen interaktif wajib memiliki `id` unik yang deskriptif.
- Contrast ratio minimum 4.5:1 (WCAG 2.1 Level AA).
- Semua elemen interaktif harus bisa diakses via keyboard.
- Gunakan semantic HTML5 dan heading hierarchy yang benar.

---

## 4. Cegah N+1 Query — Wajib Dipatuhi

N+1 query adalah **bug performa kritikal** yang harus dicegah sejak awal pengembangan.

### 4.1 Deteksi Pattern Berbahaya

**❌ DILARANG — contoh N+1:**
```typescript
// Ambil projects dulu, lalu loop untuk ambil members tiap project
const projects = await supabase.from('projects').select('*');
for (const project of projects.data) {
  const members = await supabase.from('project_members')
    .select('*').eq('project_id', project.id); // N+1!
}
```

**✅ BENAR — gunakan join atau `in` filter:**
```typescript
// Ambil semua data dalam satu query menggunakan relasi Supabase
const projects = await supabase.from('projects')
  .select('*, project_members(user_id, role, profiles(display_name, avatar_url))');

// Atau gunakan filter IN untuk bulk fetch
const projectIds = projects.data.map(p => p.id);
const members = await supabase.from('project_members')
  .select('*').in('project_id', projectIds);
```

### 4.2 Aturan Fetch Data

1. **Gunakan Supabase relational queries** (`select('*, related_table(...)')`) untuk data yang saling terkait.
2. **Hindari query di dalam loop** — jika perlu data dari beberapa entitas, gunakan `.in()` atau join.
3. **TanStack Query**: manfaatkan `useQueries` untuk parallel fetching, bukan sequential awaits.
4. **Prefetch data** yang diperlukan di loader sebelum render komponen.
5. **Pagination wajib** untuk semua list data yang bisa tumbuh (canvas list, project list, member list).

---

## 5. Setelah Eksekusi: Tulis Walkthrough

Setelah **semua fase task selesai**, wajib menulis atau memperbarui `.agents/walkthrough.md` dengan format berikut:

```markdown
# Walkthrough — [Nama Task]

**Tanggal Selesai:** YYYY-MM-DD
**Fase yang Dikerjakan:** Fase 1, Fase 2, ...

## Ringkasan Perubahan
- File dimodifikasi: ...
- File baru: ...
- File dihapus: ...

## Langkah Pengujian Manual
1. [Langkah 1] — Expected result: ...
2. [Langkah 2] — Expected result: ...

## Pengujian Otomatis
```bash
pnpm test
pnpm test:e2e
```

## Known Issues / Catatan
- ...

## Screenshot / Recording (jika ada perubahan UI)
![Caption](/path/to/screenshot)
```

**Aturan walkthrough:**
- Langkah pengujian harus cukup detail sehingga orang lain bisa mengikutinya tanpa perlu bertanya.
- Sertakan **expected result** untuk setiap langkah pengujian.
- Jika ada perubahan UI, sertakan screenshot atau video recording.
- Catat setiap **known issue** atau limitasi yang ditemukan.

---

## 6. Ringkasan Alur Kerja Wajib

```
Terima task dari user
       │
       ▼
[1] Baca PRD.md & workflows/
       │
       ▼
[2] Tulis implementation_plan.md (dengan fase-fase kecil)
       │
       ▼
[3] STOP — Tunggu approval user
       │
       ▼ (setelah approved)
[4] Buat/update task.md
       │
       ▼
[5] Eksekusi per fase, update status task.md secara real-time
    - Ikuti workflows yang tersedia
    - Terapkan best practices (strict TS, no N+1, RLS, dll.)
       │
       ▼
[6] Tulis walkthrough.md dengan langkah pengujian
       │
       ▼
[7] Laporkan ke user bahwa task selesai
```
