---
description: Index semua workflows yang tersedia di project pulas.io. Gunakan file ini sebagai referensi utama untuk memilih workflow yang tepat. Ketik /.workflows untuk memilih workflow sesuai task.
---

# pulas.io — Workflow Registry

Semua workflow tersedia di direktori `.agents/workflows/`. Pilih workflow yang sesuai dengan task yang sedang dikerjakan.

---

## Daftar Workflows

| # | File | Kapan Digunakan |
|---|------|-----------------|
| 01 | [`01-supabase-migration.md`](./01-supabase-migration.md) | Membuat/menjalankan migrasi database Supabase (tabel baru, RLS policy, index) |
| 02 | [`02-frontend-feature.md`](./02-frontend-feature.md) | Membuat halaman, feature module, atau komponen UI baru |
| 03 | [`03-canvas-editor.md`](./03-canvas-editor.md) | Menambah tools canvas, auto-save, undo/redo, performa rendering |
| 04 | [`04-realtime-collaboration.md`](./04-realtime-collaboration.md) | Multi-user editing, cursor presence, Yjs + Supabase Realtime |
| 05 | [`05-authentication.md`](./05-authentication.md) | Login/register, OAuth, proteksi route, profil pengguna |
| 06 | [`06-testing.md`](./06-testing.md) | Unit tests (Vitest), component tests (Testing Library), E2E (Playwright) |
| 07 | [`07-edge-functions.md`](./07-edge-functions.md) | Server-side logic sensitif: invite member, thumbnail generation, audit log |

---

## Cara Memilih Workflow

### Skenario → Workflow

| Skenario | Workflow yang Digunakan |
|----------|------------------------|
| Tambah tabel baru di DB | `01-supabase-migration` |
| Ubah/tambah RLS policy | `01-supabase-migration` |
| Buat halaman Dashboard | `02-frontend-feature` |
| Buat komponen UI baru | `02-frontend-feature` |
| Tambah tool baru ke canvas | `03-canvas-editor` |
| Implementasi auto-save | `03-canvas-editor` |
| Implementasi undo/redo | `03-canvas-editor` |
| Optimasi performa canvas | `03-canvas-editor` |
| Setup multi-user editing | `04-realtime-collaboration` |
| Implementasi live cursor | `04-realtime-collaboration` |
| Implementasi login/register | `05-authentication` |
| Setup OAuth (Google, GitHub) | `05-authentication` |
| Proteksi route | `05-authentication` |
| Tulis test untuk fitur baru | `06-testing` |
| Fix bug + tulis regression test | `06-testing` |
| Kirim email undangan | `07-edge-functions` |
| Generate thumbnail canvas | `07-edge-functions` |
| Buat webhook handler | `07-edge-functions` |

---

## Kombinasi Workflow Umum

Beberapa task membutuhkan lebih dari satu workflow secara berurutan:

### Implementasi Fitur Baru dari Nol
```
[1] Supabase Migration  →  [2] Frontend Feature  →  [6] Testing
```

### Fitur Kolaborasi
```
[1] Supabase Migration  →  [4] Realtime Collaboration  →  [6] Testing
```

### Fitur Auth Lengkap
```
[1] Supabase Migration (profile table)  →  [5] Authentication  →  [6] Testing
```

### Fitur yang Butuh Server Logic
```
[2] Frontend Feature  →  [7] Edge Functions  →  [6] Testing
```
