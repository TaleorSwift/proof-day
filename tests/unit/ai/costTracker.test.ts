import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Tests — costTracker (TDD Outside-In)
// Story 12.2 — AC5
// ---------------------------------------------------------------------------

// Mock del módulo de Supabase para service role
const mockFrom = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}))

describe('trackCost', () => {
  const CURRENT_MONTH = new Date().toISOString().slice(0, 7) // YYYY-MM

  const TRACK_COST_INPUT = {
    communityId: 'community-uuid-001',
    tokensInput: 220,
    tokensOutput: 180,
    costUsd: 0.0,
  }

  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key-test')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('hace UPDATE cuando la fila del mes actual existe', async () => {
    const existingRow = {
      id: 'cost-uuid-001',
      month: CURRENT_MONTH,
      tokens_input: 100,
      tokens_output: 80,
      estimated_cost_usd: '0.000000',
      synthesis_count: 1,
      updated_at: '2026-05-01T10:00:00Z',
    }

    const updateEqMock = vi.fn().mockResolvedValue({ error: null })
    const updateMock = vi.fn().mockReturnValue({ eq: updateEqMock })

    const selectChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: existingRow, error: null }),
    }

    mockFrom.mockImplementation((table: string) => {
      if (table === 'ai_cost_tracking') {
        return {
          select: () => selectChain,
          update: updateMock,
        }
      }
      return {}
    })

    const { trackCost } = await import('@/lib/ai/costTracker')
    await trackCost(TRACK_COST_INPUT)

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tokens_input: existingRow.tokens_input + TRACK_COST_INPUT.tokensInput,
        tokens_output: existingRow.tokens_output + TRACK_COST_INPUT.tokensOutput,
        synthesis_count: existingRow.synthesis_count + 1,
      })
    )
    expect(updateEqMock).toHaveBeenCalledWith('month', CURRENT_MONTH)
  })

  it('hace INSERT cuando la fila del mes actual NO existe', async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null })

    const selectChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
    }

    mockFrom.mockImplementation((table: string) => {
      if (table === 'ai_cost_tracking') {
        return {
          select: () => selectChain,
          insert: insertMock,
        }
      }
      return {}
    })

    const { trackCost } = await import('@/lib/ai/costTracker')
    await trackCost(TRACK_COST_INPUT)

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        month: CURRENT_MONTH,
        tokens_input: TRACK_COST_INPUT.tokensInput,
        tokens_output: TRACK_COST_INPUT.tokensOutput,
        estimated_cost_usd: 0.0,
        synthesis_count: 1,
      })
    )
  })

  it('total_cost_usd es siempre 0.0 en el INSERT para Ollama', async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null })

    const selectChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
    }

    mockFrom.mockImplementation((table: string) => {
      if (table === 'ai_cost_tracking') {
        return {
          select: () => selectChain,
          insert: insertMock,
        }
      }
      return {}
    })

    const { trackCost } = await import('@/lib/ai/costTracker')
    await trackCost({ ...TRACK_COST_INPUT, costUsd: 9.99 }) // ignorar costUsd externo

    const insertArg = insertMock.mock.calls[0][0]
    expect(insertArg.estimated_cost_usd).toBe(0.0)
  })

  it('actualiza updated_at en el UPDATE', async () => {
    const existingRow = {
      id: 'cost-uuid-001',
      month: CURRENT_MONTH,
      tokens_input: 50,
      tokens_output: 40,
      estimated_cost_usd: '0.000000',
      synthesis_count: 0,
      updated_at: '2026-05-01T10:00:00Z',
    }

    const updateEqMock = vi.fn().mockResolvedValue({ error: null })
    const updateMock = vi.fn().mockReturnValue({ eq: updateEqMock })

    const selectChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: existingRow, error: null }),
    }

    mockFrom.mockImplementation((table: string) => {
      if (table === 'ai_cost_tracking') {
        return {
          select: () => selectChain,
          update: updateMock,
        }
      }
      return {}
    })

    const { trackCost } = await import('@/lib/ai/costTracker')
    await trackCost(TRACK_COST_INPUT)

    const updateArg = updateMock.mock.calls[0][0]
    expect(updateArg).toHaveProperty('updated_at')
  })
})
