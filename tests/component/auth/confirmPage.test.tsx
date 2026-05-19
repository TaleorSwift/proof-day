// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// ── Mocks hoisted ─────────────────────────────────────────────────────────────

const { redirectMock } = vi.hoisted(() => ({
  redirectMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    redirectMock(url)
    throw new Error('NEXT_REDIRECT')
  },
}))

// AC1: la página NO llama a verifyOtp en el GET — el OTP solo se consume en el
// onClick del ConfirmButton (Client Component), nunca en la carga de la página.
const verifyOtpMock = vi.fn()
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: { verifyOtp: verifyOtpMock },
  })),
}))

// data-* attributes exponen los props solo en el DOM de tests para assertions —
// el ConfirmButton real no renderiza ningún atributo con el token.
vi.mock('@/components/auth/ConfirmButton', () => ({
  ConfirmButton: ({ token, type, redirectTo }: { token: string; type?: string; redirectTo?: string }) => (
    <button
      data-testid="confirm-button-stub"
      data-token={token}
      data-type={type}
      data-redirect-to={redirectTo}
    >
      Acceder a Proof Day
    </button>
  ),
}))

vi.mock('@/components/shared/BrandHeader', () => ({
  BrandHeader: ({ subtitle }: { subtitle?: string }) => (
    <div data-testid="brand-header-stub">{subtitle}</div>
  ),
}))

import ConfirmPage from '@/app/auth/confirm/page'

// ── Parámetros inválidos → redirect ───────────────────────────────────────────

describe('ConfirmPage — parámetros inválidos', () => {
  afterEach(() => vi.clearAllMocks())

  it('redirige a /login?error=link-invalid cuando no hay parámetros', async () => {
    const searchParams = Promise.resolve({})
    await expect(ConfirmPage({ searchParams })).rejects.toThrow('NEXT_REDIRECT')
    expect(redirectMock).toHaveBeenCalledWith('/login?error=link-invalid')
  })

  it('redirige a /login?error=link-invalid cuando falta token', async () => {
    const searchParams = Promise.resolve({ type: 'magiclink' })
    await expect(ConfirmPage({ searchParams })).rejects.toThrow('NEXT_REDIRECT')
    expect(redirectMock).toHaveBeenCalledWith('/login?error=link-invalid')
  })

  it('redirige a /login?error=link-invalid cuando falta type', async () => {
    const searchParams = Promise.resolve({ token: 'abc123' })
    await expect(ConfirmPage({ searchParams })).rejects.toThrow('NEXT_REDIRECT')
    expect(redirectMock).toHaveBeenCalledWith('/login?error=link-invalid')
  })

  it('redirige a /login?error=link-invalid cuando type es inválido', async () => {
    const searchParams = Promise.resolve({ token: 'abc123', type: 'notavalidtype' })
    await expect(ConfirmPage({ searchParams })).rejects.toThrow('NEXT_REDIRECT')
    expect(redirectMock).toHaveBeenCalledWith('/login?error=link-invalid')
  })

  it('redirige a /login?error=link-invalid cuando token es solo espacios en blanco', async () => {
    const searchParams = Promise.resolve({ token: '   ', type: 'magiclink' })
    await expect(ConfirmPage({ searchParams })).rejects.toThrow('NEXT_REDIRECT')
    expect(redirectMock).toHaveBeenCalledWith('/login?error=link-invalid')
  })
})

// ── Parámetros válidos → renderiza ConfirmButton ──────────────────────────────

describe('ConfirmPage — parámetros válidos', () => {
  afterEach(() => vi.clearAllMocks())

  it('no llama a redirect cuando los params son válidos', async () => {
    const searchParams = Promise.resolve({ token: 'abc123', type: 'magiclink' })
    await ConfirmPage({ searchParams })
    expect(redirectMock).not.toHaveBeenCalled()
  })

  // AC1 — segunda parte: la página NO llama a verifyOtp en el GET.
  // El OTP solo se consume cuando el usuario pulsa el botón (onClick de ConfirmButton).
  it('AC1: no llama a verifyOtp al cargar la página (GET)', async () => {
    const searchParams = Promise.resolve({ token: 'abc123', type: 'magiclink' })
    await ConfirmPage({ searchParams })
    expect(verifyOtpMock).not.toHaveBeenCalled()
  })

  it('renderiza el ConfirmButton con el token y type correctos', async () => {
    const searchParams = Promise.resolve({ token: 'abc123', type: 'magiclink' })
    const jsx = await ConfirmPage({ searchParams })
    render(jsx as React.ReactElement)
    const btn = screen.getByTestId('confirm-button-stub')
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('data-token', 'abc123')
    expect(btn).toHaveAttribute('data-type', 'magiclink')
  })

  it('pasa redirectTo=/communities por defecto cuando redirect_to no se especifica', async () => {
    const searchParams = Promise.resolve({ token: 'abc123', type: 'magiclink' })
    const jsx = await ConfirmPage({ searchParams })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('confirm-button-stub')).toHaveAttribute('data-redirect-to', '/communities')
  })

  it('pasa redirectTo cuando se especifica una ruta interna válida', async () => {
    const searchParams = Promise.resolve({ token: 'abc123', type: 'magiclink', redirect_to: '/my-path' })
    const jsx = await ConfirmPage({ searchParams })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('confirm-button-stub')).toHaveAttribute('data-redirect-to', '/my-path')
  })

  it('normaliza redirect_to externo a /communities (open redirect bloqueado)', async () => {
    const searchParams = Promise.resolve({ token: 'abc123', type: 'magiclink', redirect_to: 'https://evil.com' })
    const jsx = await ConfirmPage({ searchParams })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('confirm-button-stub')).toHaveAttribute('data-redirect-to', '/communities')
    expect(redirectMock).not.toHaveBeenCalled()
  })

  it('normaliza redirect_to protocol-relative a /communities (open redirect bloqueado)', async () => {
    const searchParams = Promise.resolve({ token: 'abc123', type: 'magiclink', redirect_to: '//evil.com' })
    const jsx = await ConfirmPage({ searchParams })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('confirm-button-stub')).toHaveAttribute('data-redirect-to', '/communities')
    expect(redirectMock).not.toHaveBeenCalled()
  })
})
