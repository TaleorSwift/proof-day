// @vitest-environment jsdom
/**
 * Unit tests — LandingPage / WelcomeScreen (Story 9.4)
 * Verifica logo, textos, CTA y ausencia de elementos de marketing.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

// ── Import componente ─────────────────────────────────────────────────────────

import { WelcomeScreen } from '@/components/landing/WelcomeScreen'

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('WelcomeScreen — Story 9.4: landing welcome screen', () => {
  it('renderiza el logo con alt "Proof Day"', () => {
    render(<WelcomeScreen />)
    expect(screen.getByAltText('Proof Day')).toBeInTheDocument()
  })

  it('muestra el H1 "Bienvenido a Proof Day"', () => {
    render(<WelcomeScreen />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Bienvenido a Proof Day' })
    ).toBeInTheDocument()
  })

  it('muestra el subtítulo motivador', () => {
    render(<WelcomeScreen />)
    expect(
      screen.getByText(/Valida ideas\. Aprende más rápido/)
    ).toBeInTheDocument()
  })

  it('renderiza el link "Continuar con email" apuntando a /login', () => {
    render(<WelcomeScreen />)
    const link = screen.getByRole('link', { name: 'Continuar con email' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/login')
  })

  it('muestra el texto legal', () => {
    render(<WelcomeScreen />)
    expect(
      screen.getByText(/Al continuar, aceptas compartir feedback constructivo/)
    ).toBeInTheDocument()
  })

  it('no contiene texto de marketing "Cómo funciona"', () => {
    render(<WelcomeScreen />)
    expect(screen.queryByText(/Cómo funciona/)).toBeNull()
  })

  it('no contiene texto de marketing "Por qué Proof Day"', () => {
    render(<WelcomeScreen />)
    expect(screen.queryByText(/Por qué Proof Day/)).toBeNull()
  })
})
