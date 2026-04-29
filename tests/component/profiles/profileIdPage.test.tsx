import { describe, it, expect, vi, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — deben declararse antes de los imports
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

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}))

// ---------------------------------------------------------------------------
// Import tras mocks
// ---------------------------------------------------------------------------

import React from 'react'
import UserProfilePage from '@/app/(app)/profile/[id]/page'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CURRENT_USER = { id: 'user-current-001', email: 'actual@example.com' }
const TARGET_USER_ID = 'user-target-002'

const MOCK_PROFILE_ROW = {
  id: TARGET_USER_ID,
  name: 'Carlos López',
  bio: 'Desarrollador',
  interests: ['tech'],
  avatar_url: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

function buildProps(id: string) {
  return { params: Promise.resolve({ id }) }
}

function mockNoAuth() {
  supabaseMock.auth.getUser.mockResolvedValue({
    data: { user: null },
    error: new Error('no auth'),
  })
}

function mockAuth() {
  supabaseMock.auth.getUser.mockResolvedValue({
    data: { user: CURRENT_USER },
    error: null,
  })
}

// ---------------------------------------------------------------------------
// Suite: autenticación
// ---------------------------------------------------------------------------

describe('UserProfilePage — autenticación', () => {
  afterEach(() => vi.clearAllMocks())

  it('redirige a /login cuando el usuario no está autenticado', async () => {
    mockNoAuth()

    await expect(UserProfilePage(buildProps(TARGET_USER_ID))).rejects.toThrow(
      'REDIRECT:/login'
    )
    expect(redirectMock).toHaveBeenCalledWith('/login')
  })
})

// ---------------------------------------------------------------------------
// Suite: redirección al propio perfil
// ---------------------------------------------------------------------------

describe('UserProfilePage — redirección a perfil propio', () => {
  afterEach(() => vi.clearAllMocks())

  it('redirige a /profile cuando el id coincide con el usuario autenticado', async () => {
    mockAuth()

    await expect(UserProfilePage(buildProps(CURRENT_USER.id))).rejects.toThrow(
      'REDIRECT:/profile'
    )
    expect(redirectMock).toHaveBeenCalledWith('/profile')
  })
})

// ---------------------------------------------------------------------------
// Suite: control de acceso por comunidad compartida
// ---------------------------------------------------------------------------

describe('UserProfilePage — control de acceso por comunidad', () => {
  afterEach(() => vi.clearAllMocks())

  it('redirige con error cuando el usuario objetivo no pertenece a ninguna comunidad', async () => {
    mockAuth()
    supabaseMock.from.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    }))

    await expect(UserProfilePage(buildProps(TARGET_USER_ID))).rejects.toThrow(
      'REDIRECT:/communities?error=profile_access_denied'
    )
    expect(redirectMock).toHaveBeenCalledWith(
      '/communities?error=profile_access_denied'
    )
  })

  it('redirige con error cuando no comparten ninguna comunidad', async () => {
    mockAuth()
    let callCount = 0
    supabaseMock.from.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        // Memberships del usuario objetivo — tiene comunidades
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ community_id: 'com-1' }],
              error: null,
            }),
          }),
        }
      }
      // Memberships compartidas — ninguna
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }),
      }
    })

    await expect(UserProfilePage(buildProps(TARGET_USER_ID))).rejects.toThrow(
      'REDIRECT:/communities?error=profile_access_denied'
    )
  })
})

// ---------------------------------------------------------------------------
// Suite: renderizado con acceso permitido
// ---------------------------------------------------------------------------

describe('UserProfilePage — renderizado con acceso permitido', () => {
  afterEach(() => vi.clearAllMocks())

  it('muestra el nombre del perfil cuando el acceso es válido', async () => {
    mockAuth()
    let callCount = 0
    supabaseMock.from.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        // Memberships objetivo
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ community_id: 'com-1' }],
              error: null,
            }),
          }),
        }
      }
      if (callCount === 2) {
        // Memberships compartidas — hay coincidencia
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [{ community_id: 'com-1' }],
                  error: null,
                }),
              }),
            }),
          }),
        }
      }
      if (callCount === 3) {
        // Perfil
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: MOCK_PROFILE_ROW,
                error: null,
              }),
            }),
          }),
        }
      }
      // Conteo de proyectos
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: 4, error: null }),
        }),
      }
    })

    const element = await UserProfilePage(buildProps(TARGET_USER_ID))
    const output = JSON.stringify(element)

    expect(output).toContain('Carlos López')
  })

  it('redirige con profile_not_found cuando el perfil no existe en BD', async () => {
    mockAuth()
    let callCount = 0
    supabaseMock.from.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ community_id: 'com-1' }],
              error: null,
            }),
          }),
        }
      }
      if (callCount === 2) {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [{ community_id: 'com-1' }],
                  error: null,
                }),
              }),
            }),
          }),
        }
      }
      // Perfil no encontrado
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: new Error('not found') }),
          }),
        }),
      }
    })

    await expect(UserProfilePage(buildProps(TARGET_USER_ID))).rejects.toThrow(
      'REDIRECT:/communities?error=profile_not_found'
    )
  })
})
