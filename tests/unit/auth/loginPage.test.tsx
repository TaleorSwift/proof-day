// @vitest-environment jsdom
/**
 * Unit tests — LoginPage Server Component (app/(auth)/login/page.tsx)
 * Verifica el redirect condicional según haya o no sesión activa
 * y el render de LoginForm para visitantes anónimos.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// ── Mocks hoisted ─────────────────────────────────────────────────────────────

const { redirectMock, getUserMock } = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  getUserMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: getUserMock },
  }),
}))

vi.mock('@/components/auth/LoginForm', () => ({
  LoginForm: ({ errorParam }: { errorParam?: string }) => (
    <div data-testid="login-form-stub" data-error-param={errorParam} />
  ),
}))

import LoginPage from '@/app/(auth)/login/page'

// ── Con sesión activa → redirect a /communities ────────────────────────────────

describe('LoginPage — con sesión activa', () => {
  beforeEach(() => {
    getUserMock.mockResolvedValue({
      data: { user: { id: 'user-test-123' } },
      error: null,
    })
    redirectMock.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('llama a redirect("/communities") cuando hay usuario', async () => {
    const searchParams = Promise.resolve({})
    await expect(LoginPage({ searchParams })).rejects.toThrow('NEXT_REDIRECT')
    expect(redirectMock).toHaveBeenCalledWith('/communities')
  })
})

// ── Sin sesión activa → render LoginForm ──────────────────────────────────────

describe('LoginPage — sin sesión activa', () => {
  beforeEach(() => {
    getUserMock.mockResolvedValue({
      data: { user: null },
      error: null,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('NO llama a redirect cuando no hay usuario', async () => {
    const searchParams = Promise.resolve({})
    await LoginPage({ searchParams })
    expect(redirectMock).not.toHaveBeenCalled()
  })

  it('renderiza el stub de LoginForm', async () => {
    const searchParams = Promise.resolve({})
    const jsx = await LoginPage({ searchParams })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('login-form-stub')).toBeInTheDocument()
  })

  it('pasa errorParam cuando searchParams.error es "link-invalid"', async () => {
    const searchParams = Promise.resolve({ error: 'link-invalid' })
    const jsx = await LoginPage({ searchParams })
    render(jsx as React.ReactElement)
    const stub = screen.getByTestId('login-form-stub')
    expect(stub).toHaveAttribute('data-error-param', 'link-invalid')
  })
})
