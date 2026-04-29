// @vitest-environment jsdom
/**
 * Tests — InviteTokenPage Server Component (app/invite/[token]/page.tsx)
 * Cubre: no-auth redirect, token inválido, token ya usado, ya-miembro,
 *        happy path (join + invalidar + redirect), rollback ante fallo de invalidación.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks hoisted
// ---------------------------------------------------------------------------

const {
  mockRedirect,
  mockGetUser,
  mockRpc,
  mockFrom,
  mockCreateClient,
} = vi.hoisted(() => {
  // Encadenamiento fluido: .from(table).select(...).eq(...).eq(...).maybeSingle()
  // .from(table).insert(...) → { error }
  // .from(table).update(...).eq(...) → { error }
  // .from(table).delete().eq(...).eq(...) → { error }

  const mockMaybeSingle = vi.fn()
  const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle, eq: mockEq }))
  const mockSelect = vi.fn(() => ({ eq: mockEq }))
  const mockInsert = vi.fn()
  const mockUpdateEq = vi.fn()
  const mockUpdate = vi.fn(() => ({ eq: mockUpdateEq }))
  const mockDeleteEq2 = vi.fn()
  const mockDeleteEq = vi.fn(() => ({ eq: mockDeleteEq2 }))
  const mockDelete = vi.fn(() => ({ eq: mockDeleteEq }))

  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
  }))

  const mockRpc = vi.fn()

  const mockGetUser = vi.fn()
  const mockRedirect = vi.fn()

  const mockCreateClient = vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    rpc: mockRpc,
    from: mockFrom,
  })

  return { mockRedirect, mockGetUser, mockRpc, mockFrom, mockCreateClient }
})

vi.mock('next/navigation', () => ({ redirect: mockRedirect }))
vi.mock('@/lib/supabase/server', () => ({ createClient: mockCreateClient }))

// Stubs de componentes extraídos — permiten verificar que se renderizan
vi.mock('@/components/invitations/InviteErrorState', () => ({
  InviteErrorState: ({ message }: { message: string }) => (
    <div data-testid="invite-error-state">{message}</div>
  ),
}))

vi.mock('@/components/invitations/InviteAlreadyMemberState', () => ({
  InviteAlreadyMemberState: () => (
    <div data-testid="invite-already-member-state">Ya eres miembro</div>
  ),
}))

import InvitePage from '@/app/invite/[token]/page'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeParams = (token: string) => Promise.resolve({ token })

const validInvitation = {
  id: 'inv-001',
  community_id: 'comm-001',
  used_at: null,
}

const usedInvitation = {
  id: 'inv-002',
  community_id: 'comm-001',
  used_at: '2026-01-01T00:00:00Z',
}

// ---------------------------------------------------------------------------
// Suite 1: no autenticado → redirect a /login?next=/invite/{token}
// ---------------------------------------------------------------------------

describe('InviteTokenPage — no autenticado', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    mockRedirect.mockImplementation(() => { throw new Error('NEXT_REDIRECT') })
  })

  afterEach(() => vi.clearAllMocks())

  it('llama a redirect con /login?next=/invite/{token} cuando no hay sesión', async () => {
    await expect(
      InvitePage({ params: makeParams('abc-token-123') })
    ).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login?next=/invite/abc-token-123')
  })

  it('llama a redirect exactamente una vez', async () => {
    await expect(
      InvitePage({ params: makeParams('abc-token-123') })
    ).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// Suite 2: token inválido (RPC devuelve null) → InviteErrorState
// ---------------------------------------------------------------------------

describe('InviteTokenPage — token inválido (RPC null)', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-001' } } })
    mockRpc.mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) })
  })

  afterEach(() => vi.clearAllMocks())

  it('renderiza InviteErrorState cuando el RPC devuelve null', async () => {
    const jsx = await InvitePage({ params: makeParams('invalid-token') })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('invite-error-state')).toBeInTheDocument()
  })

  it('muestra el mensaje de token inválido', async () => {
    const jsx = await InvitePage({ params: makeParams('invalid-token') })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('invite-error-state')).toHaveTextContent('Este link ya no es válido')
  })
})

// ---------------------------------------------------------------------------
// Suite 2b: RPC devuelve error → InviteErrorState
// ---------------------------------------------------------------------------

describe('InviteTokenPage — RPC devuelve error', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-001' } } })
    mockRpc.mockReturnValue({
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
    })
  })

  afterEach(() => vi.clearAllMocks())

  it('renderiza el estado de error cuando el RPC devuelve error', async () => {
    const jsx = await InvitePage({ params: makeParams('any-token') })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('invite-error-state')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite 3: token ya usado (used_at no es null) → InviteErrorState
// ---------------------------------------------------------------------------

describe('InviteTokenPage — token ya usado', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-001' } } })
    mockRpc.mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: usedInvitation, error: null }) })
  })

  afterEach(() => vi.clearAllMocks())

  it('renderiza InviteErrorState cuando el token ya fue usado', async () => {
    const jsx = await InvitePage({ params: makeParams('used-token') })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('invite-error-state')).toBeInTheDocument()
  })

  it('muestra el mensaje apropiado para token usado', async () => {
    const jsx = await InvitePage({ params: makeParams('used-token') })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('invite-error-state')).toHaveTextContent('Este link ya no es válido')
  })
})

// ---------------------------------------------------------------------------
// Suite 4: ya es miembro → InviteAlreadyMemberState
// ---------------------------------------------------------------------------

describe('InviteTokenPage — usuario ya es miembro', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-001' } } })
    mockRpc.mockReturnValue({
      maybeSingle: vi.fn().mockResolvedValue({ data: validInvitation, error: null }),
    })
    // .from('community_members').select('id').eq(...).eq(...).maybeSingle() → ya miembro
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'member-001' }, error: null }),
          }),
        }),
      }),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })
  })

  afterEach(() => vi.clearAllMocks())

  it('renderiza InviteAlreadyMemberState cuando el usuario ya es miembro', async () => {
    const jsx = await InvitePage({ params: makeParams('valid-token') })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('invite-already-member-state')).toBeInTheDocument()
  })

  it('no renderiza InviteErrorState cuando el usuario ya es miembro', async () => {
    const jsx = await InvitePage({ params: makeParams('valid-token') })
    render(jsx as React.ReactElement)
    expect(screen.queryByTestId('invite-error-state')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite 5: happy path — join exitoso → redirect a /communities
// ---------------------------------------------------------------------------

describe('InviteTokenPage — happy path (join exitoso)', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-001' } } })
    mockRpc.mockReturnValue({
      maybeSingle: vi.fn().mockResolvedValue({ data: validInvitation, error: null }),
    })
    mockFrom.mockReturnValue({
      // community_members check → no miembro
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
      // insert → éxito
      insert: vi.fn().mockResolvedValue({ error: null }),
      // update used_at → éxito
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
      delete: vi.fn(),
    })
    mockRedirect.mockImplementation(() => { throw new Error('NEXT_REDIRECT') })
  })

  afterEach(() => vi.clearAllMocks())

  it('llama a redirect("/communities") tras join exitoso', async () => {
    await expect(
      InvitePage({ params: makeParams('valid-token') })
    ).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/communities')
  })

  it('llama al RPC validate_invitation_token con el token correcto', async () => {
    await expect(
      InvitePage({ params: makeParams('my-token-abc') })
    ).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRpc).toHaveBeenCalledWith('validate_invitation_token', { p_token: 'my-token-abc' })
  })
})

// ---------------------------------------------------------------------------
// Suite 6: rollback — insert OK pero invalidación falla → error + delete membresía
// ---------------------------------------------------------------------------

describe('InviteTokenPage — rollback ante fallo de invalidación', () => {
  const mockDelete = vi.fn()

  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-001' } } })
    mockRpc.mockReturnValue({
      maybeSingle: vi.fn().mockResolvedValue({ data: validInvitation, error: null }),
    })

    const mockDeleteEq2 = vi.fn().mockResolvedValue({ error: null })
    const mockDeleteEq = vi.fn(() => ({ eq: mockDeleteEq2 }))
    mockDelete.mockReturnValue({ eq: mockDeleteEq })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      // update → falla (invalidación del token)
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'RLS blocked', code: '42501' } }),
      }),
      delete: mockDelete,
    })
  })

  afterEach(() => vi.clearAllMocks())

  it('renderiza InviteErrorState cuando la invalidación del token falla', async () => {
    const jsx = await InvitePage({ params: makeParams('valid-token') })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('invite-error-state')).toBeInTheDocument()
  })

  it('llama a delete para revertir la membresía tras fallo de invalidación', async () => {
    await InvitePage({ params: makeParams('valid-token') })
    expect(mockDelete).toHaveBeenCalledTimes(1)
  })

  it('muestra mensaje de error al procesar', async () => {
    const jsx = await InvitePage({ params: makeParams('valid-token') })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('invite-error-state')).toHaveTextContent(
      'Error al procesar el link. Por favor, inténtalo de nuevo.'
    )
  })

  // Test A — rollback con orden de operaciones
  it('llama a insert (membresía) ANTES de delete (rollback) cuando la invalidación falla', async () => {
    const callOrder: string[] = []
    const insertSpy = vi.fn().mockImplementation(() => {
      callOrder.push('insert')
      return Promise.resolve({ error: null })
    })
    const mockDeleteEq2Ordered = vi.fn().mockImplementation(() => {
      callOrder.push('delete')
      return Promise.resolve({ error: null })
    })
    const mockDeleteEqOrdered = vi.fn(() => ({ eq: mockDeleteEq2Ordered }))
    const mockDeleteOrdered = vi.fn(() => ({ eq: mockDeleteEqOrdered }))

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
      insert: insertSpy,
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'RLS blocked', code: '42501' } }),
      }),
      delete: mockDeleteOrdered,
    })

    await InvitePage({ params: makeParams('valid-token') })

    expect(callOrder).toEqual(['insert', 'delete'])
    expect(callOrder.indexOf('insert')).toBeLessThan(callOrder.indexOf('delete'))
  })

  // Test B — rollback fallido (delete de membresía también falla)
  it('llama a console.error sin exponer el token cuando el rollback también falla', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const mockDeleteEq2Failing = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
    const mockDeleteEqFailing = vi.fn(() => ({ eq: mockDeleteEq2Failing }))
    const mockDeleteFailing = vi.fn(() => ({ eq: mockDeleteEqFailing }))

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'RLS blocked', code: '42501' } }),
      }),
      delete: mockDeleteFailing,
    })

    const jsx = await InvitePage({ params: makeParams('secret-token-xyz') })

    // console.error debe haber sido llamado
    expect(consoleSpy).toHaveBeenCalled()

    // El payload logueado no debe contener el token
    const loggedArgs = consoleSpy.mock.calls[0]
    const loggedPayload = JSON.stringify(loggedArgs)
    expect(loggedPayload).not.toContain('secret-token-xyz')

    // El usuario ve el mensaje de error de la UI (no estado corrupto)
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('invite-error-state')).toHaveTextContent(
      'Error al procesar el link. Por favor, inténtalo de nuevo.'
    )

    consoleSpy.mockRestore()
  })
})

// ---------------------------------------------------------------------------
// Suite 7: insert de membresía falla → InviteErrorState
// ---------------------------------------------------------------------------

describe('InviteTokenPage — insert de membresía falla', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-001' } } })
    mockRpc.mockReturnValue({
      maybeSingle: vi.fn().mockResolvedValue({ data: validInvitation, error: null }),
    })
    mockFrom.mockReturnValue({
      // community_members check → no es miembro
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
      // insert → falla con FK violation
      insert: vi.fn().mockResolvedValue({ error: { message: 'FK violation' } }),
      update: vi.fn(),
      delete: vi.fn(),
    })
  })

  afterEach(() => vi.clearAllMocks())

  it('renderiza el estado de error cuando el insert de membresía falla', async () => {
    const jsx = await InvitePage({ params: makeParams('valid-token') })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('invite-error-state')).toBeInTheDocument()
  })
})
