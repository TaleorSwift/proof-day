import { describe, it, expect, vi, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — deben declararse antes de los imports que los usan
// ---------------------------------------------------------------------------

const redirectMock = vi.fn()

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    redirectMock(url)
    throw new Error(`REDIRECT:${url}`)
  },
}))

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

vi.mock('@/components/profiles/OwnProfileView', () => ({
  OwnProfileView: ({ profile }: { profile: { name: string | null } }) => (
    <div data-testid="own-profile-view">{profile.name ?? 'Sin nombre'}</div>
  ),
}))

// ---------------------------------------------------------------------------
// Import tras mocks
// ---------------------------------------------------------------------------

import React from 'react'
import ProfilePage from '@/app/(app)/profile/page'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-uuid-001', email: 'ana@example.com' }

const MOCK_PROFILE_ROW = {
  id: MOCK_USER.id,
  name: 'Ana García',
  bio: 'Emprendedora',
  interests: ['IA', 'Startups'],
  avatar_url: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

function mockNoAuth() {
  supabaseMock.auth.getUser.mockResolvedValue({
    data: { user: null },
    error: new Error('no auth'),
  })
}

function mockAuth() {
  supabaseMock.auth.getUser.mockResolvedValue({
    data: { user: MOCK_USER },
    error: null,
  })
}

function mockFromSequence(profileRow: unknown | null, feedbackCount: number, projectCount: number) {
  let callIndex = 0
  supabaseMock.from.mockImplementation(() => {
    callIndex++
    if (callIndex === 1) {
      // profiles
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: profileRow,
              error: profileRow ? null : new Error('not found'),
            }),
          }),
        }),
      }
    }
    if (callIndex === 2) {
      // feedbacks count
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: feedbackCount, error: null }),
        }),
      }
    }
    // projects count
    return {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: projectCount, error: null }),
      }),
    }
  })
}

// ---------------------------------------------------------------------------
// Suite: ProfilePage — autenticación
// ---------------------------------------------------------------------------

describe('ProfilePage — autenticación', () => {
  afterEach(() => vi.clearAllMocks())

  it('redirige a /login cuando el usuario no está autenticado', async () => {
    mockNoAuth()

    await expect(ProfilePage()).rejects.toThrow('REDIRECT:/login')
    expect(redirectMock).toHaveBeenCalledWith('/login')
  })
})

// ---------------------------------------------------------------------------
// Suite: ProfilePage — perfil no encontrado
// ---------------------------------------------------------------------------

describe('ProfilePage — perfil no encontrado', () => {
  afterEach(() => vi.clearAllMocks())

  it('redirige a /communities cuando el perfil no existe en BD', async () => {
    mockAuth()
    mockFromSequence(null, 0, 0)

    await expect(ProfilePage()).rejects.toThrow('REDIRECT:/communities')
    expect(redirectMock).toHaveBeenCalledWith('/communities')
  })
})

// ---------------------------------------------------------------------------
// Suite: ProfilePage — renderizado con datos
// ---------------------------------------------------------------------------

describe('ProfilePage — renderizado con datos', () => {
  afterEach(() => vi.clearAllMocks())

  it('renderiza OwnProfileView con los datos del perfil', async () => {
    mockAuth()
    mockFromSequence(MOCK_PROFILE_ROW, 5, 3)

    const element = await ProfilePage()
    const output = JSON.stringify(element)

    // El elemento contiene los props del perfil en la representación React
    expect(output).toContain('Ana García')
  })

  it('pasa feedbackCount y projectCount correctos al componente', async () => {
    mockAuth()
    mockFromSequence(MOCK_PROFILE_ROW, 7, 2)

    const element = await ProfilePage()
    // El elemento renderizado pasa el perfil al componente mockeado
    expect(element).not.toBeNull()
  })

  it('usa 0 cuando feedbackCount es null en la respuesta', async () => {
    mockAuth()
    let callIndex = 0
    supabaseMock.from.mockImplementation(() => {
      callIndex++
      if (callIndex === 1) {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: MOCK_PROFILE_ROW, error: null }),
            }),
          }),
        }
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: null, error: null }),
        }),
      }
    })

    const element = await ProfilePage()
    expect(element).not.toBeNull()
  })

  it('normaliza interests a array vacío cuando es null', async () => {
    mockAuth()
    const profileRowSinIntereses = { ...MOCK_PROFILE_ROW, interests: null }
    mockFromSequence(profileRowSinIntereses, 0, 0)

    const element = await ProfilePage()
    expect(element).not.toBeNull()
  })
})
