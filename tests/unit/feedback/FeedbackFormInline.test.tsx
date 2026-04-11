// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// vi.mock se hoist al top — la factory no puede referenciar variables definidas después.
// Usamos vi.fn() directamente dentro de la factory y accedemos luego via import mockeado.
vi.mock('@/lib/api/feedback', () => ({
  submitFeedback: vi.fn(),
}))

import { FeedbackFormInline } from '@/components/feedback/FeedbackFormInline'
import { submitFeedback } from '@/lib/api/feedback'

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const DEFAULT_PROPS = {
  projectId: 'proj-uuid',
  communityId: 'comm-uuid',
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('FeedbackFormInline — estado inicial', () => {
  beforeEach(() => {
    vi.mocked(submitFeedback).mockReset()
    vi.mocked(submitFeedback).mockResolvedValue({
      id: 'fb-1',
      projectId: 'proj-uuid',
      reviewerId: 'user-1',
      communityId: 'comm-uuid',
      scores: { p1: 3, p2: 3, p3: 2 },
      textResponses: { p4: 'Texto' },
      createdAt: '2026-04-11T00:00:00Z',
    })
  })

  it('renderiza la pregunta p1 "¿Entiendes el problema?"', () => {
    render(<FeedbackFormInline {...DEFAULT_PROPS} />)
    expect(screen.getByText('¿Entiendes el problema?')).toBeInTheDocument()
  })

  it('renderiza la pregunta p2 "¿Lo usarías?"', () => {
    render(<FeedbackFormInline {...DEFAULT_PROPS} />)
    expect(screen.getByText('¿Lo usarías?')).toBeInTheDocument()
  })

  it('renderiza el textarea de mejora', () => {
    render(<FeedbackFormInline {...DEFAULT_PROPS} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('el botón submit está deshabilitado en estado inicial', () => {
    render(<FeedbackFormInline {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('feedback-form-inline-submit')).toBeDisabled()
  })

  it('el botón submit muestra texto "Compartir insight"', () => {
    render(<FeedbackFormInline {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('feedback-form-inline-submit')).toHaveTextContent('Compartir insight')
  })
})

describe('FeedbackFormInline — validación de habilitación', () => {
  beforeEach(() => {
    vi.mocked(submitFeedback).mockReset()
    vi.mocked(submitFeedback).mockResolvedValue({
      id: 'fb-1',
      projectId: 'proj-uuid',
      reviewerId: 'user-1',
      communityId: 'comm-uuid',
      scores: { p1: 3, p2: 3, p3: 2 },
      textResponses: { p4: 'Texto' },
      createdAt: '2026-04-11T00:00:00Z',
    })
  })

  it('el submit permanece deshabilitado si solo se rellena p1', () => {
    render(<FeedbackFormInline {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[0])
    expect(screen.getByTestId('feedback-form-inline-submit')).toBeDisabled()
  })

  it('el submit permanece deshabilitado si textarea tiene menos de 10 chars', () => {
    render(<FeedbackFormInline {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[0])
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[1])
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'corto' } })
    expect(screen.getByTestId('feedback-form-inline-submit')).toBeDisabled()
  })

  it('el submit se habilita cuando p1, p2 están seleccionados y textarea tiene ≥10 chars', () => {
    render(<FeedbackFormInline {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[0])
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[1])
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Texto con más de 10 caracteres aquí' } })
    expect(screen.getByTestId('feedback-form-inline-submit')).not.toBeDisabled()
  })
})

describe('FeedbackFormInline — envío exitoso', () => {
  beforeEach(() => {
    vi.mocked(submitFeedback).mockReset()
    vi.mocked(submitFeedback).mockResolvedValue({
      id: 'fb-1',
      projectId: 'proj-uuid',
      reviewerId: 'user-1',
      communityId: 'comm-uuid',
      scores: { p1: 3, p2: 3, p3: 2 },
      textResponses: { p4: 'Texto' },
      createdAt: '2026-04-11T00:00:00Z',
    })
  })

  it('muestra confirmación tras envío exitoso', async () => {
    render(<FeedbackFormInline {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[0])
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[1])
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Texto de mejora suficientemente largo' } })
    fireEvent.click(screen.getByTestId('feedback-form-inline-submit'))
    await waitFor(() => {
      expect(screen.getByTestId('feedback-form-inline-confirmation')).toBeInTheDocument()
    })
  })

  it('llama a submitFeedback con los datos correctos (p1=Sí p2=No)', async () => {
    render(<FeedbackFormInline {...DEFAULT_PROPS} />)
    // p1: Sí (primer botón "Sí" — pertenece a la pregunta p1)
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[0])
    // p2: No — hay dos grupos de botones; el segundo "No" es el de p2
    // p1 tiene [Sí, Parcialmente, No] → No[0] es el de p1
    // p2 tiene [Sí, No] → No[1] es el de p2
    fireEvent.click(screen.getAllByRole('button', { name: 'No' })[1])
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Mejora propuesta detallada aquí' } })
    fireEvent.click(screen.getByTestId('feedback-form-inline-submit'))
    await waitFor(() => {
      expect(vi.mocked(submitFeedback)).toHaveBeenCalledWith({
        projectId: 'proj-uuid',
        communityId: 'comm-uuid',
        scores: { p1: 3, p2: 1, p3: 2 },
        textResponses: { p4: 'Mejora propuesta detallada aquí' },
      })
    })
  })
})

describe('FeedbackFormInline — estado de error', () => {
  beforeEach(() => {
    vi.mocked(submitFeedback).mockReset()
  })

  it('muestra mensaje de error cuando submitFeedback falla', async () => {
    vi.mocked(submitFeedback).mockRejectedValueOnce(new Error('Ya diste feedback a este proyecto'))
    render(<FeedbackFormInline {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[0])
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[1])
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Texto de mejora suficientemente largo' } })
    fireEvent.click(screen.getByTestId('feedback-form-inline-submit'))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Ya diste feedback a este proyecto')
    })
  })
})

describe('FeedbackFormInline — estado de carga', () => {
  it('deshabilita el submit mientras carga y muestra "Enviando..."', async () => {
    vi.mocked(submitFeedback).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        id: 'fb-1',
        projectId: 'proj-uuid',
        reviewerId: 'user-1',
        communityId: 'comm-uuid',
        scores: { p1: 3, p2: 3, p3: 2 },
        textResponses: { p4: 'Texto' },
        createdAt: '2026-04-11T00:00:00Z',
      }), 500))
    )
    render(<FeedbackFormInline {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[0])
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[1])
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Texto de mejora suficientemente largo' } })
    fireEvent.click(screen.getByTestId('feedback-form-inline-submit'))
    expect(screen.getByTestId('feedback-form-inline-submit')).toBeDisabled()
    expect(screen.getByTestId('feedback-form-inline-submit')).toHaveTextContent('Enviando...')
  })
})
