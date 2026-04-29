import { describe, it, expect, vi, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Mocks — deben declararse antes de los imports que los usan
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
    auth: {
      exchangeCodeForSession: vi.fn(),
      verifyOtp: vi.fn(),
    },
  }
  return { supabaseMock }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(supabaseMock),
}))

// ---------------------------------------------------------------------------
// Import tras mocks
// ---------------------------------------------------------------------------

import { GET } from '@/app/auth/confirm/route'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost/auth/confirm')
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
  return new NextRequest(url.toString())
}

// ---------------------------------------------------------------------------
// Suite: flujo PKCE con code
// ---------------------------------------------------------------------------

describe('GET /auth/confirm — flujo PKCE (code)', () => {
  afterEach(() => vi.clearAllMocks())

  it('redirige a /communities tras intercambio exitoso de código', async () => {
    supabaseMock.auth.exchangeCodeForSession.mockResolvedValue({ error: null })

    await expect(GET(buildRequest({ code: 'valid-code' }))).rejects.toThrow(
      'REDIRECT:/communities'
    )
    expect(redirectMock).toHaveBeenCalledWith('/communities')
  })

  it('redirige a la ruta next cuando se especifica en el query', async () => {
    supabaseMock.auth.exchangeCodeForSession.mockResolvedValue({ error: null })

    await expect(
      GET(buildRequest({ code: 'valid-code', next: '/dashboard' }))
    ).rejects.toThrow('REDIRECT:/dashboard')
    expect(redirectMock).toHaveBeenCalledWith('/dashboard')
  })

  it('redirige a confirmation_failed cuando el intercambio falla', async () => {
    supabaseMock.auth.exchangeCodeForSession.mockResolvedValue({
      error: new Error('invalid code'),
    })

    await expect(GET(buildRequest({ code: 'bad-code' }))).rejects.toThrow(
      'REDIRECT:/auth/error?error=confirmation_failed'
    )
    expect(redirectMock).toHaveBeenCalledWith('/auth/error?error=confirmation_failed')
  })

  it('no permite rutas absolutas en next (open redirect)', async () => {
    supabaseMock.auth.exchangeCodeForSession.mockResolvedValue({ error: null })

    await expect(
      GET(buildRequest({ code: 'valid-code', next: 'https://evil.com/steal' }))
    ).rejects.toThrow('REDIRECT:/communities')
    expect(redirectMock).toHaveBeenCalledWith('/communities')
  })

  it('no permite protocol-relative URLs en next', async () => {
    supabaseMock.auth.exchangeCodeForSession.mockResolvedValue({ error: null })

    await expect(
      GET(buildRequest({ code: 'valid-code', next: '//evil.com' }))
    ).rejects.toThrow('REDIRECT:/communities')
    expect(redirectMock).toHaveBeenCalledWith('/communities')
  })
})

// ---------------------------------------------------------------------------
// Suite: flujo con token_hash
// ---------------------------------------------------------------------------

describe('GET /auth/confirm — flujo token_hash', () => {
  afterEach(() => vi.clearAllMocks())

  it('redirige a /communities tras verificación exitosa de OTP', async () => {
    supabaseMock.auth.verifyOtp.mockResolvedValue({ error: null })

    await expect(
      GET(buildRequest({ token_hash: 'valid-hash', type: 'email' }))
    ).rejects.toThrow('REDIRECT:/communities')
    expect(redirectMock).toHaveBeenCalledWith('/communities')
  })

  it('redirige a redirect_to cuando la verificación es exitosa', async () => {
    supabaseMock.auth.verifyOtp.mockResolvedValue({ error: null })

    await expect(
      GET(buildRequest({ token_hash: 'hash', type: 'signup', redirect_to: '/onboarding' }))
    ).rejects.toThrow('REDIRECT:/onboarding')
    expect(redirectMock).toHaveBeenCalledWith('/onboarding')
  })

  it('redirige a confirmation_failed cuando verifyOtp falla', async () => {
    supabaseMock.auth.verifyOtp.mockResolvedValue({
      error: new Error('invalid token'),
    })

    await expect(
      GET(buildRequest({ token_hash: 'bad-hash', type: 'email' }))
    ).rejects.toThrow('REDIRECT:/auth/error?error=confirmation_failed')
    expect(redirectMock).toHaveBeenCalledWith('/auth/error?error=confirmation_failed')
  })

  it('acepta el parámetro token como alias de token_hash', async () => {
    supabaseMock.auth.verifyOtp.mockResolvedValue({ error: null })

    await expect(
      GET(buildRequest({ token: 'valid-token', type: 'magiclink' }))
    ).rejects.toThrow('REDIRECT:/communities')
    expect(redirectMock).toHaveBeenCalledWith('/communities')
  })

  it('omite la verificación cuando falta type aunque haya token_hash', async () => {
    // Sin type, el flujo de token_hash no se ejecuta → redirige a invalid_link
    await expect(
      GET(buildRequest({ token_hash: 'hash' }))
    ).rejects.toThrow('REDIRECT:/auth/error?error=invalid_link')
    expect(redirectMock).toHaveBeenCalledWith('/auth/error?error=invalid_link')
  })
})

// ---------------------------------------------------------------------------
// Suite: enlace inválido
// ---------------------------------------------------------------------------

describe('GET /auth/confirm — enlace inválido', () => {
  afterEach(() => vi.clearAllMocks())

  it('redirige a invalid_link cuando no hay code ni token_hash', async () => {
    await expect(GET(buildRequest({}))).rejects.toThrow(
      'REDIRECT:/auth/error?error=invalid_link'
    )
    expect(redirectMock).toHaveBeenCalledWith('/auth/error?error=invalid_link')
  })
})
