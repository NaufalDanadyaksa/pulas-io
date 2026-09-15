# Product Requirements Document (PRD)
## pulas.io — Collaborative Visual Whiteboard

**Version:** 1.0.0  
**Tanggal:** 15 September 2026  
**Status:** Draft  
**Author:** —

---

## Daftar Isi

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Tujuan & Sasaran](#3-tujuan--sasaran)
4. [Target Pengguna](#4-target-pengguna)
5. [Fitur & Persyaratan Fungsional](#5-fitur--persyaratan-fungsional)
6. [Persyaratan Non-Fungsional](#6-persyaratan-non-fungsional)
7. [Tech Stack & Arsitektur](#7-tech-stack--arsitektur)
8. [Desain Database](#8-desain-database)
9. [Arsitektur Sistem](#9-arsitektur-sistem)
10. [User Flow](#10-user-flow)
11. [Milestone & Roadmap](#11-milestone--roadmap)
12. [Risiko & Mitigasi](#12-risiko--mitigasi)
13. [Kriteria Sukses](#13-kriteria-sukses)
14. [Out of Scope](#14-out-of-scope)

---

## 1. Executive Summary

**pulas.io** adalah aplikasi virtual whiteboard kolaboratif berbasis web yang memungkinkan pengguna untuk membuat diagram, wireframe, sketsa, dan ilustrasi dengan estetika *hand-drawn*. Aplikasi ini mendukung manajemen multi-project dan multi-canvas, sehingga pengguna dapat mengorganisir pekerjaan visual mereka secara terstruktur tanpa kehilangan data sebelumnya.

Aplikasi ini terinspirasi dari Excalidraw, namun hadir dengan fitur manajemen project, kolaborasi real-time yang lebih terstruktur, dan pengalaman pengguna yang lebih lengkap.

---

## 2. Problem Statement

### Masalah yang Dihadapi Pengguna

- **Tidak ada struktur organisasi** — Tool whiteboard gratis seperti Excalidraw versi open-source tidak memiliki manajemen project/canvas yang terstruktur.
- **Risiko kehilangan data** — Tanpa sistem penyimpanan yang andal, gambar mudah hilang saat berpindah tab atau browser crash.
- **Kolaborasi terbatas** — Sulit mengajak tim bekerja bersama secara real-time dengan kontrol akses yang jelas.
- **Tidak ada multi-canvas** — Pengguna terpaksa menumpuk semua gambar dalam satu canvas atau membuat file baru dan kehilangan organisasi.

### Solusi

pulas.io menyediakan whiteboard kolaboratif dengan sistem **Project → Canvas** yang hierarkis, auto-save, real-time collaboration, dan manajemen akses berbasis peran.

---

## 3. Tujuan & Sasaran

### Tujuan Produk

- Menyediakan pengalaman menggambar digital yang intuitif dengan estetika hand-drawn.
- Memungkinkan pengguna mengorganisir pekerjaan dalam project dan canvas yang terpisah.
- Mendukung kolaborasi real-time antar pengguna dalam satu canvas.
- Menjamin keamanan dan persistensi data pengguna.

### Key Results (KR) — 6 Bulan Pertama

| Metrik | Target |
|---|---|
| Monthly Active Users (MAU) | 1.000 pengguna |
| Canvas dibuat per user/bulan | ≥ 5 canvas |
| Retensi 30 hari | ≥ 40% |
| Uptime sistem | ≥ 99.5% |
| Waktu load canvas | < 1.5 detik |

---

## 4. Target Pengguna

### Persona 1 — Software Engineer / Architect
- **Kebutuhan:** Membuat diagram arsitektur sistem, ERD, flowchart, sequence diagram.
- **Pain point:** Mermaid/PlantUML butuh koding, tool berbayar terlalu mahal.
- **Ekspektasi:** Cepat, keyboard shortcut, bisa export SVG.

### Persona 2 — Product Manager / Designer
- **Kebutuhan:** Wireframing cepat, brainstorming, user flow.
- **Pain point:** Figma terlalu kompleks untuk sketsa awal, Miro terlalu mahal.
- **Ekspektasi:** Estetika hand-drawn, mudah share ke stakeholder.

### Persona 3 — Pengajar / Content Creator
- **Kebutuhan:** Membuat visual explanation, tutorial, materi pembelajaran.
- **Pain point:** PowerPoint kaku, tidak mendukung kolaborasi live.
- **Ekspektasi:** Bisa presentasi langsung dari canvas, mudah digunakan.

### Persona 4 — Tim Remote / Startup
- **Kebutuhan:** Brainstorming bersama, planning sprint, retrospective.
- **Pain point:** Whiteboard fisik tidak bisa diakses remote, tool mahal untuk tim kecil.
- **Ekspektasi:** Kolaborasi real-time, akses kontrol per anggota.

---

## 5. Fitur & Persyaratan Fungsional

### 5.1 Autentikasi & Manajemen Akun

#### F-AUTH-01: Registrasi & Login
- Login dengan Email + Password
- Login dengan OAuth (Google, GitHub)
- Verifikasi email saat registrasi
- Reset password via email
- Sesi persisten dengan JWT + Refresh Token

#### F-AUTH-02: Profil Pengguna
- Edit nama, foto profil, dan username
- Ganti password
- Hapus akun (dengan konfirmasi)

---

### 5.2 Manajemen Project

#### F-PROJ-01: Membuat Project
- User dapat membuat project baru dengan nama dan deskripsi opsional
- Setiap project memiliki warna/ikon identifikasi
- Project memiliki timestamp `created_at` dan `updated_at`

#### F-PROJ-02: Daftar Project
- Tampilkan semua project milik user di dashboard
- Urutkan berdasarkan: terbaru diubah, terbaru dibuat, nama (A-Z)
- Search project berdasarkan nama
- Tampilkan jumlah canvas per project
- Tampilkan thumbnail canvas terbaru sebagai cover project

#### F-PROJ-03: Edit & Hapus Project
- Rename project
- Ubah warna/ikon
- Hapus project (cascade hapus semua canvas di dalamnya, dengan konfirmasi)
- Duplicate project beserta semua canvas-nya

#### F-PROJ-04: Berbagi Project
- Undang anggota via email dengan peran:
  - **Viewer** — hanya bisa melihat canvas
  - **Editor** — bisa melihat dan mengedit canvas
  - **Admin** — bisa kelola anggota dan canvas
- Kelola anggota: ubah peran, hapus anggota
- Transfer ownership project ke anggota lain

---

### 5.3 Manajemen Canvas

#### F-CANVAS-01: Membuat Canvas
- Buat canvas baru di dalam sebuah project
- Nama canvas default: "Untitled Canvas" (bisa diubah)
- Canvas baru dimulai dengan kanvas kosong

#### F-CANVAS-02: Daftar Canvas dalam Project
- Grid atau list view daftar canvas
- Thumbnail preview setiap canvas (auto-generated)
- Tampilkan waktu terakhir diedit dan siapa yang mengedit
- Urutkan dan search canvas
- Drag-and-drop reorder canvas

#### F-CANVAS-03: Edit & Hapus Canvas
- Rename canvas langsung dari daftar
- Duplicate canvas dalam project yang sama atau pindah ke project lain
- Hapus canvas dengan konfirmasi
- Restore canvas yang dihapus (soft delete, 30 hari)

#### F-CANVAS-04: Auto-save
- Perubahan canvas disimpan otomatis setiap **1 detik** setelah pengguna berhenti menggambar (debounce)
- Indikator status simpan di UI: "Saving…", "Saved", "Unsaved changes"
- Fallback: simpan ke `localStorage` jika koneksi terputus, sinkronisasi saat online kembali

---

### 5.4 Canvas Editor

#### F-EDITOR-01: Toolbar & Tools

| Tool | Shortcut | Deskripsi |
|---|---|---|
| Select/Move | `V` atau `1` | Pilih dan pindahkan elemen |
| Rectangle | `R` atau `2` | Gambar kotak |
| Diamond | `D` atau `3` | Gambar diamond/rhombus |
| Ellipse/Circle | `O` atau `4` | Gambar lingkaran/elips |
| Arrow | `A` atau `5` | Gambar panah |
| Line | `L` atau `6` | Gambar garis lurus |
| Freedraw | `P` atau `7` | Gambar bebas (freehand) |
| Text | `T` atau `8` | Tambah teks |
| Image | `I` atau `9` | Upload/embed gambar |
| Eraser | `E` atau `0` | Hapus elemen |
| Hand/Pan | `H` atau `Space` | Geser kanvas |

#### F-EDITOR-02: Properti Elemen

- **Stroke color** — warna garis (color picker + preset warna)
- **Background/Fill color** — warna isian
- **Stroke width** — tipis, sedang, tebal
- **Stroke style** — solid, dashed, dotted
- **Fill style** — none, hatch, cross-hatch, solid
- **Opacity** — 0–100%
- **Roughness** — architect, artist, cartoonist (intensitas efek hand-drawn)
- **Font** — untuk elemen teks (Virgil, Helvetica, Cascadia)
- **Font size** — kecil, sedang, besar, extra large
- **Text alignment** — kiri, tengah, kanan
- **Edge style (arrow)** — sharp, round, elbow

#### F-EDITOR-03: Manipulasi Elemen

- Resize dengan drag handle
- Rotate dengan drag handle rotasi
- Group / Ungroup elemen (`Ctrl+G`)
- Lock elemen agar tidak bergerak
- Ubah z-index: bring to front, send to back, bring forward, send backward
- Align elemen: left, center, right, top, middle, bottom
- Distribute elemen secara horizontal atau vertikal

#### F-EDITOR-04: Navigasi Canvas

- Infinite canvas (tidak terbatas)
- Zoom in/out (scroll atau pinch gesture)
- Fit to screen (`Ctrl+Shift+H`)
- Zoom ke seleksi (`Ctrl+Shift+F`)
- Mini-map di pojok untuk navigasi cepat (opsional MVP+)
- Grid dan snap-to-grid (toggle)

#### F-EDITOR-05: History (Undo/Redo)

- Undo: `Ctrl+Z`
- Redo: `Ctrl+Y` atau `Ctrl+Shift+Z`
- History stack minimum 100 langkah
- Collaborative undo: setiap user memiliki history independen

#### F-EDITOR-06: Clipboard & Selection

- Copy/Paste elemen (`Ctrl+C` / `Ctrl+V`)
- Cut elemen (`Ctrl+X`)
- Duplicate in-place (`Ctrl+D`)
- Select All (`Ctrl+A`)
- Select dengan drag (rubber band selection)
- Copy style dari satu elemen ke elemen lain

#### F-EDITOR-07: Library Elemen

- Library bawaan: flowchart shapes, arrows, basic shapes
- User dapat menyimpan elemen ke library pribadi
- Import library dari file JSON
- Drag-and-drop dari library panel ke canvas

#### F-EDITOR-08: Export Canvas

| Format | Keterangan |
|---|---|
| PNG | Rasterized, resolusi tinggi |
| SVG | Vector, scalable |
| JSON | Format native untuk backup/restore |
| Clipboard | Copy langsung ke clipboard sebagai gambar |

- Opsi export: background transparan, include/exclude padding, scale factor

---

### 5.5 Kolaborasi Real-time

#### F-COLLAB-01: Multi-user Editing

- Beberapa user dapat mengedit canvas bersamaan
- Cursor masing-masing user terlihat dengan nama dan warna unik
- Perubahan satu user langsung terlihat di layar user lain (< 100ms latency)

#### F-COLLAB-02: Presence

- Tampilkan avatar/inisial user yang sedang membuka canvas di toolbar
- Indikator "X orang sedang mengedit"
- Klik avatar untuk follow/viewport sync ke posisi user tersebut

#### F-COLLAB-03: Conflict Resolution

- Menggunakan CRDT (via Yjs) untuk resolusi konflik otomatis tanpa data loss
- Tidak ada "last write wins" yang merusak data

---

### 5.6 Sharing & Export

#### F-SHARE-01: Share Link

- Generate shareable link per canvas
- Opsi akses link:
  - **Private** — hanya anggota project
  - **View only** — siapapun dengan link bisa melihat
  - **Edit** — siapapun dengan link bisa mengedit (dengan opsi pasword)
- Revoke link kapan saja

#### F-SHARE-02: Embed

- Generate embed code (iframe) untuk dipasang di website/Notion

---

## 6. Persyaratan Non-Fungsional

### 6.1 Performa

| Metrik | Target |
|---|---|
| Time to Interactive (canvas) | < 1.5 detik |
| Latency update kolaborasi | < 100ms |
| Auto-save response time | < 500ms |
| Canvas render frame rate | ≥ 60 FPS |
| Bundle size awal (gzipped) | < 300KB |

### 6.2 Keamanan

- Semua komunikasi menggunakan HTTPS/WSS (TLS 1.3)
- Row Level Security (RLS) di semua tabel Supabase
- Data kolaborasi end-to-end dienkripsi di room publik
- Rate limiting pada API endpoint
- Input sanitization untuk mencegah XSS
- CSRF protection
- Audit log untuk aksi sensitif (hapus project, ubah peran anggota)

### 6.3 Reliabilitas

- Uptime target: **99.5%** per bulan
- Auto-save ke `localStorage` sebagai fallback offline
- Graceful degradation: jika WebSocket putus, mode offline aktif otomatis
- Data tidak boleh hilang meski koneksi terputus tiba-tiba

### 6.4 Skalabilitas

- Arsitektur stateless di sisi backend untuk horizontal scaling
- WebSocket server dapat di-scale secara independen
- Database connection pooling via Supabase

### 6.5 Aksesibilitas

- WCAG 2.1 Level AA
- Keyboard navigable penuh
- Screen reader support untuk UI non-canvas
- Contrast ratio minimum 4.5:1

### 6.6 Browser Support

| Browser | Versi Minimum |
|---|---|
| Chrome / Edge | ≥ 100 |
| Firefox | ≥ 100 |
| Safari | ≥ 15.4 |
| Mobile Chrome | ≥ 100 |
| Mobile Safari | ≥ 15.4 |

---

## 7. Tech Stack & Arsitektur

### 7.1 Frontend

| Kebutuhan | Teknologi | Alasan |
|---|---|---|
| Framework | **React 19 + TypeScript** | Type safety, ekosistem terbesar, concurrent features |
| Build Tool | **Vite** | HMR cepat, ESM native, bundle optimal |
| Canvas Rendering | **Rough.js + HTML5 Canvas API** | Efek hand-drawn yang autentik (sama dengan Excalidraw) |
| State Management | **Zustand** | Ringan, tidak boilerplate, cocok untuk canvas state |
| Real-time Sync (CRDT) | **Yjs** | Standar industri collaborative editing, conflict-free |
| Yjs Transport | **Supabase Realtime (Broadcast)** | Integrasi langsung dengan Supabase |
| Routing | **TanStack Router** | Type-safe routing, file-based, modern |
| Data Fetching | **TanStack Query v5** | Caching, optimistic updates, background sync |
| Supabase Client | **@supabase/supabase-js** | Official SDK |
| Styling | **Tailwind CSS v4** | Utility-first, performa tinggi, design system konsisten |
| UI Components | **Radix UI** | Accessible, unstyled, composable primitives |
| Icons | **Lucide React** | Konsisten, tree-shakeable |
| Form Handling | **React Hook Form + Zod** | Performa form terbaik + type-safe validation |
| Package Manager | **pnpm** | Efisien disk space, cepat |

### 7.2 Backend — Supabase (BaaS)

| Kebutuhan | Teknologi | Alasan |
|---|---|---|
| Database | **Supabase PostgreSQL** | Managed, RLS built-in, ekstensi lengkap |
| Autentikasi | **Supabase Auth** | OAuth, JWT, session management out-of-the-box |
| Real-time | **Supabase Realtime** | Broadcast & Presence untuk kolaborasi |
| File Storage | **Supabase Storage** | Simpan thumbnail, gambar yang diupload ke canvas |
| Business Logic | **Supabase Edge Functions (Deno)** | Webhook handler, scheduled jobs, API tambahan |
| DB Migrations | **Supabase CLI** | Version control schema database |

### 7.3 Infrastruktur & DevOps

| Kebutuhan | Teknologi | Alasan |
|---|---|---|
| Frontend Hosting | **Vercel** | Zero-config deploy, edge network, preview deploys |
| Monorepo | **Turborepo + pnpm workspaces** | Build cache, parallelisasi, shared packages |
| CI/CD | **GitHub Actions** | Otomasi test, lint, deploy |
| Error Tracking | **Sentry** | Real-time error monitoring |
| Analytics | **Posthog** | Open-source, privacy-friendly, feature flags |
| Logging | **Supabase Logs + Axiom** | Centralized logging |

### 7.4 Testing

| Layer | Teknologi |
|---|---|
| Unit & Integration | **Vitest** |
| Component | **Testing Library React** |
| E2E | **Playwright** |
| Visual Regression | **Playwright Screenshots** |

### 7.5 Struktur Monorepo

```
pulas-io/
├── apps/
│   └── web/                    # React app (Vite)
│       ├── src/
│       │   ├── components/     # UI components
│       │   ├── features/       # Feature modules
│       │   │   ├── auth/
│       │   │   ├── dashboard/
│       │   │   ├── project/
│       │   │   └── canvas/
│       │   ├── hooks/          # Custom React hooks
│       │   ├── stores/         # Zustand stores
│       │   ├── lib/            # Utilities & helpers
│       │   │   ├── supabase.ts
│       │   │   ├── yjs.ts
│       │   │   └── canvas.ts
│       │   ├── routes/         # TanStack Router
│       │   └── types/          # Global TypeScript types
│       └── ...
├── packages/
│   ├── ui/                     # Shared UI components (Radix + Tailwind)
│   ├── types/                  # Shared TypeScript types
│   ├── utils/                  # Shared utilities
│   └── canvas-core/            # Rough.js + Canvas logic (framework-agnostic)
├── supabase/
│   ├── migrations/             # SQL migration files
│   ├── functions/              # Edge Functions
│   └── seed.sql
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## 8. Desain Database

### 8.1 Schema Lengkap

```sql
-- ============================================================
-- EXTENSION
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extend Supabase auth.users)
-- ============================================================
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     TEXT UNIQUE,
  display_name TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  color       TEXT DEFAULT '#6366f1',   -- warna identifikasi project
  icon        TEXT DEFAULT 'folder',    -- ikon identifikasi
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- PROJECT MEMBERS (kolaborator)
-- ============================================================
CREATE TYPE project_role AS ENUM ('viewer', 'editor', 'admin');

CREATE TABLE project_members (
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        project_role NOT NULL DEFAULT 'viewer',
  invited_by  UUID REFERENCES auth.users(id),
  joined_at   TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (project_id, user_id)
);

-- ============================================================
-- CANVASES
-- ============================================================
CREATE TABLE canvases (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name         TEXT NOT NULL DEFAULT 'Untitled Canvas',
  data         JSONB NOT NULL DEFAULT '{"elements":[],"appState":{}}'::jsonb,
  thumbnail_url TEXT,              -- URL ke Supabase Storage
  order_index  INTEGER DEFAULT 0,  -- untuk drag-and-drop ordering
  deleted_at   TIMESTAMPTZ,        -- soft delete (null = aktif)
  created_by   UUID REFERENCES auth.users(id),
  last_edited_by UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- CANVAS SHARE LINKS
-- ============================================================
CREATE TYPE share_access AS ENUM ('view', 'edit');

CREATE TABLE canvas_shares (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id   UUID NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
  created_by  UUID REFERENCES auth.users(id),
  access      share_access NOT NULL DEFAULT 'view',
  password    TEXT,                   -- bcrypt hash, null = tidak ada password
  is_active   BOOLEAN DEFAULT true,
  expires_at  TIMESTAMPTZ,            -- null = tidak expire
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- INDEXES untuk performa query
-- ============================================================
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
CREATE INDEX idx_canvases_project ON canvases(project_id);
CREATE INDEX idx_canvases_deleted ON canvases(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_canvases_order ON canvases(project_id, order_index);
CREATE INDEX idx_canvas_shares_canvas ON canvas_shares(canvas_id);

-- ============================================================
-- FUNGSI: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_canvases_updated_at
  BEFORE UPDATE ON canvases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User dapat melihat semua profil" ON profiles FOR SELECT USING (true);
CREATE POLICY "User hanya bisa update profil sendiri" ON profiles FOR UPDATE USING (auth.uid() = id);

-- PROJECTS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner bisa akses project sendiri" ON projects FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Member bisa melihat project" ON projects FOR SELECT USING (
  EXISTS (SELECT 1 FROM project_members WHERE project_id = id AND user_id = auth.uid())
);

-- PROJECT MEMBERS
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Member bisa melihat anggota project yang sama" ON project_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = project_id AND pm.user_id = auth.uid())
);
CREATE POLICY "Admin/Owner bisa kelola member" ON project_members FOR ALL USING (
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_id
    AND pm.user_id = auth.uid()
    AND pm.role IN ('admin')
  ) OR EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
);

-- CANVASES
ALTER TABLE canvases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Member project bisa melihat canvas" ON canvases FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects p
    LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = auth.uid()
    WHERE p.id = project_id AND (p.owner_id = auth.uid() OR pm.user_id IS NOT NULL)
  )
);
CREATE POLICY "Editor/Admin bisa edit canvas" ON canvases FOR INSERT, UPDATE, DELETE USING (
  EXISTS (
    SELECT 1 FROM projects p
    LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = auth.uid()
    WHERE p.id = project_id AND (
      p.owner_id = auth.uid() OR pm.role IN ('editor', 'admin')
    )
  )
);
```

### 8.2 Struktur Data Canvas (JSONB)

```json
{
  "elements": [
    {
      "id": "abc123",
      "type": "rectangle",
      "x": 100,
      "y": 150,
      "width": 200,
      "height": 120,
      "strokeColor": "#1e1e2e",
      "backgroundColor": "#cba6f7",
      "fillStyle": "hachure",
      "strokeWidth": 2,
      "roughness": 1,
      "opacity": 100,
      "angle": 0,
      "seed": 12345,
      "version": 1,
      "groupIds": []
    }
  ],
  "appState": {
    "viewBackgroundColor": "#ffffff",
    "gridSize": null,
    "zoom": { "value": 1 }
  }
}
```

---

## 9. Arsitektur Sistem

### 9.1 Overview Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                   │
│                                                         │
│   React App (Vite)                                      │
│   ┌──────────────┐  ┌────────────┐  ┌───────────────┐  │
│   │ Canvas Editor │  │  Dashboard │  │  Project View │  │
│   │  Rough.js     │  │  TanStack  │  │  TanStack     │  │
│   │  Canvas API   │  │  Query     │  │  Router       │  │
│   └──────┬───────┘  └─────┬──────┘  └───────────────┘  │
│          │                │                             │
│   ┌──────▼───────────────▼──────────────────────────┐  │
│   │              Zustand Store                       │  │
│   │  (canvas state, user, project, ui state)         │  │
│   └──────┬───────────────┬──────────────────────────┘  │
│          │               │                              │
│   ┌──────▼──────┐ ┌──────▼───────┐                     │
│   │     Yjs     │ │ Supabase JS  │                     │
│   │   (CRDT)    │ │   Client     │                     │
│   └──────┬──────┘ └──────┬───────┘                     │
└──────────┼───────────────┼─────────────────────────────┘
           │               │
           │ WebSocket     │ HTTPS (REST/GraphQL)
           │               │
┌──────────▼───────────────▼─────────────────────────────┐
│                    SUPABASE                             │
│                                                         │
│  ┌─────────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │  Realtime   │  │   Auth   │  │  Edge Functions   │  │
│  │  Broadcast  │  │  (JWT)   │  │  (Deno)           │  │
│  │  Presence   │  └──────────┘  └───────────────────┘  │
│  └──────┬──────┘                                       │
│         │                                               │
│  ┌──────▼──────────────────┐  ┌──────────────────────┐ │
│  │   PostgreSQL + RLS      │  │       Storage        │ │
│  │  projects, canvases,    │  │  thumbnails, images  │ │
│  │  profiles, members      │  │                      │ │
│  └─────────────────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────┘
           │
           │ Deploy
┌──────────▼──────────────────────────────────────────────┐
│                      VERCEL                             │
│            (Frontend Hosting + Edge Network)            │
└─────────────────────────────────────────────────────────┘
```

### 9.2 Alur Kolaborasi Real-time (Yjs + Supabase Realtime)

```
User A (Editor)           Supabase Realtime           User B (Editor)
    │                           │                           │
    │  menggambar shape         │                           │
    │──────────────────────────►│                           │
    │  Yjs encodes update       │                           │
    │  (binary CRDT update)     │  broadcast ke channel     │
    │                           │──────────────────────────►│
    │                           │  canvas:{canvasId}        │
    │                           │                           │ Yjs decode update
    │                           │                           │ apply ke local doc
    │                           │                           │ re-render canvas
    │◄──────────────────────────│                           │
    │  Presence update          │◄──────────────────────────│
    │  (cursor position B)      │  cursor move B            │
```

### 9.3 Auto-save Flow

```
User menggambar
      │
      ▼
Zustand canvas state update
      │
      ▼
Yjs Document update (broadcast ke collaborators)
      │
      ▼
Debounce 1000ms (reset setiap ada perubahan baru)
      │
      ▼ (setelah 1 detik idle)
supabase.from('canvases').update({ data: elements })
      │
      ├──► Sukses → update indicator "Saved ✓"
      │
      └──► Gagal → simpan ke localStorage, retry saat online
```

---

## 10. User Flow

### 10.1 Onboarding Pengguna Baru

```
Landing Page
    │
    ▼
Klik "Get Started Free"
    │
    ▼
Pilih metode registrasi (Email / Google / GitHub)
    │
    ▼
Verifikasi email (jika Email)
    │
    ▼
Setup profil (nama, username)
    │
    ▼
Dashboard kosong
    │
    ▼
Prompt: "Buat project pertama Anda"
    │
    ▼
Modal: isi nama project → Buat
    │
    ▼
Masuk ke Project View (canvas kosong)
    │
    ▼
Tooltip onboarding (3 langkah)
    │
    ▼
Canvas Editor siap digunakan
```

### 10.2 Alur Multi-Canvas

```
Dashboard
    │
    ▼
Pilih Project "Website Redesign"
    │
    ▼
Project View (list canvas)
    ├── [Canvas] Homepage Wireframe     (terakhir diedit 2j lalu)
    ├── [Canvas] Mobile View            (terakhir diedit kemarin)
    └── [+] Buat Canvas Baru
    │
    ▼
Klik "+ Buat Canvas Baru"
    │
    ▼
Canvas baru terbuka: "Untitled Canvas"
    │
    ▼
User menggambar ... auto-save berjalan
    │
    ▼
Klik back → kembali ke Project View
    │
    ▼
Semua canvas sebelumnya tetap ada dan aman
```

### 10.3 Alur Kolaborasi

```
User A (Owner)                           User B (Diundang)
    │                                         │
    │ Buka Project Settings                   │
    │ → Undang via email User B               │
    │ → Assign role: Editor                   │
    │                                         │
    │                              Terima email undangan
    │                                         │
    │                              Klik link → Login/Register
    │                                         │
    │                              Project muncul di Dashboard
    │                                         │
    │ Buka Canvas "Homepage"        Buka Canvas "Homepage"
    │                                         │
    │◄────── Lihat cursor User B ─────────────│
    │─────── Update shape ──────────────────►│
    │        (realtime sync)                  │
```

---

## 11. Milestone & Roadmap

### Phase 1 — MVP (Bulan 1–2)

**Tujuan:** Aplikasi bisa digunakan end-to-end untuk satu user.

- [ ] Setup monorepo (Turborepo + pnpm)
- [ ] Setup Supabase project (Auth, DB, Storage)
- [ ] Implementasi autentikasi (Email + Google OAuth)
- [ ] Dashboard: CRUD Project
- [ ] Project View: CRUD Canvas
- [ ] Canvas Editor: tools dasar (select, rectangle, ellipse, arrow, text, freedraw)
- [ ] Canvas Editor: properti elemen (color, stroke, fill)
- [ ] Canvas Editor: undo/redo
- [ ] Canvas Editor: export PNG & SVG
- [ ] Auto-save ke Supabase
- [ ] Deploy ke Vercel

**Deliverable:** User bisa login, buat project, buat canvas, gambar, dan data tersimpan.

---

### Phase 2 — Collaboration (Bulan 3)

**Tujuan:** Multi-user dapat bekerja bersamaan di satu canvas.

- [ ] Integrasi Yjs dengan Supabase Realtime (Broadcast)
- [ ] Cursor presence (live cursor tracking)
- [ ] Undang anggota ke project (dengan peran)
- [ ] Collaborative undo/redo (per-user history)
- [ ] Indikator "siapa yang sedang online"
- [ ] Share link (view-only & editable)

**Deliverable:** Tim dapat berkolaborasi secara real-time.

---

### Phase 3 — Polish & Library (Bulan 4)

**Tujuan:** Pengalaman pengguna yang lebih kaya dan produktif.

- [ ] Library elemen (flowchart, UML, icons)
- [ ] Thumbnail auto-generate & upload ke Storage
- [ ] Canvas: duplicate, move antar project, reorder
- [ ] Soft delete canvas dengan restore
- [ ] Keyboard shortcuts lengkap
- [ ] Offline mode (localStorage fallback)
- [ ] Snap to grid
- [ ] Align & distribute tools

**Deliverable:** Aplikasi terasa polished dan siap untuk pengguna umum.

---

### Phase 4 — Growth Features (Bulan 5–6)

**Tujuan:** Fitur yang mendorong retensi dan pertumbuhan.

- [ ] Mermaid diagram import (text-to-diagram)
- [ ] Embed canvas (iframe)
- [ ] Presentation mode (slide per frame)
- [ ] Version history (snapshot per save)
- [ ] Template gallery
- [ ] Public profile & published canvases
- [ ] Analytics dashboard (Posthog)

---

## 12. Risiko & Mitigasi

| Risiko | Dampak | Probabilitas | Mitigasi |
|---|---|---|---|
| Latency kolaborasi tinggi | Tinggi | Sedang | Optimasi Yjs update size; pertimbangkan dedicated WS server jika > 500 concurrent users |
| Data canvas hilang saat crash | Tinggi | Rendah | Auto-save debounce + localStorage fallback + Supabase point-in-time recovery |
| Supabase Realtime tidak scalable | Sedang | Sedang | Monitor concurrent connections; migrate ke dedicated y-websocket server jika perlu |
| Performa Canvas lambat (banyak elemen) | Tinggi | Sedang | Virtualisasi render (hanya render elemen dalam viewport); Canvas layer optimization |
| JSONB data canvas corrupt | Tinggi | Rendah | Validasi schema Zod sebelum simpan; backup periodic |
| Vendor lock-in Supabase | Sedang | Rendah | Abstraksi repository layer; PostgreSQL standard SQL |

---

## 13. Kriteria Sukses

### Teknis

- [ ] Semua fitur Phase 1–2 berjalan tanpa bug kritis
- [ ] Lighthouse score ≥ 90 (Performance, Accessibility)
- [ ] Test coverage ≥ 70% (unit + integration)
- [ ] Zero RLS bypass vulnerability
- [ ] Performa canvas ≥ 60 FPS dengan 500+ elemen

### Produk

- [ ] Pengguna dapat menyelesaikan flow "buat project → buat canvas → gambar → share" dalam < 3 menit tanpa bantuan
- [ ] NPS (Net Promoter Score) ≥ 30 di bulan ke-3
- [ ] Retention D7 ≥ 30%

---

## 14. Out of Scope (v1.0)

Fitur berikut **tidak** termasuk dalam scope v1.0 dan akan dipertimbangkan di versi selanjutnya:

- Aplikasi mobile native (iOS/Android)
- Fitur AI (text-to-diagram, auto-layout)
- Video/Voice call terintegrasi
- Plugin/extension marketplace
- White-label / self-hosted untuk enterprise
- Integrasi pihak ketiga (Jira, Notion, Slack)
- Tier berbayar / monetisasi (akan didesain terpisah)

---

*Dokumen ini adalah living document. Perubahan requirement harus melalui review dan approval dari product owner.*

---

**Versi History:**

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0.0 | 15 September 2026 | Dokumen awal |