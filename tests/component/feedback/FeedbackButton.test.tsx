// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// FeedbackDialog depende de useRouter y submitFeedback — se mockea completamente
vi.mock('@/components/feedback/FeedbackDialog', () => ({
  FeedbackDialog: ({
    isOpen,
    onClose,
    onSuccess,
  }: {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
  }) =>
    isOpen ? (
      <div data-testid="feedback-dialog">
        <button data-testid="dialog-close" onClick={onClose}>
          Cerrar
        </button>
        <button data-testid="dialog-success" onClick={onSuccess}>
          Éxito
        </button>
      </div>
    ) : null,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

import { FeedbackButton } from '@/components/feedback/FeedbackButton'

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const DEFAULT_PROPS = {
  projectId: 'proj-123',
  communityId: 'comm-abc',
}

// ---------------------------------------------------------------------------
// Suite: FeedbackButton — estado inicial
// ---------------------------------------------------------------------------

describe('FeedbackButton — estado inicial', () => {
  it('renderiza el botón "Dar feedback"', () => {
    render(<FeedbackButton {...DEFAULT_PROPS} />)
    expect(screen.getByRole('button', { name: /Dar feedback/i })).toBeInTheDocument()
  })

  it('no muestra el contador de feedbacks cuando count es 0', () => {
    render(<FeedbackButton {...DEFAULT_PROPS} />)
    expect(screen.queryByText(/\(\+\d+\)/)).not.toBeInTheDocument()
  })

  it('no renderiza el dialog en estado inicial', () => {
    render(<FeedbackButton {...DEFAULT_PROPS} />)
    expect(screen.queryByTestId('feedback-dialog')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: FeedbackButton — apertura del dialog
// ---------------------------------------------------------------------------

describe('FeedbackButton — apertura del dialog', () => {
  it('abre el dialog al hacer click en el botón', () => {
    render(<FeedbackButton {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: /Dar feedback/i }))
    expect(screen.getByTestId('feedback-dialog')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: FeedbackButton — cierre del dialog
// ---------------------------------------------------------------------------

describe('FeedbackButton — cierre del dialog', () => {
  it('cierra el dialog al invocar onClose', () => {
    render(<FeedbackButton {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: /Dar feedback/i }))
    fireEvent.click(screen.getByTestId('dialog-close'))
    expect(screen.queryByTestId('feedback-dialog')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: FeedbackButton — contador tras éxito
// ---------------------------------------------------------------------------

describe('FeedbackButton — contador tras éxito', () => {
  it('muestra "+1" en el botón tras un envío exitoso', () => {
    render(<FeedbackButton {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: /Dar feedback/i }))
    fireEvent.click(screen.getByTestId('dialog-success'))
    expect(screen.getByText('(+1)')).toBeInTheDocument()
  })

  it('incrementa el contador en cada envío exitoso adicional', () => {
    render(<FeedbackButton {...DEFAULT_PROPS} />)

    // Primer envío
    fireEvent.click(screen.getByRole('button', { name: /Dar feedback/i }))
    fireEvent.click(screen.getByTestId('dialog-success'))

    // Segundo envío
    fireEvent.click(screen.getByRole('button', { name: /Dar feedback/i }))
    fireEvent.click(screen.getByTestId('dialog-success'))

    expect(screen.getByText('(+2)')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: FeedbackButton — callback onSuccess externo
// ---------------------------------------------------------------------------

describe('FeedbackButton — callback onSuccess externo', () => {
  it('invoca el callback onSuccess cuando el dialog reporta éxito', () => {
    const onSuccess = vi.fn()
    render(<FeedbackButton {...DEFAULT_PROPS} onSuccess={onSuccess} />)
    fireEvent.click(screen.getByRole('button', { name: /Dar feedback/i }))
    fireEvent.click(screen.getByTestId('dialog-success'))
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('no lanza error cuando onSuccess no se pasa', () => {
    render(<FeedbackButton {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: /Dar feedback/i }))
    expect(() => fireEvent.click(screen.getByTestId('dialog-success'))).not.toThrow()
  })
})
