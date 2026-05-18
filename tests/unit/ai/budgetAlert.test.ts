// Story 12.7 — Budget alert (TDD Outside-In)
// Tests para maybeSendBudgetAlert en lib/ai/budgetChecker.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks de Supabase (service role)
// ---------------------------------------------------------------------------

const mockMaybeSingle = vi.fn()
const mockInsert = vi.fn()
const mockSelectAdmins = vi.fn()

// La query de deduplicación en notifications es:
//   .from('notifications').select('id').eq('type', ...).gte('created_at', ...).maybeSingle()
// La query de admins en community_members es:
//   .from('community_members').select('user_id').eq('community_id', ...).eq('role', ...) → mockSelectAdmins
const mockFrom = vi.fn((table: string) => {
  if (table === 'notifications') {
    return {
      select: () => ({
        eq: () => ({
          gte: () => ({
            maybeSingle: mockMaybeSingle,
          }),
        }),
      }),
      insert: mockInsert,
    }
  }
  if (table === 'community_members') {
    return {
      select: () => ({
        eq: () => ({
          eq: mockSelectAdmins,
        }),
      }),
    }
  }
  return {}
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}))

// ---------------------------------------------------------------------------
// Setup de env
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key')
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('maybeSendBudgetAlert', () => {
  it('NO inserta notificación si currentCostUsd < 80% del límite', async () => {
    const { maybeSendBudgetAlert } = await import('@/lib/ai/budgetChecker')

    await maybeSendBudgetAlert('community-001', 3.9, 5.0) // 78% — bajo el umbral

    expect(mockMaybeSingle).not.toHaveBeenCalled()
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('inserta notificación para todos los admins si currentCostUsd >= 80% del límite', async () => {
    // No existe alerta previa hoy
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })
    // Dos admins en la comunidad
    mockSelectAdmins.mockResolvedValueOnce({
      data: [{ user_id: 'admin-1' }, { user_id: 'admin-2' }],
      error: null,
    })
    mockInsert.mockResolvedValueOnce({ data: null, error: null })

    const { maybeSendBudgetAlert } = await import('@/lib/ai/budgetChecker')

    await maybeSendBudgetAlert('community-001', 4.1, 5.0) // 82% — sobre el umbral

    expect(mockInsert).toHaveBeenCalledOnce()
    const insertArg = mockInsert.mock.calls[0][0] as Array<Record<string, unknown>>
    expect(insertArg).toHaveLength(2)
    expect(insertArg[0].user_id).toBe('admin-1')
    expect(insertArg[0].type).toBe('budget_alert')
    expect(insertArg[0].read).toBe(false)
    expect(insertArg[1].user_id).toBe('admin-2')
  })

  it('NO duplica alerta si ya existe una de hoy', async () => {
    // Ya existe una alerta hoy
    mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'existing-alert' }, error: null })

    const { maybeSendBudgetAlert } = await import('@/lib/ai/budgetChecker')

    await maybeSendBudgetAlert('community-001', 4.5, 5.0) // 90%

    expect(mockSelectAdmins).not.toHaveBeenCalled()
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('NO inserta ni lanza error si no hay admins en la comunidad', async () => {
    // No existe alerta previa hoy
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })
    // Sin admins
    mockSelectAdmins.mockResolvedValueOnce({ data: [], error: null })

    const { maybeSendBudgetAlert } = await import('@/lib/ai/budgetChecker')

    await expect(
      maybeSendBudgetAlert('community-sin-admins', 4.1, 5.0)
    ).resolves.toBeUndefined()

    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('NO inserta si admins es null', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })
    mockSelectAdmins.mockResolvedValueOnce({ data: null, error: null })

    const { maybeSendBudgetAlert } = await import('@/lib/ai/budgetChecker')

    await expect(
      maybeSendBudgetAlert('community-null-admins', 5.0, 5.0) // 100%
    ).resolves.toBeUndefined()

    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('el payload incluye communityId, currentCostUsd, limitUsd y percentUsed', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })
    mockSelectAdmins.mockResolvedValueOnce({
      data: [{ user_id: 'admin-1' }],
      error: null,
    })
    mockInsert.mockResolvedValueOnce({ data: null, error: null })

    const { maybeSendBudgetAlert } = await import('@/lib/ai/budgetChecker')

    await maybeSendBudgetAlert('community-001', 4.0, 5.0) // 80% — exactamente en el umbral

    const insertArg = mockInsert.mock.calls[0][0] as Array<Record<string, unknown>>
    const payload = insertArg[0].payload as Record<string, unknown>
    expect(payload.communityId).toBe('community-001')
    expect(payload.currentCostUsd).toBe(4.0)
    expect(payload.limitUsd).toBe(5.0)
    expect(payload.percentUsed).toBe(0.8)
  })
})
