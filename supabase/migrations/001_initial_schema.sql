-- ============================================================
-- Migration: 001_initial_schema
-- Tanggal: 2026-09-16
-- Deskripsi: Inisialisasi skema database pulas.io (PRD §8.1)
-- ============================================================

-- ============================================================
-- EXTENSION
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE project_role AS ENUM ('viewer', 'editor', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE share_access AS ENUM ('view', 'edit');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- 1. PROFILES (extend Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     TEXT UNIQUE,
  display_name TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- 2. PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
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
-- 3. PROJECT MEMBERS (kolaborator)
-- ============================================================
CREATE TABLE IF NOT EXISTS project_members (
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        project_role NOT NULL DEFAULT 'viewer',
  invited_by  UUID REFERENCES auth.users(id),
  joined_at   TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (project_id, user_id)
);

-- ============================================================
-- 4. CANVASES
-- ============================================================
CREATE TABLE IF NOT EXISTS canvases (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name           TEXT NOT NULL DEFAULT 'Untitled Canvas',
  data           JSONB NOT NULL DEFAULT '{"elements":[],"appState":{}}'::jsonb,
  thumbnail_url  TEXT,              -- URL ke Supabase Storage
  order_index    INTEGER DEFAULT 0,  -- untuk drag-and-drop ordering
  deleted_at     TIMESTAMPTZ,        -- soft delete (null = aktif)
  created_by     UUID REFERENCES auth.users(id),
  last_edited_by UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at     TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- 5. CANVAS SHARE LINKS
-- ============================================================
CREATE TABLE IF NOT EXISTS canvas_shares (
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
-- INDEXES untuk performa query (PRD §8.1)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_canvases_project ON canvases(project_id);
CREATE INDEX IF NOT EXISTS idx_canvases_deleted ON canvases(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_canvases_order ON canvases(project_id, order_index);
CREATE INDEX IF NOT EXISTS idx_canvas_shares_canvas ON canvas_shares(canvas_id);

-- ============================================================
-- FUNGSI & TRIGGERS: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_canvases_updated_at ON canvases;
CREATE TRIGGER trg_canvases_updated_at
  BEFORE UPDATE ON canvases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- 1. PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User dapat melihat semua profil" ON profiles;
CREATE POLICY "User dapat melihat semua profil"
  ON profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "User hanya bisa update profil sendiri" ON profiles;
CREATE POLICY "User hanya bisa update profil sendiri"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "User bisa insert profil sendiri" ON profiles;
CREATE POLICY "User bisa insert profil sendiri"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. PROJECTS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner bisa akses project sendiri" ON projects;
CREATE POLICY "Owner bisa akses project sendiri"
  ON projects FOR ALL
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Member bisa melihat project" ON projects;
CREATE POLICY "Member bisa melihat project"
  ON projects FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM project_members WHERE project_id = id AND user_id = auth.uid())
  );

-- 3. PROJECT MEMBERS
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Member bisa melihat anggota project yang sama" ON project_members;
CREATE POLICY "Member bisa melihat anggota project yang sama"
  ON project_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_members.project_id
      AND p.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admin/Owner bisa kelola member" ON project_members;
CREATE POLICY "Admin/Owner bisa kelola member"
  ON project_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('admin')
    ) OR EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_members.project_id
      AND p.owner_id = auth.uid()
    )
  );

-- 4. CANVASES
ALTER TABLE canvases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Member project bisa melihat canvas" ON canvases;
CREATE POLICY "Member project bisa melihat canvas"
  ON canvases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = auth.uid()
      WHERE p.id = canvases.project_id
      AND (p.owner_id = auth.uid() OR pm.user_id IS NOT NULL)
    )
  );

DROP POLICY IF EXISTS "Editor/Admin bisa insert canvas" ON canvases;
CREATE POLICY "Editor/Admin bisa insert canvas"
  ON canvases FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = auth.uid()
      WHERE p.id = canvases.project_id
      AND (p.owner_id = auth.uid() OR pm.role IN ('editor', 'admin'))
    )
  );

DROP POLICY IF EXISTS "Editor/Admin bisa update canvas" ON canvases;
CREATE POLICY "Editor/Admin bisa update canvas"
  ON canvases FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = auth.uid()
      WHERE p.id = canvases.project_id
      AND (p.owner_id = auth.uid() OR pm.role IN ('editor', 'admin'))
    )
  );

DROP POLICY IF EXISTS "Editor/Admin bisa delete canvas" ON canvases;
CREATE POLICY "Editor/Admin bisa delete canvas"
  ON canvases FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = auth.uid()
      WHERE p.id = canvases.project_id
      AND (p.owner_id = auth.uid() OR pm.role IN ('editor', 'admin'))
    )
  );

-- 5. CANVAS SHARES
ALTER TABLE canvas_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public bisa melihat active share link" ON canvas_shares;
CREATE POLICY "Public bisa melihat active share link"
  ON canvas_shares FOR SELECT
  USING (
    is_active = true AND (expires_at IS NULL OR expires_at > now())
  );

DROP POLICY IF EXISTS "Admin/Owner bisa kelola share link" ON canvas_shares;
CREATE POLICY "Admin/Owner bisa kelola share link"
  ON canvas_shares FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM canvases c
      JOIN projects p ON p.id = c.project_id
      LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = auth.uid()
      WHERE c.id = canvas_shares.canvas_id
      AND (p.owner_id = auth.uid() OR pm.role IN ('editor', 'admin'))
    )
  );
