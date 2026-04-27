// @vitest-environment jsdom
/**
 * Tests — HomePage Server Component (app/page.tsx)
 * Verifica el redirect condicional según haya o no sesión activa
 * y el render de WelcomeScreen para visitantes anónimos.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks hoisted
// ---------------------------------------------------------------------------

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

vi.mock('@/components/landing/WelcomeScreen', () => ({
  WelcomeScreen: () => <div data-testid="welcome-screen-stub" />,
}))

import HomePage from '@/app/page'

// ---------------------------------------------------------------------------
// Con sesión activa → redirect a /communities
// ---------------------------------------------------------------------------

describe('HomePage — con sesión activa', () => {
  beforeEach(() => {
    getUserMock.mockResolvedValue({
      data: { user: { id: 'user-test-123' } },
      error: null,
    })
    // En Next.js, `redirect()` lanza una excepción interna para detener el
    // render del Server Component. Replicamos ese comportamiento para que
    // HomePage no continúe ejecutándose tras el redirect.
    redirectMock.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('llama a redirect("/communities") cuando hay usuario', async () => {
    await expect(HomePage()).rejects.toThrow('NEXT_REDIRECT')
    expect(redirectMock).toHaveBeenCalledWith('/communities')
  })

  it('llama a redirect exactamente una vez', async () => {
    await expect(HomePage()).rejects.toThrow('NEXT_REDIRECT')
    expect(redirectMock).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// Sin sesión activa → render WelcomeScreen
// ---------------------------------------------------------------------------

describe('HomePage — sin sesión activa', () => {
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
    await HomePage()
    expect(redirectMock).not.toHaveBeenCalled()
  })

  it('renderiza WelcomeScreen', async () => {
    const jsx = await HomePage()
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('welcome-screen-stub')).toBeInTheDocument()
  })
})
