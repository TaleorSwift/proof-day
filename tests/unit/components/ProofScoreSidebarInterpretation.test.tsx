// @vitest-environment jsdom
// Story 13.8 — Tests del componente ProofScoreSidebar — interpretación contextual
// TDD Outside-In: tests escritos ANTES de la implementación
//
// Comportamientos cubiertos:
//   - Muestra score-interpretation cuando score disponible e interpretación cargó
//   - Muestra score-interpretation-loading mientras carga la interpretación
//   - NO muestra score-interpretation cuando score es null (waiting state)
//   - La interpretación es opcional: si la API falla, el componente no rompe

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mock global fetch — se configura por test
// ---------------------------------------------------------------------------

const mockFetch = vi.fn()
global.fetch = mockFetch

// ---------------------------------------------------------------------------
// Import del componente — DESPUÉS del mock de fetch
// ---------------------------------------------------------------------------

import { ProofScoreSidebar } from '@/components/proof-score/ProofScoreSidebar'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PROJECT_ID = 'project-uuid-001'

const PROOF_SCORE_PROMISING = {
  label: 'Promising' as const,
  average: 4.2,
  feedbackCount: 8,
}

const PROOF_SCORE_NEEDS_ITERATION = {
  label: 'Needs iteration' as const,
  average: 2.1,
  feedbackCount: 5,
}

const PROOF_SCORE_WEAK = {
  label: 'Weak' as const,
  average: 1.2,
  feedbackCount: 3,
}

const INTERPRETATION_TEXT =
  'Tu proyecto está mostrando señales prometedoras. Continúa recopilando feedback para fortalecer la validación.'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetchSequence(responses: Array<{ ok: boolean; data?: unknown; error?: string }>) {
  let callIndex = 0
  mockFetch.mockImplementation(() => {
    const response = responses[callIndex] ?? responses[responses.length - 1]
    callIndex++
    return Promise.resolve({
      ok: response.ok,
      json: async () =>
        response.ok
          ? response.data
          : { error: response.error ?? 'UNKNOWN_ERROR' },
    })
  })
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('ProofScoreSidebar — interpretación contextual (Story 13.8)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ── Score disponible → muestra interpretación ────────────────────────────

  it('muestra score-interpretation cuando el score está disponible y la interpretación cargó', async () => {
    // Primera llamada: proof-score API
    // Segunda llamada: score-interpretation API
    mockFetchSequence([
      { ok: true, data: { data: PROOF_SCORE_PROMISING } },
      { ok: true, data: { interpretation: INTERPRETATION_TEXT } },
    ])

    render(
      <ProofScoreSidebar
        projectId={PROJECT_ID}
        isBuilder={true}
        feedbackCount={8}
        initialDecision={null}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('score-interpretation')).toBeInTheDocument()
    })

    expect(screen.getByTestId('score-interpretation')).toHaveTextContent(INTERPRETATION_TEXT)
  })

  it('muestra el texto de interpretación correcto para score Promising', async () => {
    const promisingText = 'Tu proyecto está resonando muy bien con tu audiencia.'
    mockFetchSequence([
      { ok: true, data: { data: PROOF_SCORE_PROMISING } },
      { ok: true, data: { interpretation: promisingText } },
    ])

    render(
      <ProofScoreSidebar
        projectId={PROJECT_ID}
        isBuilder={true}
        feedbackCount={8}
        initialDecision={null}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('score-interpretation')).toHaveTextContent(promisingText)
    })
  })

  it('muestra interpretación para score Needs Iteration', async () => {
    const needsText = 'Hay señales mixtas — considera iterar sobre el problema o la solución.'
    mockFetchSequence([
      { ok: true, data: { data: PROOF_SCORE_NEEDS_ITERATION } },
      { ok: true, data: { interpretation: needsText } },
    ])

    render(
      <ProofScoreSidebar
        projectId={PROJECT_ID}
        isBuilder={true}
        feedbackCount={5}
        initialDecision={null}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('score-interpretation')).toHaveTextContent(needsText)
    })
  })

  it('muestra interpretación para score Weak', async () => {
    const weakText = 'La propuesta actual no está conectando. Replantea el problema o la solución.'
    mockFetchSequence([
      { ok: true, data: { data: PROOF_SCORE_WEAK } },
      { ok: true, data: { interpretation: weakText } },
    ])

    render(
      <ProofScoreSidebar
        projectId={PROJECT_ID}
        isBuilder={true}
        feedbackCount={3}
        initialDecision={null}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('score-interpretation')).toHaveTextContent(weakText)
    })
  })

  // ── Estado de carga ──────────────────────────────────────────────────────

  it('muestra score-interpretation-loading mientras la interpretación está cargando', async () => {
    let resolveInterpretation: (value: unknown) => void

    // Primera llamada: proof-score — resuelve inmediatamente
    // Segunda llamada: interpretación — se queda pendiente
    let callCount = 0
    mockFetch.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: PROOF_SCORE_PROMISING }),
        })
      }
      return new Promise((resolve) => {
        resolveInterpretation = resolve
      })
    })

    render(
      <ProofScoreSidebar
        projectId={PROJECT_ID}
        isBuilder={true}
        feedbackCount={8}
        initialDecision={null}
      />
    )

    // Esperar a que el score cargue y se lance la petición de interpretación
    await waitFor(() => {
      expect(screen.getByTestId('score-interpretation-loading')).toBeInTheDocument()
    })

    // Resolver la interpretación para limpiar el estado
    resolveInterpretation!({
      ok: true,
      json: async () => ({ interpretation: INTERPRETATION_TEXT }),
    })

    await waitFor(() => {
      expect(screen.queryByTestId('score-interpretation-loading')).not.toBeInTheDocument()
    })
  })

  // ── Score null → no muestra interpretación ───────────────────────────────

  it('NO muestra score-interpretation cuando el score es null (waiting state)', async () => {
    // El proof-score endpoint retorna null (< 3 feedbacks)
    mockFetchSequence([
      { ok: true, data: { data: null } },
    ])

    render(
      <ProofScoreSidebar
        projectId={PROJECT_ID}
        isBuilder={true}
        feedbackCount={2}
        initialDecision={null}
      />
    )

    await waitFor(() => {
      // El componente renderiza ProofScoreWaiting, no la sidebar con score
      expect(screen.queryByTestId('score-interpretation')).not.toBeInTheDocument()
    })
  })

  // ── Resiliencia: si la interpretación falla el componente no rompe ────────

  it('no muestra score-interpretation si la API de interpretación retorna error', async () => {
    mockFetchSequence([
      { ok: true, data: { data: PROOF_SCORE_PROMISING } },
      { ok: false, error: 'AI_UNAVAILABLE' },
    ])

    render(
      <ProofScoreSidebar
        projectId={PROJECT_ID}
        isBuilder={true}
        feedbackCount={8}
        initialDecision={null}
      />
    )

    // El score se muestra (ValidationSignalCard) pero la interpretación no
    await waitFor(() => {
      expect(screen.getByTestId('proof-score-sidebar')).toBeInTheDocument()
    })

    // La interpretación no debe aparecer si la API falló
    expect(screen.queryByTestId('score-interpretation')).not.toBeInTheDocument()
  })

  it('no rompe el componente cuando la llamada a la interpretación lanza excepción de red', async () => {
    let callCount = 0
    mockFetch.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: PROOF_SCORE_PROMISING }),
        })
      }
      return Promise.reject(new Error('Network error'))
    })

    render(
      <ProofScoreSidebar
        projectId={PROJECT_ID}
        isBuilder={true}
        feedbackCount={8}
        initialDecision={null}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('proof-score-sidebar')).toBeInTheDocument()
    })

    // El componente sigue funcionando, la interpretación simplemente no aparece
    expect(screen.queryByTestId('score-interpretation')).not.toBeInTheDocument()
  })

  // ── No es builder → no renderiza nada ────────────────────────────────────

  it('no renderiza nada cuando isBuilder es false', () => {
    render(
      <ProofScoreSidebar
        projectId={PROJECT_ID}
        isBuilder={false}
        feedbackCount={8}
        initialDecision={null}
      />
    )

    expect(screen.queryByTestId('proof-score-sidebar')).not.toBeInTheDocument()
    expect(screen.queryByTestId('score-interpretation')).not.toBeInTheDocument()
  })
})
