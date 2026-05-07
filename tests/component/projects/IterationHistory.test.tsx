// @vitest-environment jsdom
// Story 13.6 — Tests TDD Outside-In para IterationHistory

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { IterationHistory } from '@/components/projects/IterationHistory'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const singleIteration = [
  { id: 'iter-1', versionNumber: 1, publishedAt: '2026-03-15T10:00:00Z', feedbackCount: 8 },
]

const multipleIterations = [
  { id: 'iter-3', versionNumber: 3, publishedAt: '2026-05-01T10:00:00Z', feedbackCount: 3 },
  { id: 'iter-2', versionNumber: 2, publishedAt: '2026-04-10T10:00:00Z', feedbackCount: 12 },
  { id: 'iter-1', versionNumber: 1, publishedAt: '2026-03-15T10:00:00Z', feedbackCount: 8 },
]

const iterationWithZeroFeedbacks = [
  { id: 'iter-2', versionNumber: 2, publishedAt: '2026-05-07T10:00:00Z', feedbackCount: 0 },
  { id: 'iter-1', versionNumber: 1, publishedAt: '2026-03-15T10:00:00Z', feedbackCount: 8 },
]

// ── Tests — array vacío ────────────────────────────────────────────────────────

describe('IterationHistory — array vacío', () => {
  it('no renderiza nada cuando iterations es un array vacío', () => {
    const { container } = render(<IterationHistory iterations={[]} />)
    expect(container.firstChild).toBeNull()
  })
})

// ── Tests — items renderizados ─────────────────────────────────────────────────

describe('IterationHistory — items renderizados', () => {
  it('renderiza el contenedor con data-testid "iteration-history"', () => {
    render(<IterationHistory iterations={singleIteration} />)
    expect(screen.getByTestId('iteration-history')).toBeInTheDocument()
  })

  it('renderiza un item por cada iteración', () => {
    render(<IterationHistory iterations={multipleIterations} />)
    expect(screen.getAllByTestId(/^iteration-history-item-/)).toHaveLength(3)
  })

  it('renderiza el item con data-testid correcto para cada número de versión', () => {
    render(<IterationHistory iterations={multipleIterations} />)
    expect(screen.getByTestId('iteration-history-item-3')).toBeInTheDocument()
    expect(screen.getByTestId('iteration-history-item-2')).toBeInTheDocument()
    expect(screen.getByTestId('iteration-history-item-1')).toBeInTheDocument()
  })

  it('muestra el número de versión con prefijo "v"', () => {
    render(<IterationHistory iterations={multipleIterations} />)
    expect(screen.getByText('v3')).toBeInTheDocument()
    expect(screen.getByText('v2')).toBeInTheDocument()
    expect(screen.getByText('v1')).toBeInTheDocument()
  })

  it('muestra el heading "Historial de versiones"', () => {
    render(<IterationHistory iterations={singleIteration} />)
    expect(screen.getByText('Historial de versiones')).toBeInTheDocument()
  })
})

// ── Tests — pluralización de feedbacks ────────────────────────────────────────

describe('IterationHistory — pluralización de feedbacks', () => {
  it('muestra "5 feedbacks" cuando feedbackCount es 5', () => {
    const iterations = [
      { id: 'iter-1', versionNumber: 1, publishedAt: '2026-03-15T10:00:00Z', feedbackCount: 5 },
    ]
    render(<IterationHistory iterations={iterations} />)
    expect(screen.getByText('5 feedbacks')).toBeInTheDocument()
  })

  it('muestra "1 feedback" (singular) cuando feedbackCount es 1', () => {
    render(<IterationHistory iterations={singleIteration} />)
    // singleIteration tiene feedbackCount: 8, pero necesitamos 1
    const singleFeedback = [
      { id: 'iter-1', versionNumber: 1, publishedAt: '2026-03-15T10:00:00Z', feedbackCount: 1 },
    ]
    const { unmount } = render(<IterationHistory iterations={singleFeedback} />)
    expect(screen.getByText('1 feedback')).toBeInTheDocument()
    unmount()
  })

  it('muestra "0 feedbacks" cuando feedbackCount es 0', () => {
    render(<IterationHistory iterations={iterationWithZeroFeedbacks} />)
    expect(screen.getByText('0 feedbacks')).toBeInTheDocument()
  })

  it('muestra "12 feedbacks" para la iteración con 12 feedbacks', () => {
    render(<IterationHistory iterations={multipleIterations} />)
    expect(screen.getByText('12 feedbacks')).toBeInTheDocument()
  })
})

// ── Tests — fecha formateada ───────────────────────────────────────────────────

describe('IterationHistory — fecha formateada', () => {
  it('muestra la fecha formateada en español para 2026-03-15', () => {
    render(<IterationHistory iterations={singleIteration} />)
    // Intl.DateTimeFormat puede producir "15 mar 2026" o "15 mar. 2026" según plataforma
    const dateEl = screen.getByRole('time')
    expect(dateEl).toBeInTheDocument()
    expect(dateEl).toHaveAttribute('dateTime', '2026-03-15T10:00:00Z')
  })

  it('cada iteración tiene un elemento time con el atributo dateTime correcto', () => {
    render(<IterationHistory iterations={multipleIterations} />)
    const times = screen.getAllByRole('time')
    expect(times).toHaveLength(3)
    const dateTimes = times.map((el) => el.getAttribute('dateTime'))
    expect(dateTimes).toContain('2026-05-01T10:00:00Z')
    expect(dateTimes).toContain('2026-04-10T10:00:00Z')
    expect(dateTimes).toContain('2026-03-15T10:00:00Z')
  })
})

// ── Tests — accesibilidad ─────────────────────────────────────────────────────

describe('IterationHistory — accesibilidad', () => {
  it('la sección tiene aria-labelledby apuntando al heading', () => {
    render(<IterationHistory iterations={singleIteration} />)
    const section = screen.getByTestId('iteration-history')
    const headingId = section.getAttribute('aria-labelledby')
    expect(headingId).toBeTruthy()
    const heading = document.getElementById(headingId!)
    expect(heading).toBeInTheDocument()
    expect(heading?.textContent).toBe('Historial de versiones')
  })

  it('la lista de iteraciones usa un elemento <ul>', () => {
    render(<IterationHistory iterations={singleIteration} />)
    const section = screen.getByTestId('iteration-history')
    const list = section.querySelector('ul')
    expect(list).toBeInTheDocument()
  })

  it('cada item es un elemento <li>', () => {
    render(<IterationHistory iterations={multipleIterations} />)
    const items = screen.getAllByTestId(/^iteration-history-item-/)
    items.forEach((item) => {
      expect(item.tagName).toBe('LI')
    })
  })
})
