// @vitest-environment jsdom
/**
 * Unit tests — LoginForm (Story 9.2)
 * Verifica el layout sin card: logo, textos, texto legal y estado sent.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}))

const { sendMagicLinkMock } = vi.hoisted(() => ({
  sendMagicLinkMock: vi.fn(),
}))

vi.mock('@/app/(auth)/login/actions', () => ({
  sendMagicLink: sendMagicLinkMock,
}))

// ── Import componente ─────────────────────────────────────────────────────────

import { LoginForm } from '@/components/auth/LoginForm'

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('LoginForm — Story 9.2: layout sin card', () => {
  beforeEach(() => {
    sendMagicLinkMock.mockReset()
  })

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

// ── Nuevos tests de comportamiento ────────────────────────────────────────────

describe('LoginForm — submit y estados de interacción', () => {
  beforeEach(() => {
    sendMagicLinkMock.mockReset()
  })

  it('submit con email válido llama a sendMagicLink y muestra estado sent', async () => {
    sendMagicLinkMock.mockResolvedValue({ success: true })
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText('Tu email de trabajo'), 'test@empresa.com')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    await waitFor(() => {
      expect(sendMagicLinkMock).toHaveBeenCalledTimes(1)
      expect(screen.getByText(/Revisa tu email/)).toBeInTheDocument()
    })
  })

  it('submit con email vacío muestra error de validación inline', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    await waitFor(() => {
      expect(screen.getByText('Introduce un email válido')).toBeInTheDocument()
    })
    expect(sendMagicLinkMock).not.toHaveBeenCalled()
  })

  it('server error muestra role="alert" con el mensaje de error', async () => {
    sendMagicLinkMock.mockResolvedValue({ error: 'No pudimos enviar el email. Inténtalo de nuevo.' })
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText('Tu email de trabajo'), 'test@empresa.com')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/No pudimos enviar el email/)).toBeInTheDocument()
    })
  })

  it('estado sent muestra CTA "Solicitar nuevo link" al usar initialSent — no disponible (estado sent no tiene CTA)', () => {
    // El estado sent solo muestra logo + mensaje; el CTA de nuevo link
    // aparece únicamente cuando errorParam === 'link-invalid' en el estado default.
    render(<LoginForm initialSent />)
    expect(screen.queryByRole('button', { name: /nuevo link/i })).toBeNull()
  })
})
