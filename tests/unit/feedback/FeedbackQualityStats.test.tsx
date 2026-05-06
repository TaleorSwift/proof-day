// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { FeedbackQualityStats } from '@/components/feedback/FeedbackQualityStats'

// ---------------------------------------------------------------------------
// T4 — TDD Outside-In: FeedbackQualityStats (Story 11.3, AC-4..AC-7)
// ---------------------------------------------------------------------------

describe('FeedbackQualityStats', () => {
  // T4.2 — sin feedbacks → no renderiza nada (AC-7)
  it('no renderiza nada cuando no hay feedbacks', () => {
    const { container } = render(
      <FeedbackQualityStats feedbacks={[]} qualityThreshold={0.6} />
    )
    expect(container.firstChild).toBeNull()
    expect(screen.queryByTestId('feedback-quality-stats')).toBeNull()
  })

  // T4.3 — 3 feedbacks, 2 completos (score >= 0.6) → "2 feedbacks completos de 3 totales" (AC-4)
  it('muestra el conteo correcto: 2 feedbacks completos de 3 totales', () => {
    const feedbacks = [
      { qualityScore: 0.8 },   // completo (>= 0.6)
      { qualityScore: 0.6 },   // completo (>= 0.6, límite exacto)
      { qualityScore: 0.3 },   // incompleto (< 0.6)
    ]

    render(<FeedbackQualityStats feedbacks={feedbacks} qualityThreshold={0.6} />)

    expect(screen.getByTestId('feedback-quality-stats')).toBeInTheDocument()
    expect(screen.getByText('2 feedbacks completos de 3 totales')).toBeInTheDocument()
  })

  // T4.4 — 5 feedbacks, 3 completos (40% incompletos = ratio NO supera 0.4) → warning NO visible (AC-6)
  it('no muestra warning cuando el ratio de incompletos es exactamente 40%', () => {
    // 3 completos, 2 incompletos → incompleteRatio = 2/5 = 0.4 → NO supera 0.4
    const feedbacks = [
      { qualityScore: 0.9 },
      { qualityScore: 0.7 },
      { qualityScore: 0.6 },
      { qualityScore: 0.2 },
      { qualityScore: 0.1 },
    ]

    render(<FeedbackQualityStats feedbacks={feedbacks} qualityThreshold={0.6} />)

    expect(screen.queryByTestId('feedback-quality-warning')).toBeNull()
  })

  // T4.5 — 5 feedbacks, 2 completos (60% incompletos) → warning visible con texto exacto (AC-5)
  it('muestra warning cuando más del 40% de feedbacks son incompletos', () => {
    // 2 completos, 3 incompletos → incompleteRatio = 3/5 = 0.6 → supera 0.4
    const feedbacks = [
      { qualityScore: 0.8 },
      { qualityScore: 0.7 },
      { qualityScore: 0.2 },
      { qualityScore: 0.1 },
      { qualityScore: 0.0 },
    ]

    render(<FeedbackQualityStats feedbacks={feedbacks} qualityThreshold={0.6} />)

    const warning = screen.getByTestId('feedback-quality-warning')
    expect(warning).toBeInTheDocument()
    expect(warning).toHaveTextContent(
      'La mayoría de tus feedbacks son breves — considera añadir una pregunta más específica'
    )
  })

  // T4.6 — 1 feedback completo de 1 → "1 feedbacks completos de 1 totales" (sin warning) (AC-4, AC-6)
  it('muestra "1 feedbacks completos de 1 totales" y no muestra warning', () => {
    const feedbacks = [{ qualityScore: 1.0 }]

    render(<FeedbackQualityStats feedbacks={feedbacks} qualityThreshold={0.6} />)

    expect(screen.getByText('1 feedbacks completos de 1 totales')).toBeInTheDocument()
    expect(screen.queryByTestId('feedback-quality-warning')).toBeNull()
  })
})
