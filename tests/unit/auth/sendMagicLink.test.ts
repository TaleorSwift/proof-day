/**
 * Unit tests — sendMagicLink server action
 * Verifica validación de email, llamada a Supabase y manejo de errores.
 */
import { vi, describe, it, expect, beforeEach } from 'vitest'

// ── Mocks hoisted ─────────────────────────────────────────────────────────────

const { signInWithOtpMock, createClientMock } = vi.hoisted(() => {
  const signInWithOtpMock = vi.fn()
  const createClientMock = vi.fn(() =>
    Promise.resolve({
      auth: { signInWithOtp: signInWithOtpMock },
    })
  )
  return { signInWithOtpMock, createClientMock }
})

vi.mock('@/lib/supabase/server', () => ({ createClient: createClientMock }))

// ── Import action ─────────────────────────────────────────────────────────────

import { sendMagicLink } from '@/app/(auth)/login/actions'

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('sendMagicLink', () => {
  beforeEach(() => {
    signInWithOtpMock.mockReset()
    createClientMock.mockClear()
  })

  it('email válido con Supabase ok devuelve { success: true }', async () => {
    signInWithOtpMock.mockResolvedValue({ error: null })
    const formData = new FormData()
    formData.set('email', 'test@empresa.com')

    const result = await sendMagicLink(formData)

    expect(result).toEqual({ success: true })
    expect(signInWithOtpMock).toHaveBeenCalledTimes(1)
    expect(signInWithOtpMock).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@empresa.com' })
    )
  })

  it('email inválido devuelve { error } y NO llama a Supabase', async () => {
    const formData = new FormData()
    formData.set('email', 'no-es-un-email')

    const result = await sendMagicLink(formData)

    expect(result).toMatchObject({ error: expect.any(String) })
    expect(signInWithOtpMock).not.toHaveBeenCalled()
  })

  it('Supabase devuelve error → devuelve { error } con mensaje genérico', async () => {
    signInWithOtpMock.mockResolvedValue({
      error: { message: 'rate limit exceeded', status: 429 },
    })
    const formData = new FormData()
    formData.set('email', 'test@empresa.com')

    const result = await sendMagicLink(formData)

    expect(result).toMatchObject({ error: expect.any(String) })
    expect(result).not.toMatchObject({ success: true })
  })
})
