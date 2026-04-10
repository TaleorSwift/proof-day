// @vitest-environment jsdom
/**
 * Unit tests — LoginForm (Story 9.2)
 * Verifica el layout sin card: logo, textos, texto legal y estado sent.
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

vi.mock('@/app/(auth)/login/actions', () => ({
  sendMagicLink: vi.fn(),
}))

// ── Import componente ─────────────────────────────────────────────────────────

import { LoginForm } from '@/components/auth/LoginForm'

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('LoginForm — Story 9.2: layout sin card', () => {
  it('renderiza el logo con alt "Proof Day"', () => {
    render(<LoginForm />)
    expect(screen.getByAltText('Proof Day')).toBeInTheDocument()
  })

  it('muestra el H1 "Bienvenido a Proof Day"', () => {
    render(<LoginForm />)
    expect(screen.getByRole('heading', { level: 1, name: 'Bienvenido a Proof Day' })).toBeInTheDocument()
  })

  it('muestra el subtítulo motivador', () => {
    render(<LoginForm />)
    expect(screen.getByText(/Valida ideas\. Aprende más rápido/)).toBeInTheDocument()
  })

  it('no contiene ningún elemento con clase shadow-md (sin Card)', () => {
    const { container } = render(<LoginForm />)
    expect(container.querySelector('.shadow-md')).toBeNull()
  })

  it('muestra el texto legal debajo del botón', () => {
    render(<LoginForm />)
    expect(screen.getByText(/Al continuar, aceptas compartir feedback constructivo/)).toBeInTheDocument()
  })

  it('estado sent muestra logo + mensaje sin card', () => {
    const { container } = render(<LoginForm initialSent />)
    expect(screen.getByAltText('Proof Day')).toBeInTheDocument()
    expect(screen.getByText(/Revisa tu email/)).toBeInTheDocument()
    expect(container.querySelector('.shadow-md')).toBeNull()
    expect(screen.queryByRole('button', { name: /Continuar/ })).toBeNull()
  })
})
