// @vitest-environment jsdom
/**
 * Tests — NewProjectPage (smoke tests)
 * Verifica que la página renderiza el heading y el formulario correctamente.
 * Supabase, next/navigation y ProjectForm se mockean para aislar la página.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks hoisted
// ---------------------------------------------------------------------------

const { supabaseMock } = vi.hoisted(() => {
  const supabaseMock = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-001' } },
        error: null,
      }),
    },
    from: vi.fn(),
  }
  return { supabaseMock }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(supabaseMock),
}))

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  redirect: vi.fn(),
}))

vi.mock('@/components/projects/ProjectForm', () => ({
  ProjectForm: ({ communityId, communitySlug }: { communityId: string; communitySlug: string }) => (
    <div data-testid="project-form" data-community-id={communityId} data-community-slug={communitySlug} />
  ),
}))

// ---------------------------------------------------------------------------
// Import tras mocks
// ---------------------------------------------------------------------------

import NewProjectPage from '@/app/(app)/communities/[slug]/projects/new/page'
import { notFound, redirect } from 'next/navigation'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_COMMUNITY = { id: 'community-uuid-001', name: 'Startup Madrid' }

function buildProps(slug = 'startup-madrid') {
  return { params: Promise.resolve({ slug }) }
}

function mockCommunityFound(community = MOCK_COMMUNITY) {
  supabaseMock.from.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: community, error: null }),
      }),
    }),
  })
}

function mockCommunityNotFound() {
  supabaseMock.from.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }),
  })
}

// ---------------------------------------------------------------------------
// Suite: NewProjectPage
// ---------------------------------------------------------------------------

describe('NewProjectPage — smoke tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabaseMock.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-001' } },
      error: null,
    })
  })

  it('llama a notFound() cuando la comunidad no existe', async () => {
    mockCommunityNotFound()
    // notFound() en Next.js lanza un error interno — simulamos ese comportamiento
    // para que la ejecución se detenga correctamente en el test
    vi.mocked(notFound).mockImplementation(() => { throw new Error('NEXT_NOT_FOUND') })

    await expect(NewProjectPage(buildProps())).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('llama a redirect("/login") cuando el usuario no está autenticado', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated'),
    })
    mockCommunityFound()

    await NewProjectPage(buildProps())

    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('renderiza el heading "Nuevo proyecto" cuando la comunidad existe y hay sesión', async () => {
    mockCommunityFound()

    const element = await NewProjectPage(buildProps())
    render(element as React.ReactElement)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Nuevo proyecto')
  })

  it('renderiza el nombre de la comunidad como subtítulo', async () => {
    mockCommunityFound()

    const element = await NewProjectPage(buildProps())
    render(element as React.ReactElement)

    expect(screen.getByText('Startup Madrid')).toBeInTheDocument()
  })

  it('renderiza el ProjectForm con communityId y communitySlug correctos', async () => {
    mockCommunityFound()

    const element = await NewProjectPage(buildProps('startup-madrid'))
    render(element as React.ReactElement)

    const form = screen.getByTestId('project-form')
    expect(form).toBeInTheDocument()
    expect(form.getAttribute('data-community-id')).toBe(MOCK_COMMUNITY.id)
    expect(form.getAttribute('data-community-slug')).toBe('startup-madrid')
  })
})
