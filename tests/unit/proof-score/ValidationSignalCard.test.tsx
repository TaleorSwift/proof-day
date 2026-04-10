// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { ValidationSignalCard } from '@/components/proof-score/ValidationSignalCard'
import type { ProofScoreResult } from '@/lib/types/proof-score'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const SCORE_PROMISING: ProofScoreResult = {
  label: 'Promising',
  average: 78,
  feedbackCount: 12,
}

const SCORE_NEEDS_ITERATION: ProofScoreResult = {
  label: 'Needs iteration',
  average: 45,
  feedbackCount: 7,
}

const SCORE_WEAK: ProofScoreResult = {
  label: 'Weak',
  average: 22,
  feedbackCount: 3,
}

// ---------------------------------------------------------------------------
// Suite: SignalIndicator level derivation (AC #2, #3)
// ---------------------------------------------------------------------------

describe('ValidationSignalCard — SignalIndicator', () => {
  it('renderiza SignalIndicator con label "Promising" cuando score.label es Promising', () => {
    render(<ValidationSignalCard score={SCORE_PROMISING} />)
    expect(screen.getByText('Promising')).toBeInTheDocument()
  })

  it('renderiza SignalIndicator con label "Needs iteration" cuando score.label es Needs iteration', () => {
    render(<ValidationSignalCard score={SCORE_NEEDS_ITERATION} />)
    expect(screen.getByText('Needs iteration')).toBeInTheDocument()
  })

  it('renderiza SignalIndicator con label "Weak" cuando score.label es Weak', () => {
    render(<ValidationSignalCard score={SCORE_WEAK} />)
    expect(screen.getByText('Weak')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: ProgressBar (AC #4)
// ---------------------------------------------------------------------------

describe('ValidationSignalCard — ProgressBar', () => {
  it('renderiza una ProgressBar con aria-label "Puntuación media"', () => {
    render(<ValidationSignalCard score={SCORE_PROMISING} />)
    expect(screen.getByRole('progressbar', { name: 'Puntuación media' })).toBeInTheDocument()
  })

  it('la ProgressBar tiene aria-valuenow igual al average del score (Promising)', () => {
    render(<ValidationSignalCard score={SCORE_PROMISING} />)
    const bar = screen.getByRole('progressbar', { name: 'Puntuación media' })
    expect(bar).toHaveAttribute('aria-valuenow', String(SCORE_PROMISING.average))
  })

  it('la ProgressBar tiene aria-valuenow igual al average del score (Needs iteration)', () => {
    render(<ValidationSignalCard score={SCORE_NEEDS_ITERATION} />)
    const bar = screen.getByRole('progressbar', { name: 'Puntuación media' })
    expect(bar).toHaveAttribute('aria-valuenow', String(SCORE_NEEDS_ITERATION.average))
  })

  it('la ProgressBar tiene aria-valuenow igual al average del score (Weak)', () => {
    render(<ValidationSignalCard score={SCORE_WEAK} />)
    const bar = screen.getByRole('progressbar', { name: 'Puntuación media' })
    expect(bar).toHaveAttribute('aria-valuenow', String(SCORE_WEAK.average))
  })
})

// ---------------------------------------------------------------------------
// Suite: Disclaimer (AC #5)
// ---------------------------------------------------------------------------

describe('ValidationSignalCard — disclaimer', () => {
  it('renderiza disclaimer con feedbackCount interpolado para Promising', () => {
    render(<ValidationSignalCard score={SCORE_PROMISING} />)
    expect(screen.getByText('Basado en 12 respuestas')).toBeInTheDocument()
  })

  it('renderiza disclaimer con feedbackCount interpolado para Needs iteration', () => {
    render(<ValidationSignalCard score={SCORE_NEEDS_ITERATION} />)
    expect(screen.getByText('Basado en 7 respuestas')).toBeInTheDocument()
  })

  it('renderiza disclaimer con feedbackCount interpolado para Weak', () => {
    render(<ValidationSignalCard score={SCORE_WEAK} />)
    expect(screen.getByText('Basado en 3 respuestas')).toBeInTheDocument()
  })
})
