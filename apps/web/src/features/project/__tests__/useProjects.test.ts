import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchProjects, fetchProjectDetail } from '../hooks/useProjects';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('useProjects query functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('memanggil supabase dengan relational query dan menyaring deleted canvases', async () => {
    const mockData = [
      {
        id: 'p-1',
        name: 'Project One',
        owner_id: 'user-1',
        canvases: [
          { id: 'c-1', name: 'Active', deleted_at: null },
          { id: 'c-2', name: 'Deleted', deleted_at: '2026-09-15T00:00:00Z' },
        ],
        project_members: [{ user_id: 'user-1', role: 'admin' }],
      },
    ];

    const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never);

    const result = await fetchProjects();

    expect(supabase.from).toHaveBeenCalledWith('projects');
    expect(mockSelect).toHaveBeenCalledWith(
      expect.stringContaining('project_members')
    );
    expect(mockSelect).toHaveBeenCalledWith(
      expect.stringContaining('canvases')
    );
    expect(result.length).toBe(1);
    expect(result[0]?.canvases?.length).toBe(1);
    expect(result[0]?.canvases?.[0]?.name).toBe('Active');
  });

  it('menggunakan filter eq owner_id ketika userId diberikan', async () => {
    // when userId is passed, query.eq('owner_id', userId) is called
    const mockQueryBuilder = {
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: (resolve: (val: unknown) => void) => resolve({ data: [], error: null }),
    };
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue(mockQueryBuilder),
    } as never);

    const result = await fetchProjects('user-123');
    expect(mockQueryBuilder.eq).toHaveBeenCalledWith('owner_id', 'user-123');
    expect(result).toEqual([]);
  });

  it('fetchProjectDetail memanggil single dan mengembalikan detail project', async () => {
    const mockProject = {
      id: 'p-1',
      name: 'Solo Project',
      canvases: [{ id: 'c-1', name: 'Live', deleted_at: null }],
    };

    const mockSingle = vi.fn().mockResolvedValue({ data: mockProject, error: null });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never);

    const detail = await fetchProjectDetail('p-1');
    expect(mockEq).toHaveBeenCalledWith('id', 'p-1');
    expect(detail.name).toBe('Solo Project');
  });

  it('melempar error jika supabase mengembalikan error', async () => {
    const mockQueryBuilder = {
      order: vi.fn().mockReturnThis(),
      then: (resolve: (val: unknown) => void) =>
        resolve({ data: null, error: new Error('Database connection failed') }),
    };
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue(mockQueryBuilder),
    } as never);

    await expect(fetchProjects()).rejects.toThrow('Database connection failed');
  });
});
