-- ============================================================
-- Seed Data: development testing
-- Tanggal: 2026-09-16
-- Deskripsi: 2 users, 2 projects, 3 canvases dengan elemen sample
-- ============================================================

-- 1. Insert Dummy Users ke auth.users (hanya jika auth.users tersedia / local)
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'alex@pulas.io',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"alexpratama","display_name":"Alex Pratama"}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'bella@pulas.io',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"bellasartika","display_name":"Bella Sartika"}',
    now(),
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- 2. Profiles (jika trigger belum berjalan untuk mock auth user)
INSERT INTO public.profiles (id, username, display_name, avatar_url, created_at, updated_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'alexpratama',
    'Alex Pratama',
    'https://api.dicebear.com/7.x/bottts/svg?seed=alex',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'bellasartika',
    'Bella Sartika',
    'https://api.dicebear.com/7.x/bottts/svg?seed=bella',
    now(),
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  avatar_url = EXCLUDED.avatar_url;

-- 3. Projects
INSERT INTO public.projects (id, owner_id, name, description, color, icon, created_at, updated_at)
VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Design System Whiteboard',
    'Arsitektur komponen dan tokens visual untuk web app',
    '#6366f1',
    'palette',
    now(),
    now()
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Sprint Planning Q4',
    'Roadmap fitur kolaborasi dan timeline rilis tim',
    '#10b981',
    'kanban',
    now(),
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 4. Project Members (Bella sebagai editor di Sprint Planning Q4)
INSERT INTO public.project_members (project_id, user_id, role, invited_by, joined_at)
VALUES
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'editor',
    '00000000-0000-0000-0000-000000000001',
    now()
  )
ON CONFLICT (project_id, user_id) DO UPDATE SET
  role = EXCLUDED.role;

-- 5. Canvases
INSERT INTO public.canvases (
  id,
  project_id,
  name,
  data,
  thumbnail_url,
  order_index,
  created_by,
  last_edited_by,
  created_at,
  updated_at
)
VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'UI Component Architecture',
    $${
      "elements": [
        {
          "id": "elem_rect_1",
          "type": "rectangle",
          "x": 120,
          "y": 140,
          "width": 240,
          "height": 130,
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
        },
        {
          "id": "elem_arrow_1",
          "type": "arrow",
          "x": 360,
          "y": 205,
          "width": 140,
          "height": 0,
          "strokeColor": "#1e1e2e",
          "backgroundColor": "transparent",
          "fillStyle": "none",
          "strokeWidth": 2,
          "roughness": 1,
          "opacity": 100,
          "angle": 0,
          "seed": 67890,
          "version": 1,
          "groupIds": []
        },
        {
          "id": "elem_rect_2",
          "type": "rectangle",
          "x": 500,
          "y": 140,
          "width": 240,
          "height": 130,
          "strokeColor": "#1e1e2e",
          "backgroundColor": "#a6e3a1",
          "fillStyle": "cross-hatch",
          "strokeWidth": 2,
          "roughness": 1,
          "opacity": 100,
          "angle": 0,
          "seed": 45678,
          "version": 1,
          "groupIds": []
        }
      ],
      "appState": {
        "viewBackgroundColor": "#fbfbfe",
        "gridSize": null,
        "zoom": { "value": 1 }
      }
    }$$::jsonb,
    NULL,
    0,
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    now(),
    now()
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'User Journey Wireframe',
    $${
      "elements": [
        {
          "id": "elem_circle_1",
          "type": "ellipse",
          "x": 200,
          "y": 180,
          "width": 140,
          "height": 140,
          "strokeColor": "#3b82f6",
          "backgroundColor": "#bfdbfe",
          "fillStyle": "solid",
          "strokeWidth": 2,
          "roughness": 1,
          "opacity": 90,
          "angle": 0,
          "seed": 88888,
          "version": 1,
          "groupIds": []
        }
      ],
      "appState": {
        "viewBackgroundColor": "#ffffff",
        "gridSize": null,
        "zoom": { "value": 1 }
      }
    }$$::jsonb,
    NULL,
    1,
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    now(),
    now()
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000002',
    'Brainstorming Session',
    $${
      "elements": [
        {
          "id": "elem_text_1",
          "type": "text",
          "x": 150,
          "y": 100,
          "width": 300,
          "height": 50,
          "strokeColor": "#111827",
          "backgroundColor": "transparent",
          "fillStyle": "none",
          "strokeWidth": 1,
          "roughness": 0,
          "opacity": 100,
          "angle": 0,
          "seed": 11111,
          "version": 1,
          "groupIds": [],
          "text": "Sprint 1 Priorities: Canvas Tools & Supabase Sync",
          "fontSize": 20,
          "fontFamily": "sans-serif",
          "textAlign": "left"
        }
      ],
      "appState": {
        "viewBackgroundColor": "#ffffff",
        "gridSize": null,
        "zoom": { "value": 1 }
      }
    }$$::jsonb,
    NULL,
    0,
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    now(),
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  data = EXCLUDED.data;
