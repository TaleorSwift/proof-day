// @vitest-environment jsdom
/**
 * Tests — CommunitySettingsPage
 * Verifica el gating de autenticación, existencia de comunidad y rol de admin.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks hoisted
// ---------------------------------------------------------------------------

const {
  redirectMock,
  createClientMock,
} = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  createClientMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}))

// Mock BackButton para no depender de lucide-react en jsdom
vi.mock('@/components/shared/BackButton', () => ({
  BackButton: ({ href, label }: { href: string; label?: string }) => (
    <a href={href} data-testid="back-button">{label ?? 'Volver al feed'}</a>
  ),
}))

// Mock InvitationSection para aislar la página
vi.mock('@/components/communities/InvitationSection', () => ({
  default: ({ communityId }: { communityId: string }) => (
    <div data-testid="invitation-section" data-community-id={communityId} />
  ),
}))

// ---------------------------------------------------------------------------
// Factory de supabase mock
// ---------------------------------------------------------------------------

function makeSupabaseMock({
  user = { id: 'user-admin-123' } as { id: string } | null,
  community = { id: 'community-1', name: 'Mi Comunidad', slug: 'mi-comunidad' } as {
    id: string; name: string; slug: string
  } | null,
  membership = { role: 'admin' } as { role: string } | null,
} = {}) {
  const fromFn = vi.fn().mockImplementation((table: string) => {
    if (table === 'communities') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: community, error: community ? null : { message: 'Not found' } }),
      }
    }
    if (table === 'community_members') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: membership, error: membership ? null : { message: 'Not found' } }),
      }
    }
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null }),
    }
  })

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: fromFn,
  }
}

createClientMock.mockResolvedValue(makeSupabaseMock())

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}))

import CommunitySettingsPage from '@/app/(app)/communities/[slug]/settings/page'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeParams(slug = 'mi-comunidad') {
  return { params: Promise.resolve({ slug }) }
}

// ---------------------------------------------------------------------------
// No autenticado → redirect /login
// ---------------------------------------------------------------------------

describe('CommunitySettingsPage — no autenticado', () => {
  beforeEach(() => {
    createClientMock.mockResolvedValueOnce(makeSupabaseMock({ user: null }))
    redirectMock.mockImplementation(() => { throw new Error('NEXT_REDIRECT') })
  })

  afterEach(() => {
    vi.clearAllMocks()
    createClientMock.mockResolvedValue(makeSupabaseMock())
  })

  it('llama a redirect("/login") cuando no hay sesión', async () => {
    await expect(
      CommunitySettingsPage(makeParams())
    ).rejects.toThrow('NEXT_REDIRECT')
    expect(redirectMock).toHaveBeenCalledWith('/login')
  })

  it('llama a redirect exactamente una vez', async () => {
    await expect(
      CommunitySettingsPage(makeParams())
    ).rejects.toThrow('NEXT_REDIRECT')
    expect(redirectMock).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// Comunidad no existe → redirect /communities
// ---------------------------------------------------------------------------

describe('CommunitySettingsPage — comunidad no existe', () => {
  beforeEach(() => {
    createClientMock.mockResolvedValueOnce(
      makeSupabaseMock({ community: null })
    )
    redirectMock.mockImplementation(() => { throw new Error('NEXT_REDIRECT') })
  })

  afterEach(() => {
    vi.clearAllMocks()
    createClientMock.mockResolvedValue(makeSupabaseMock())
  })

  it('llama a redirect("/communities") cuando la comunidad no existe', async () => {
    await expect(
      CommunitySettingsPage(makeParams('slug-inexistente'))
    ).rejects.toThrow('NEXT_REDIRECT')
    expect(redirectMock).toHaveBeenCalledWith('/communities')
  })
})

// ---------------------------------------------------------------------------
// Miembro no-admin (role: 'member') → redirect /communities
// ---------------------------------------------------------------------------

describe('CommunitySettingsPage — no admin (role member)', () => {
  beforeEach(() => {
    createClientMock.mockResolvedValueOnce(
      makeSupabaseMock({ membership: { role: 'member' } })
    )
    redirectMock.mockImplementation(() => { throw new Error('NEXT_REDIRECT') })
  })

  afterEach(() => {
    vi.clearAllMocks()
    createClientMock.mockResolvedValue(makeSupabaseMock())
  })

  it('llama a redirect("/communities") cuando el rol es member', async () => {
    await expect(
      CommunitySettingsPage(makeParams())
    ).rejects.toThrow('NEXT_REDIRECT')
    expect(redirectMock).toHaveBeenCalledWith('/communities')
  })
})

// ---------------------------------------------------------------------------
// Sin membresía → redirect /communities
// ---------------------------------------------------------------------------

describe('CommunitySettingsPage — sin membresía', () => {
  beforeEach(() => {
    createClientMock.mockResolvedValueOnce(
      makeSupabaseMock({ membership: null })
    )
    redirectMock.mockImplementation(() => { throw new Error('NEXT_REDIRECT') })
  })

  afterEach(() => {
    vi.clearAllMocks()
    createClientMock.mockResolvedValue(makeSupabaseMock())
  })

  it('llama a redirect("/communities") cuando no hay membresía', async () => {
    await expect(
      CommunitySettingsPage(makeParams())
    ).rejects.toThrow('NEXT_REDIRECT')
    expect(redirectMock).toHaveBeenCalledWith('/communities')
  })
})

// ---------------------------------------------------------------------------
// Admin de la comunidad → renderiza InvitationSection
// ---------------------------------------------------------------------------

describe('CommunitySettingsPage — admin autenticado', () => {
  afterEach(() => {
    vi.clearAllMocks()
    createClientMock.mockResolvedValue(makeSupabaseMock())
  })

  it('renderiza el heading de configuración', async () => {
    const jsx = await CommunitySettingsPage(makeParams())
    render(jsx as React.ReactElement)
    expect(
      screen.getByRole('heading', { level: 1, name: /Configuración/i })
    ).toBeInTheDocument()
  })

  it('renderiza InvitationSection', async () => {
    const jsx = await CommunitySettingsPage(makeParams())
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('invitation-section')).toBeInTheDocument()
  })

  it('InvitationSection recibe el communityId correcto', async () => {
    const jsx = await CommunitySettingsPage(makeParams())
    render(jsx as React.ReactElement)
    const section = screen.getByTestId('invitation-section')
    expect(section).toHaveAttribute('data-community-id', 'community-1')
  })

  it('renderiza el BackButton con href al feed', async () => {
    const jsx = await CommunitySettingsPage(makeParams())
    render(jsx as React.ReactElement)
    const backBtn = screen.getByTestId('back-button')
    expect(backBtn).toHaveAttribute('href', '/communities/mi-comunidad')
  })

  it('NO llama a redirect cuando el usuario es admin', async () => {
    await CommunitySettingsPage(makeParams())
    expect(redirectMock).not.toHaveBeenCalled()
  })
})
