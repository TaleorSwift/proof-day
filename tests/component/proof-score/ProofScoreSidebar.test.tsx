// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

import { ProofScoreSidebar } from '@/components/proof-score/ProofScoreSidebar'
import type { ProofScoreResult } from '@/lib/types/proof-score'

// ---------------------------------------------------------------------------
// Mocks de módulos
// ---------------------------------------------------------------------------

const mockGetProofScore = vi.fn()

vi.mock('@/lib/api/proof-score', () => ({
  getProofScore: (...args: unknown[]) => mockGetProofScore(...args),
}))

// Mocks de sub-componentes que tienen sus propias dependencias complejas
vi.mock('@/components/proof-score/ProofScoreWaiting', () => ({
  ProofScoreWaiting: ({ feedbackCount, isLoading }: { feedbackCount: number; isLoading?: boolean }) =>
    React.createElement(
      'div',
      { 'data-testid': 'proof-score-waiting', 'data-loading': isLoading ? 'true' : 'false' },
      isLoading ? 'Cargando...' : `Esperando ${feedbackCount} feedbacks`
    ),
}))

vi.mock('@/components/proof-score/ValidationSignalCard', () => ({
  ValidationSignalCard: ({
    understandPercent,
    wouldUsePercent,
    feedbackCount,
  }: {
    understandPercent: number
    wouldUsePercent: number
    feedbackCount: number
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'validation-signal-card' },
      `understand:${understandPercent} wouldUse:${wouldUsePercent} count:${feedbackCount}`
    ),
}))

vi.mock('@/components/projects/DecisionBadge', () => ({
  DecisionBadge: ({ decision }: { decision: string }) =>
    React.createElement('div', { 'data-testid': 'decision-badge' }, decision),
}))

vi.mock('@/components/projects/DecisionDialog', () => ({
  DecisionDialog: ({
    isOpen,
    onSuccess,
  }: {
    projectId: string
    isOpen: boolean
    onClose: () => void
    onSuccess: (d: string) => void
  }) =>
    isOpen
      ? React.createElement(
          'div',
          { 'data-testid': 'decision-dialog' },
          React.createElement(
            'button',
            { onClick: () => onSuccess('iterate') },
            'Confirmar decisión'
          )
        )
      : null,
}))

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const scorePromisingResult: ProofScoreResult = {
  label: 'Promising',
  average: 80,
  feedbackCount: 10,
}

const scoreNeedsIteration: ProofScoreResult = {
  label: 'Needs iteration',
  average: 55,
  feedbackCount: 6,
}

const scoreWeak: ProofScoreResult = {
  label: 'Weak',
  average: 25,
  feedbackCount: 4,
}

// ---------------------------------------------------------------------------
// Suite: cuando isBuilder es false
// ---------------------------------------------------------------------------

describe('ProofScoreSidebar — no es builder', () => {
  it('no renderiza nada cuando isBuilder es false', async () => {
    mockGetProofScore.mockResolvedValueOnce(scorePromisingResult)
    const { container } = render(
      <ProofScoreSidebar projectId="proj-1" isBuilder={false} feedbackCount={5} />
    )
    expect(container.firstChild).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Suite: estado de carga
// ---------------------------------------------------------------------------

describe('ProofScoreSidebar — estado de carga', () => {
  beforeEach(() => {
    mockGetProofScore.mockReset()
  })

  it('muestra ProofScoreWaiting con isLoading=true mientras carga', () => {
    mockGetProofScore.mockImplementation(() => new Promise(() => {})) // never resolves
    render(
      <ProofScoreSidebar projectId="proj-1" isBuilder={true} feedbackCount={3} />
    )
    const waiting = screen.getByTestId('proof-score-waiting')
    expect(waiting).toBeInTheDocument()
    expect(waiting).toHaveAttribute('data-loading', 'true')
  })
})

// ---------------------------------------------------------------------------
// Suite: score null (sin suficientes feedbacks)
// ---------------------------------------------------------------------------

describe('ProofScoreSidebar — score null', () => {
  beforeEach(() => {
    mockGetProofScore.mockReset()
  })

  it('muestra ProofScoreWaiting sin isLoading cuando score es null', async () => {
    mockGetProofScore.mockResolvedValueOnce(null)
    render(
      <ProofScoreSidebar projectId="proj-1" isBuilder={true} feedbackCount={2} />
    )
    await waitFor(() => {
      const waiting = screen.getByTestId('proof-score-waiting')
      expect(waiting).toHaveAttribute('data-loading', 'false')
    })
  })

  it('muestra ProofScoreWaiting cuando la API lanza error', async () => {
    mockGetProofScore.mockRejectedValueOnce(new Error('API error'))
    render(
      <ProofScoreSidebar projectId="proj-1" isBuilder={true} feedbackCount={1} />
    )
    await waitFor(() => {
      expect(screen.getByTestId('proof-score-waiting')).toBeInTheDocument()
    })
  })
})

// ---------------------------------------------------------------------------
// Suite: score disponible — Promising
// ---------------------------------------------------------------------------

describe('ProofScoreSidebar — score Promising', () => {
  beforeEach(() => {
    mockGetProofScore.mockReset()
  })

  it('renderiza el contenedor del sidebar con data-testid', async () => {
    mockGetProofScore.mockResolvedValueOnce(scorePromisingResult)
    render(
      <ProofScoreSidebar projectId="proj-1" isBuilder={true} feedbackCount={10} />
    )
    await waitFor(() => {
      expect(screen.getByTestId('proof-score-sidebar')).toBeInTheDocument()
    })
  })

  it('renderiza ValidationSignalCard con los porcentajes derivados del average', async () => {
    mockGetProofScore.mockResolvedValueOnce(scorePromisingResult)
    render(
      <ProofScoreSidebar projectId="proj-1" isBuilder={true} feedbackCount={10} />
    )
    await waitFor(() => {
      const card = screen.getByTestId('validation-signal-card')
      // average=80 → understandPercent=80, wouldUsePercent=80, count=10
      expect(card).toHaveTextContent('understand:80')
      expect(card).toHaveTextContent('wouldUse:80')
      expect(card).toHaveTextContent('count:10')
    })
  })

  it('muestra el botón "Registrar decision" cuando no hay decision inicial', async () => {
    mockGetProofScore.mockResolvedValueOnce(scorePromisingResult)
    render(
      <ProofScoreSidebar projectId="proj-1" isBuilder={true} feedbackCount={10} />
    )
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /registrar decision/i })).toBeInTheDocument()
    })
  })

  it('no muestra DecisionBadge cuando no hay decision inicial', async () => {
    mockGetProofScore.mockResolvedValueOnce(scorePromisingResult)
    render(
      <ProofScoreSidebar projectId="proj-1" isBuilder={true} feedbackCount={10} />
    )
    await waitFor(() => {
      expect(screen.queryByTestId('decision-badge')).not.toBeInTheDocument()
    })
  })
})

// ---------------------------------------------------------------------------
// Suite: score disponible — Needs iteration y Weak
// ---------------------------------------------------------------------------

describe('ProofScoreSidebar — score Needs iteration', () => {
  it('renderiza ValidationSignalCard con average de Needs iteration', async () => {
    mockGetProofScore.mockResolvedValueOnce(scoreNeedsIteration)
    render(
      <ProofScoreSidebar projectId="proj-1" isBuilder={true} feedbackCount={6} />
    )
    await waitFor(() => {
      expect(screen.getByTestId('validation-signal-card')).toHaveTextContent('understand:55')
    })
  })
})

describe('ProofScoreSidebar — score Weak', () => {
  it('renderiza ValidationSignalCard con average de Weak', async () => {
    mockGetProofScore.mockResolvedValueOnce(scoreWeak)
    render(
      <ProofScoreSidebar projectId="proj-1" isBuilder={true} feedbackCount={4} />
    )
    await waitFor(() => {
      expect(screen.getByTestId('validation-signal-card')).toHaveTextContent('understand:25')
    })
  })
})

// ---------------------------------------------------------------------------
// Suite: con decision inicial
// ---------------------------------------------------------------------------

describe('ProofScoreSidebar — con decision inicial', () => {
  beforeEach(() => {
    mockGetProofScore.mockReset()
  })

  it('muestra DecisionBadge cuando se pasa initialDecision', async () => {
    mockGetProofScore.mockResolvedValueOnce(scorePromisingResult)
    render(
      <ProofScoreSidebar
        projectId="proj-1"
        isBuilder={true}
        feedbackCount={10}
        initialDecision="iterate"
      />
    )
    await waitFor(() => {
      expect(screen.getByTestId('decision-badge')).toHaveTextContent('iterate')
    })
  })

  it('no muestra el botón "Registrar decision" cuando ya hay una decision', async () => {
    mockGetProofScore.mockResolvedValueOnce(scorePromisingResult)
    render(
      <ProofScoreSidebar
        projectId="proj-1"
        isBuilder={true}
        feedbackCount={10}
        initialDecision="scale"
      />
    )
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /registrar decision/i })).not.toBeInTheDocument()
    })
  })
})

// ---------------------------------------------------------------------------
// Suite: flujo del diálogo de decisión
// ---------------------------------------------------------------------------

describe('ProofScoreSidebar — diálogo de decisión', () => {
  beforeEach(() => {
    mockGetProofScore.mockReset()
  })

  it('abre el diálogo al pulsar "Registrar decision"', async () => {
    mockGetProofScore.mockResolvedValueOnce(scorePromisingResult)
    render(
      <ProofScoreSidebar projectId="proj-1" isBuilder={true} feedbackCount={10} />
    )
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /registrar decision/i }))
    })
    expect(screen.getByTestId('decision-dialog')).toBeInTheDocument()
  })

  it('muestra DecisionBadge tras confirmar la decisión en el diálogo', async () => {
    mockGetProofScore.mockResolvedValueOnce(scorePromisingResult)
    render(
      <ProofScoreSidebar projectId="proj-1" isBuilder={true} feedbackCount={10} />
    )
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /registrar decision/i }))
    })
    fireEvent.click(screen.getByRole('button', { name: /confirmar decisión/i }))
    await waitFor(() => {
      expect(screen.getByTestId('decision-badge')).toHaveTextContent('iterate')
    })
  })
})
