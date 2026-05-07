// Story 12.6 — Tests del singleton getResendClient
// TDD Outside-In: tests escritos ANTES de la implementación

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const { MockResend } = vi.hoisted(() => {
  const MockResend = vi.fn().mockImplementation(() => ({ emails: { send: vi.fn() } }))
  return { MockResend }
})

vi.mock('resend', () => ({ Resend: MockResend }))

// ---------------------------------------------------------------------------
// Import DESPUÉS del mock
// ---------------------------------------------------------------------------

// Importamos el módulo tras el mock para garantizar que el singleton usa el mock
import { getResendClient } from '@/lib/email/resendClient'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('getResendClient — singleton', () => {
  beforeEach(() => {
    // Resetear el módulo singleton entre tests para poder probar la construcción
    vi.resetModules()
    MockResend.mockClear()
    vi.stubEnv('RESEND_API_KEY', 'test-resend-api-key')
  })

  it('retorna una instancia de Resend', async () => {
    const { getResendClient: getFresh } = await import('@/lib/email/resendClient')
    const client = getFresh()
    expect(client).toBeDefined()
    expect(client).not.toBeNull()
  })

  it('llama a Resend con RESEND_API_KEY del entorno', async () => {
    vi.stubEnv('RESEND_API_KEY', 'my-unique-api-key')
    const { getResendClient: getFresh } = await import('@/lib/email/resendClient')
    getFresh()
    expect(MockResend).toHaveBeenCalledWith('my-unique-api-key')
  })

  it('devuelve la misma instancia en llamadas sucesivas (singleton)', async () => {
    const { getResendClient: getFresh } = await import('@/lib/email/resendClient')
    const first = getFresh()
    const second = getFresh()
    expect(first).toBe(second)
  })

  it('instancia Resend solo una vez aunque se llame múltiples veces', async () => {
    const { getResendClient: getFresh } = await import('@/lib/email/resendClient')
    getFresh()
    getFresh()
    getFresh()
    // El constructor solo debe llamarse una vez por módulo cargado
    expect(MockResend).toHaveBeenCalledTimes(1)
  })
})
