import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock de Supabase server
// ---------------------------------------------------------------------------

const { supabaseMock } = vi.hoisted(() => {
  const supabaseMock = {
    from: vi.fn(),
  }
  return { supabaseMock }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(supabaseMock),
}))

// ---------------------------------------------------------------------------
// Import tras mocks
// ---------------------------------------------------------------------------

import { getUserCommunities } from '@/lib/queries/communities'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const USER_ID = 'user-uuid-001'

const MOCK_COMMUNITIES_RAW = [
  {
    id: 'c1', name: 'Startup Madrid', slug: 'startup-madrid',
    description: 'Desc', image_url: null, created_by: USER_ID,
    created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    community_members: [{ user_id: USER_ID }],
  },
  {
    id: 'c2', name: 'Tech BCN', slug: 'tech-bcn',
    description: null, image_url: 'https://example.com/img.jpg', created_by: 'u2',
    created_at: '2024-01-02T00:00:00Z', updated_at: '2024-01-02T00:00:00Z',
    community_members: [{ user_id: USER_ID }],
  },
]

const MOCK_MEMBER_DATA = [
  { community_id: 'c1' },
  { community_id: 'c1' },
  { community_id: 'c2' },
]

function mockFromChain(
  communities: typeof MOCK_COMMUNITIES_RAW | null,
  memberData: typeof MOCK_MEMBER_DATA,
  communitiesError: Error | null = null,
) {
  let callCount = 0
  supabaseMock.from.mockImplementation((table: string) => {
    if (table === 'communities') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: communities, error: communitiesError }),
          }),
        }),
      }
    }
    if (table === 'community_members') {
      callCount++
      if (callCount === 1) {
        // Segunda llamada: getMemberCounts
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: memberData, error: null }),
          }),
        }
      }
    }
    return {}
  })
}

// ---------------------------------------------------------------------------
// Suite principal
// ---------------------------------------------------------------------------

describe('getUserCommunities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna un array vacío cuando Supabase devuelve error', async () => {
    supabaseMock.from.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
        }),
      }),
    }))

    const result = await getUserCommunities(USER_ID)

    expect(result).toEqual([])
  })

  it('retorna un array vacío cuando no hay comunidades', async () => {
    supabaseMock.from.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    }))

    const result = await getUserCommunities(USER_ID)

    expect(result).toEqual([])
  })

  it('mapea correctamente los campos de las comunidades', async () => {
    mockFromChain(MOCK_COMMUNITIES_RAW, MOCK_MEMBER_DATA)

    const result = await getUserCommunities(USER_ID)

    expect(result[0]).toMatchObject({
      id: 'c1',
      name: 'Startup Madrid',
      slug: 'startup-madrid',
      description: 'Desc',
      imageUrl: null,
      createdBy: USER_ID,
    })
  })

  it('calcula correctamente el memberCount por comunidad', async () => {
    mockFromChain(MOCK_COMMUNITIES_RAW, MOCK_MEMBER_DATA)

    const result = await getUserCommunities(USER_ID)

    const c1 = result.find((c) => c.id === 'c1')
    const c2 = result.find((c) => c.id === 'c2')
    expect(c1?.memberCount).toBe(2)
    expect(c2?.memberCount).toBe(1)
  })

  it('asigna memberCount 0 cuando no hay miembros registrados', async () => {
    mockFromChain(MOCK_COMMUNITIES_RAW, [])

    const result = await getUserCommunities(USER_ID)

    expect(result[0].memberCount).toBe(0)
    expect(result[1].memberCount).toBe(0)
  })

  it('llama a from("communities") con los parámetros correctos', async () => {
    mockFromChain(MOCK_COMMUNITIES_RAW, MOCK_MEMBER_DATA)

    await getUserCommunities(USER_ID)

    expect(supabaseMock.from).toHaveBeenCalledWith('communities')
  })
})
