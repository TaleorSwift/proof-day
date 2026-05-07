// @vitest-environment jsdom
/**
 * Tests TDD Outside-In — FeedbackFormInline — campo custom_answer (Story 11.2)
 * T2.1–T2.5: campo condicional customAnswer según customQuestion prop
 * AC-5, AC-6, AC-7, AC-8
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

vi.mock('@/lib/api/feedback', () => ({
  submitFeedback: vi.fn(),
}))

import { FeedbackFormInline } from '@/components/feedback/FeedbackFormInline'
import { submitFeedback } from '@/lib/api/feedback'

// ── Constantes ────────────────────────────────────────────────────────────────

const DEFAULT_PROPS = {
  projectId: 'proj-uuid',
  communityId: 'comm-uuid',
}

const MOCK_FEEDBACK = {
  id: 'fb-1',
  projectId: 'proj-uuid',
  reviewerId: 'user-1',
  communityId: 'comm-uuid',
  scores: { p1: 3 as const, p2: 3 as const, p3: 2 as const },
  textResponses: { p4: 'Texto' },
  createdAt: '2026-04-11T00:00:00Z',
  customAnswer: null,
  qualityScore: null,
  // Story 13.1 — iteraciones
  iterationId: null,
}

// ── T2.1: sin customQuestion → campo NO existe en DOM ─────────────────────────

describe('FeedbackFormInline — T2.1: sin customQuestion → campo NO visible', () => {
  it('NO renderiza el campo feedback-custom-answer cuando customQuestion es undefined', () => {
    render(<FeedbackFormInline {...DEFAULT_PROPS} />)
    expect(screen.queryByTestId('feedback-custom-answer')).not.toBeInTheDocument()
  })
})

// ── T2.2: con customQuestion → bloque visible con label e itálica ─────────────

describe('FeedbackFormInline — T2.2: con customQuestion → bloque visible', () => {
  it('renderiza el campo feedback-custom-answer cuando customQuestion tiene texto', () => {
    render(
      <FeedbackFormInline
        {...DEFAULT_PROPS}
        customQuestion="¿Qué mejorarías?"
      />,
    )
    expect(screen.getByTestId('feedback-custom-answer')).toBeInTheDocument()
  })

  it('muestra el label "Pregunta del Builder:"', () => {
    render(
      <FeedbackFormInline
        {...DEFAULT_PROPS}
        customQuestion="¿Qué mejorarías?"
      />,
    )
    expect(screen.getByText('Pregunta del Builder:')).toBeInTheDocument()
  })

  it('muestra el texto de la pregunta en itálica', () => {
    render(
      <FeedbackFormInline
        {...DEFAULT_PROPS}
        customQuestion="¿Qué mejorarías?"
      />,
    )
    expect(screen.getByTestId('feedback-custom-question-text')).toHaveTextContent('¿Qué mejorarías?')
  })

  it('el textarea de respuesta tiene el placeholder "Tu respuesta..."', () => {
    render(
      <FeedbackFormInline
        {...DEFAULT_PROPS}
        customQuestion="¿Qué mejorarías?"
      />,
    )
    expect(screen.getByTestId('feedback-custom-answer')).toHaveAttribute(
      'placeholder',
      'Tu respuesta...',
    )
  })
})

// ── T2.3: con customQuestion="" → campo NO existe en DOM ─────────────────────

describe('FeedbackFormInline — T2.3: con customQuestion="" → campo NO visible', () => {
  it('NO renderiza el campo feedback-custom-answer cuando customQuestion es string vacío', () => {
    render(<FeedbackFormInline {...DEFAULT_PROPS} customQuestion="" />)
    expect(screen.queryByTestId('feedback-custom-answer')).not.toBeInTheDocument()
  })
})

// ── T2.4: al rellenar custom_answer y enviar → submitFeedback recibe customAnswer ──

describe('FeedbackFormInline — T2.4: customAnswer se pasa a submitFeedback', () => {
  beforeEach(() => {
    vi.mocked(submitFeedback).mockReset()
    vi.mocked(submitFeedback).mockResolvedValue(MOCK_FEEDBACK)
  })

  it('submitFeedback recibe customAnswer cuando el campo está relleno', async () => {
    render(
      <FeedbackFormInline
        {...DEFAULT_PROPS}
        customQuestion="¿Lo usarías en producción?"
      />,
    )

    // Rellenar formulario obligatorio
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[0])
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[1])
    fireEvent.change(
      screen.getByPlaceholderText('Mínimo 10 caracteres...'),
      { target: { value: 'Mejora propuesta detallada aquí' } },
    )

    // Rellenar custom answer
    fireEvent.change(
      screen.getByTestId('feedback-custom-answer'),
      { target: { value: 'Mi respuesta personalizada al Builder' } },
    )

    fireEvent.click(screen.getByTestId('feedback-form-inline-submit'))

    await waitFor(() => {
      expect(vi.mocked(submitFeedback)).toHaveBeenCalledWith(
        expect.objectContaining({
          customAnswer: 'Mi respuesta personalizada al Builder',
        }),
      )
    })
  })
})

// ── T2.5: sin rellenar custom_answer → submitFeedback recibe customAnswer null ──

describe('FeedbackFormInline — T2.5: customAnswer null cuando campo vacío', () => {
  beforeEach(() => {
    vi.mocked(submitFeedback).mockReset()
    vi.mocked(submitFeedback).mockResolvedValue(MOCK_FEEDBACK)
  })

  it('submitFeedback recibe customAnswer null cuando el campo no está relleno', async () => {
    render(
      <FeedbackFormInline
        {...DEFAULT_PROPS}
        customQuestion="¿Lo usarías en producción?"
      />,
    )

    // Rellenar formulario obligatorio sin rellenar custom answer
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[0])
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[1])
    fireEvent.change(
      screen.getByPlaceholderText('Mínimo 10 caracteres...'),
      { target: { value: 'Mejora propuesta detallada aquí' } },
    )

    fireEvent.click(screen.getByTestId('feedback-form-inline-submit'))

    await waitFor(() => {
      expect(vi.mocked(submitFeedback)).toHaveBeenCalledWith(
        expect.objectContaining({
          customAnswer: null,
        }),
      )
    })
  })

  it('el formulario se envía correctamente sin rellenar customAnswer (AC-8)', async () => {
    render(
      <FeedbackFormInline
        {...DEFAULT_PROPS}
        customQuestion="¿Lo usarías en producción?"
      />,
    )

    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[0])
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[1])
    fireEvent.change(
      screen.getByPlaceholderText('Mínimo 10 caracteres...'),
      { target: { value: 'Mejora propuesta detallada aquí' } },
    )

    // No rellenar custom answer — debería funcionar igualmente
    fireEvent.click(screen.getByTestId('feedback-form-inline-submit'))

    await waitFor(() => {
      expect(screen.getByTestId('feedback-form-inline-confirmation')).toBeInTheDocument()
    })
  })
})
