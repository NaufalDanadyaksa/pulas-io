---
description: Workflow untuk menulis unit tests (Vitest), component tests (Testing Library), dan E2E tests (Playwright). Gunakan setiap kali selesai mengimplementasikan fitur atau saat memperbaiki bug.
---

# Workflow: Testing

## Kapan Digunakan
- Setelah selesai mengimplementasikan fitur baru
- Saat memperbaiki bug (tulis regression test terlebih dahulu)
- Sebelum merge ke main branch

## Struktur Testing

```
apps/web/src/
├── features/
│   └── project/
│       └── __tests__/
│           ├── useProjects.test.ts       # Unit test hook
│           └── ProjectCard.test.tsx     # Component test
tests/
└── e2e/
    ├── auth.spec.ts                     # E2E: login, register
    ├── project.spec.ts                  # E2E: CRUD project
    └── canvas.spec.ts                   # E2E: canvas editor
```

## Unit Test — Vitest

### Test Custom Hook
```typescript
// src/features/project/__tests__/useProjects.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createWrapper } from '@/test/utils';  // QueryClient wrapper
import { useProjects } from '../hooks/useProjects';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [{ id: '1', name: 'Test Project', canvases: [] }],
        error: null,
      }),
    })),
  },
}));

describe('useProjects', () => {
  it('mengembalikan daftar project milik user', async () => {
    const { result } = renderHook(
      () => useProjects('user-123'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].name).toBe('Test Project');
  });

  it('menangani error dari Supabase', async () => {
    // Override mock untuk skenario error
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
    } as never);

    const { result } = renderHook(
      () => useProjects('user-123'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
```

### Test Zod Schema
```typescript
// src/features/project/__tests__/project.schema.test.ts
import { describe, it, expect } from 'vitest';
import { createProjectSchema } from '../schemas/project.schema';

describe('createProjectSchema', () => {
  it('menerima input valid', () => {
    const result = createProjectSchema.safeParse({
      name: 'My Project',
      color: '#6366f1',
    });
    expect(result.success).toBe(true);
  });

  it('menolak nama kosong', () => {
    const result = createProjectSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('name');
  });

  it('menggunakan warna default jika tidak diberikan', () => {
    const result = createProjectSchema.parse({ name: 'Test' });
    expect(result.color).toBe('#6366f1');
  });
});
```

## Component Test — Testing Library

```tsx
// src/features/project/__tests__/ProjectCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectCard } from '../components/ProjectCard';

const mockProject = {
  id: 'project-1',
  name: 'Website Redesign',
  color: '#6366f1',
  canvases: [{ id: 'canvas-1', thumbnail_url: null }],
};

describe('ProjectCard', () => {
  it('menampilkan nama project', () => {
    render(<ProjectCard project={mockProject} onSelect={vi.fn()} />);
    expect(screen.getByText('Website Redesign')).toBeInTheDocument();
  });

  it('memanggil onSelect saat diklik', () => {
    const onSelect = vi.fn();
    render(<ProjectCard project={mockProject} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: /website redesign/i }));
    expect(onSelect).toHaveBeenCalledWith('project-1');
  });

  it('accessible via keyboard (Enter key)', () => {
    const onSelect = vi.fn();
    render(<ProjectCard project={mockProject} onSelect={onSelect} />);

    const card = screen.getByRole('button');
    card.focus();
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('project-1');
  });
});
```

## E2E Test — Playwright

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Autentikasi', () => {
  test('user dapat login dengan email dan password', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#login-email', 'test@example.com');
    await page.fill('#login-password', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('menampilkan error saat kredensial salah', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#login-email', 'wrong@example.com');
    await page.fill('#login-password', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL('/login'); // tetap di halaman login
  });
});

test.describe('Canvas Editor', () => {
  test.beforeEach(async ({ page }) => {
    // Login sebagai test user
    await page.goto('/login');
    await page.fill('#login-email', process.env.TEST_USER_EMAIL!);
    await page.fill('#login-password', process.env.TEST_USER_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('auto-save berjalan setelah 1 detik idle', async ({ page }) => {
    await page.goto('/canvas/test-canvas-id');

    // Gambar sesuatu di canvas
    await page.click('[data-tool="rectangle"]');
    await page.dragAndDrop('#canvas-surface', '#canvas-surface', {
      sourcePosition: { x: 100, y: 100 },
      targetPosition: { x: 200, y: 200 },
    });

    // Tunggu 1.5 detik dan cek indikator saved
    await page.waitForTimeout(1500);
    await expect(page.getByText('Saved')).toBeVisible();
  });
});
```

## Menjalankan Tests

```bash
# Unit + Component tests
pnpm test

# Watch mode (development)
pnpm test:watch

# E2E tests (membutuhkan app berjalan)
pnpm dev &
pnpm test:e2e

# Coverage report
pnpm test:coverage
# Target: ≥ 70% (sesuai PRD §13)
```

## Checklist Testing
- [ ] Unit test untuk setiap custom hook dengan happy path + error path
- [ ] Unit test untuk setiap Zod schema (valid, invalid, default values)
- [ ] Component test untuk interaksi utama (klik, keyboard, error state)
- [ ] E2E test untuk critical user flows (login, buat project, buka canvas)
- [ ] Coverage ≥ 70% sebelum PR di-merge
- [ ] Semua test pass di CI (`pnpm test && pnpm test:e2e`)
