// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Radix Dialog usa ResizeObserver y portals que JSDOM no soporta.
// Mockeamos solo el wrapper de estructura para que el contenido se renderice
// directamente sin portal, manteniendo la lógica real del componente.
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div data-testid="mock-dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
}))

vi.mock('@/lib/api/feedback', () => ({
  submitFeedback: vi.fn(),
}))

import React from 'react'
import { FeedbackDialog } from '@/components/feedback/FeedbackDialog'
import { submitFeedback } from '@/lib/api/feedback'

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const DEFAULT_PROPS = {
  projectId: 'proj-uuid',
  communityId: 'comm-uuid',
  isOpen: true,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
}

const MOCK_FEEDBACK_RESPONSE = {
  id: 'fb-1',
  projectId: 'proj-uuid',
  reviewerId: 'user-1',
  communityId: 'comm-uuid',
  scores: { p1: 3 as const, p2: 3 as const, p3: 2 as const },
  textResponses: { p4: 'Texto de mejora' },
  createdAt: '2026-04-11T00:00:00Z',
  // Story 11.1 — feedback quality
  customAnswer: null,
  qualityScore: null,
}

// ---------------------------------------------------------------------------
// Helper — completa el formulario con datos válidos
// ---------------------------------------------------------------------------

function completarFormularioValido() {
  // Los ToggleGroupItem de Radix tienen role="radio"
  // P1 → Sí
  fireEvent.click(screen.getAllByRole('radio', { name: 'Sí' })[0])
  // P2 → Sí
  fireEvent.click(screen.getAllByRole('radio', { name: 'Sí' })[1])
  // P3 → Sí
  fireEvent.click(screen.getAllByRole('radio', { name: 'Sí' })[2])
  // P4 → texto obligatorio ≥10 chars
  fireEvent.change(
    screen.getByRole('textbox', { name: 'Respuesta de texto para pregunta 4' }),
    { target: { value: 'Mejoraría la documentación del proceso de onboarding' } }
  )
}

// ---------------------------------------------------------------------------
// Suite: FeedbackDialog — visibilidad
// ---------------------------------------------------------------------------

describe('FeedbackDialog — visibilidad', () => {
  it('renderiza el título "Dar feedback" cuando isOpen es true', () => {
    render(<FeedbackDialog {...DEFAULT_PROPS} />)
    expect(screen.getByText('Dar feedback')).toBeInTheDocument()
  })

  it('no renderiza el contenido cuando isOpen es false', () => {
    render(<FeedbackDialog {...DEFAULT_PROPS} isOpen={false} />)
    expect(screen.queryByText('Dar feedback')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: FeedbackDialog — estructura de preguntas
// ---------------------------------------------------------------------------

describe('FeedbackDialog — estructura de preguntas', () => {
  beforeEach(() => {
    vi.mocked(submitFeedback).mockReset()
  })

  it('muestra las cuatro preguntas del formulario', () => {
    render(<FeedbackDialog {...DEFAULT_PROPS} />)
    expect(screen.getByText(/¿Entiendes claramente el problema planteado\?/)).toBeInTheDocument()
    expect(screen.getByText(/¿Usarías esta solución si estuviera disponible\?/)).toBeInTheDocument()
    expect(screen.getByText(/¿Te parece viable técnicamente la solución propuesta\?/)).toBeInTheDocument()
    expect(screen.getByText(/¿Qué mejorarías de esta propuesta\?/)).toBeInTheDocument()
  })

  it('renderiza el botón "Enviar feedback"', () => {
    render(<FeedbackDialog {...DEFAULT_PROPS} />)
    expect(screen.getByRole('button', { name: 'Enviar feedback' })).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: FeedbackDialog — validación del botón submit
// ---------------------------------------------------------------------------

describe('FeedbackDialog — validación del botón submit', () => {
  beforeEach(() => {
    vi.mocked(submitFeedback).mockReset()
  })

  it('el botón submit está deshabilitado en estado inicial', () => {
    render(<FeedbackDialog {...DEFAULT_PROPS} />)
    expect(screen.getByRole('button', { name: 'Enviar feedback' })).toBeDisabled()
  })

  it('el submit permanece deshabilitado si solo se seleccionan scores sin texto p4', () => {
    render(<FeedbackDialog {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getAllByRole('radio', { name: 'Sí' })[0])
    fireEvent.click(screen.getAllByRole('radio', { name: 'Sí' })[1])
    fireEvent.click(screen.getAllByRole('radio', { name: 'Sí' })[2])
    expect(screen.getByRole('button', { name: 'Enviar feedback' })).toBeDisabled()
  })

  it('el submit permanece deshabilitado si p4 tiene menos de 10 caracteres', () => {
    render(<FeedbackDialog {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getAllByRole('radio', { name: 'Sí' })[0])
    fireEvent.click(screen.getAllByRole('radio', { name: 'Sí' })[1])
    fireEvent.click(screen.getAllByRole('radio', { name: 'Sí' })[2])
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Respuesta de texto para pregunta 4' }),
      { target: { value: 'corto' } }
    )
    expect(screen.getByRole('button', { name: 'Enviar feedback' })).toBeDisabled()
  })

  it('el submit se habilita con los tres scores y p4 con ≥10 caracteres', () => {
    render(<FeedbackDialog {...DEFAULT_PROPS} />)
    completarFormularioValido()
    expect(screen.getByRole('button', { name: 'Enviar feedback' })).not.toBeDisabled()
  })
})

// ---------------------------------------------------------------------------
// Suite: FeedbackDialog — envío exitoso
// ---------------------------------------------------------------------------

describe('FeedbackDialog — envío exitoso', () => {
  beforeEach(() => {
    vi.mocked(submitFeedback).mockReset()
    vi.mocked(submitFeedback).mockResolvedValue(MOCK_FEEDBACK_RESPONSE)
  })

  it('llama a submitFeedback con los datos correctos', async () => {
    const onClose = vi.fn()
    const onSuccess = vi.fn()
    render(
      <FeedbackDialog
        {...DEFAULT_PROPS}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    )
    completarFormularioValido()
    fireEvent.click(screen.getByRole('button', { name: 'Enviar feedback' }))

    await waitFor(() => {
      expect(vi.mocked(submitFeedback)).toHaveBeenCalledWith({
        projectId: 'proj-uuid',
        communityId: 'comm-uuid',
        scores: { p1: 3, p2: 3, p3: 3 },
        textResponses: {
          p1: undefined,
          p2: undefined,
          p3: undefined,
          p4: 'Mejoraría la documentación del proceso de onboarding',
        },
      })
    })
  })

  it('invoca onClose tras un envío exitoso', async () => {
    const onClose = vi.fn()
    render(<FeedbackDialog {...DEFAULT_PROPS} onClose={onClose} />)
    completarFormularioValido()
    fireEvent.click(screen.getByRole('button', { name: 'Enviar feedback' }))

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('invoca onSuccess tras un envío exitoso', async () => {
    const onSuccess = vi.fn()
    render(<FeedbackDialog {...DEFAULT_PROPS} onSuccess={onSuccess} />)
    completarFormularioValido()
    fireEvent.click(screen.getByRole('button', { name: 'Enviar feedback' }))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1)
    })
  })
})

// ---------------------------------------------------------------------------
// Suite: FeedbackDialog — estado de carga
// ---------------------------------------------------------------------------

describe('FeedbackDialog — estado de carga', () => {
  it('muestra "Enviando..." y deshabilita el botón durante la carga', async () => {
    vi.mocked(submitFeedback).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(MOCK_FEEDBACK_RESPONSE), 500)
        )
    )
    render(<FeedbackDialog {...DEFAULT_PROPS} />)
    completarFormularioValido()
    fireEvent.click(screen.getByRole('button', { name: 'Enviar feedback' }))

    expect(screen.getByRole('button', { name: 'Enviando...' })).toBeDisabled()
  })
})

// ---------------------------------------------------------------------------
// Suite: FeedbackDialog — manejo de errores
// ---------------------------------------------------------------------------

describe('FeedbackDialog — manejo de errores', () => {
  beforeEach(() => {
    vi.mocked(submitFeedback).mockReset()
  })

  it('muestra el mensaje de error cuando submitFeedback falla', async () => {
    vi.mocked(submitFeedback).mockRejectedValueOnce(
      new Error('Ya diste feedback a este proyecto')
    )
    render(<FeedbackDialog {...DEFAULT_PROPS} />)
    completarFormularioValido()
    fireEvent.click(screen.getByRole('button', { name: 'Enviar feedback' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Ya diste feedback a este proyecto'
      )
    })
  })

  it('muestra un error genérico cuando el error no es instancia de Error', async () => {
    vi.mocked(submitFeedback).mockRejectedValueOnce('error desconocido')
    render(<FeedbackDialog {...DEFAULT_PROPS} />)
    completarFormularioValido()
    fireEvent.click(screen.getByRole('button', { name: 'Enviar feedback' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error al enviar feedback')
    })
  })

  it('no muestra alerta de error en estado inicial', () => {
    render(<FeedbackDialog {...DEFAULT_PROPS} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
