import { describe, it, expect, vi, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — antes de imports
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

vi.mock('@/components/layout/NavbarClient', () => ({
  NavbarClient: ({
    isAuthenticated,
    userName,
  }: {
    isAuthenticated: boolean
    userName: string
  }) => (
    <nav data-testid="navbar" data-authenticated={String(isAuthenticated)} data-username={userName} />
  ),
}))

// ---------------------------------------------------------------------------
// Import tras mocks
// ---------------------------------------------------------------------------

import React from 'react'
import CommunitiesLayout from '@/app/(app)/communities/layout'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-uuid-001', email: 'ana@example.com' }

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

function mockProfile(name: string | null) {
  supabaseMock.from.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: name ? { name } : null, error: null }),
      }),
    }),
  })
}

// ---------------------------------------------------------------------------
// Suite: autenticación
// ---------------------------------------------------------------------------

describe('CommunitiesLayout — autenticación', () => {
  afterEach(() => vi.clearAllMocks())

  it('redirige a /login cuando el usuario no está autenticado', async () => {
    mockNoAuth()

    await expect(
      CommunitiesLayout({ children: React.createElement('div') })
    ).rejects.toThrow('REDIRECT:/login')

    expect(redirectMock).toHaveBeenCalledWith('/login')
  })
})

// ---------------------------------------------------------------------------
// Suite: renderizado
// ---------------------------------------------------------------------------

describe('CommunitiesLayout — renderizado', () => {
  afterEach(() => vi.clearAllMocks())

  it('renderiza el NavbarClient con isAuthenticated=true cuando hay sesión', async () => {
    mockAuth()
    mockProfile('Ana García')

    const element = await CommunitiesLayout({ children: React.createElement('div') })
    const output = JSON.stringify(element)

    // El elemento contiene isAuthenticated:true en los props del NavbarClient
    expect(output).toContain('"isAuthenticated":true')
  })

  it('pasa el nombre del perfil al NavbarClient', async () => {
    mockAuth()
    mockProfile('Ana García')

    const element = await CommunitiesLayout({ children: React.createElement('div') })
    const output = JSON.stringify(element)

    expect(output).toContain('Ana García')
  })

  it('usa el prefijo del email como userName cuando el perfil no tiene nombre', async () => {
    mockAuth()
    mockProfile(null)

    const element = await CommunitiesLayout({ children: React.createElement('div') })
    const output = JSON.stringify(element)

    // El email 'ana@example.com' → prefijo 'ana'
    expect(output).toContain('ana')
  })

  it('renderiza los children dentro del contenedor principal', async () => {
    mockAuth()
    mockProfile('Ana García')

    const children = React.createElement('span', { 'data-testid': 'child-content' }, 'contenido hijo')
    const element = await CommunitiesLayout({ children })
    const output = JSON.stringify(element)

    expect(output).toContain('child-content')
  })

  it('incluye el enlace de skip navigation con texto accesible', async () => {
    mockAuth()
    mockProfile('Ana García')

    const element = await CommunitiesLayout({ children: React.createElement('div') })
    const output = JSON.stringify(element)

    expect(output).toContain('Saltar al contenido principal')
  })

  it('incluye el atributo id="main-content" en el contenedor de children', async () => {
    mockAuth()
    mockProfile('Ana García')

    const element = await CommunitiesLayout({ children: React.createElement('div') })
    const output = JSON.stringify(element)

    expect(output).toContain('main-content')
  })
})
