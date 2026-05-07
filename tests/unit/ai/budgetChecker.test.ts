import { describe, it, expect, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Tests — budgetChecker (TDD Outside-In)
// Story 12.2 — AC4
// ---------------------------------------------------------------------------

describe('checkDailyBudget', () => {
  it('retorna true para cualquier communityId (Ollama local = sin coste)', async () => {
    const { checkDailyBudget } = await import('@/lib/ai/budgetChecker')
    const result = await checkDailyBudget('community-uuid-001')

    expect(result).toBe(true)
  })

  it('retorna true con comunidad vacía', async () => {
    const { checkDailyBudget } = await import('@/lib/ai/budgetChecker')
    const result = await checkDailyBudget('')

    expect(result).toBe(true)
  })

  it('retorna true independientemente del valor de AI_DAILY_BUDGET_USD', async () => {
    vi.stubEnv('AI_DAILY_BUDGET_USD', '0.0')

    const { checkDailyBudget } = await import('@/lib/ai/budgetChecker')
    const result = await checkDailyBudget('community-uuid-999')

    vi.unstubAllEnvs()
    expect(result).toBe(true)
  })
})
