import { describe, it, expect, vi, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock de Supabase server
// ---------------------------------------------------------------------------

const { supabaseMock } = vi.hoisted(() => {
  const supabaseMock = {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  }
  return { supabaseMock }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(supabaseMock),
}))

// ---------------------------------------------------------------------------
// Imports tras mocks
// ---------------------------------------------------------------------------

import { POST } from '@/app/api/communities/[communityId]/invitations/route'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-uuid-001' }
const COMMUNITY_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

function buildParams(communityId: string = COMMUNITY_ID) {
  return { params: Promise.resolve({ communityId }) }
}

function buildRequest(): Request {
  return new Request(`http://localhost/api/communities/${COMMUNITY_ID}/invitations`, {
    method: 'POST',
  })
}

// ---------------------------------------------------------------------------
// Suite: POST /api/communities/[communityId]/invitations
// ---------------------------------------------------------------------------

describe('POST /api/communities/[communityId]/invitations', () => {
  afterEach(() => vi.clearAllMocks())

  it('retorna 401 cuando el usuario no está autenticado', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null } })

    const res = await POST(buildRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.code).toBe('AUTH_REQUIRED')
  })

  it('retorna 400 cuando el communityId no es un UUID válido', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })

    const res = await POST(buildRequest(), buildParams('no-es-uuid'))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 403 cuando el usuario no es admin de la comunidad', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })

    supabaseMock.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { role: 'member' }, error: null }),
          }),
        }),
      }),
    })

    const res = await POST(buildRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.code).toBe('FORBIDDEN')
  })

  it('retorna 403 cuando el usuario no es miembro de la comunidad', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })

    supabaseMock.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    })

    const res = await POST(buildRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.code).toBe('FORBIDDEN')
  })

  it('retorna 201 con el token cuando el admin genera una invitación', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })

    const mockInvitation = {
      id: 'inv-001',
      token: 'abc123',
      community_id: COMMUNITY_ID,
      created_by: MOCK_USER.id,
    }

    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'community_members') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
              }),
            }),
          }),
        }
      }
      if (table === 'invitation_links') {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockInvitation, error: null }),
            }),
          }),
        }
      }
      return {}
    })

    const res = await POST(buildRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.data).toEqual(mockInvitation)
  })

  it('retorna 500 cuando la inserción en Supabase falla', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })

    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'community_members') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
              }),
            }),
          }),
        }
      }
      if (table === 'invitation_links') {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
            }),
          }),
        }
      }
      return {}
    })

    const res = await POST(buildRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.code).toBe('INVITATION_CREATE_ERROR')
  })
})
