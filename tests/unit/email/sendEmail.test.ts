// Story 12.6 — Tests de sendEmail
// TDD Outside-In: tests escritos ANTES de la implementación
// Verifica parámetros, EMAIL_FROM env, y que delega a resend.emails.send

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — hoisted
// ---------------------------------------------------------------------------

const { mockEmailsSend, mockGetResendClient } = vi.hoisted(() => {
  const mockEmailsSend = vi.fn().mockResolvedValue({ data: { id: 'email-id-001' }, error: null })
  const mockGetResendClient = vi.fn().mockReturnValue({ emails: { send: mockEmailsSend } })
  return { mockEmailsSend, mockGetResendClient }
})

vi.mock('@/lib/email/resendClient', () => ({
  getResendClient: mockGetResendClient,
}))

// ---------------------------------------------------------------------------
// Import DESPUÉS del mock
// ---------------------------------------------------------------------------

import { sendEmail } from '@/lib/email/sendEmail'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const BASE_EMAIL = {
  to: 'user@example.com',
  subject: 'Tu síntesis de IA está lista para Mi Proyecto',
  html: '<html><body><p>Resumen</p></body></html>',
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('sendEmail', () => {
  beforeEach(() => {
    mockEmailsSend.mockClear()
    mockGetResendClient.mockClear()
    vi.unstubAllEnvs()
    vi.stubEnv('EMAIL_FROM', 'no-reply@proof-day.com')
  })

  it('llama a resend.emails.send con los parámetros correctos', async () => {
    await sendEmail(BASE_EMAIL)

    expect(mockEmailsSend).toHaveBeenCalledOnce()
    const [callArgs] = mockEmailsSend.mock.calls[0] as [
      { from: string; to: string; subject: string; html: string }
    ]
    expect(callArgs.to).toBe(BASE_EMAIL.to)
    expect(callArgs.subject).toBe(BASE_EMAIL.subject)
    expect(callArgs.html).toBe(BASE_EMAIL.html)
  })

  it('usa EMAIL_FROM del entorno como remitente', async () => {
    vi.stubEnv('EMAIL_FROM', 'custom@myapp.com')
    await sendEmail(BASE_EMAIL)

    const [callArgs] = mockEmailsSend.mock.calls[0] as [{ from: string }]
    expect(callArgs.from).toBe('custom@myapp.com')
  })

  it('usa el valor por defecto "no-reply@proof-day.com" si EMAIL_FROM no está definido', async () => {
    vi.unstubAllEnvs()
    // No se define EMAIL_FROM
    await sendEmail(BASE_EMAIL)

    const [callArgs] = mockEmailsSend.mock.calls[0] as [{ from: string }]
    expect(callArgs.from).toBe('no-reply@proof-day.com')
  })

  it('obtiene el cliente de Resend via getResendClient', async () => {
    await sendEmail(BASE_EMAIL)
    expect(mockGetResendClient).toHaveBeenCalledOnce()
  })

  it('retorna Promise<void> (no retorna datos)', async () => {
    const result = await sendEmail(BASE_EMAIL)
    expect(result).toBeUndefined()
  })

  it('propaga el error si resend.emails.send lanza', async () => {
    mockEmailsSend.mockRejectedValueOnce(new Error('Resend API error'))
    await expect(sendEmail(BASE_EMAIL)).rejects.toThrow('Resend API error')
  })
})
