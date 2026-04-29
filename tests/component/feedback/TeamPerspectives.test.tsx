// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { TeamPerspectives } from '@/components/feedback/TeamPerspectives'
import type { FeedbackEntryData } from '@/lib/types/feedback'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const FEEDBACK_LIST: FeedbackEntryData[] = [
  {
    id: 'f-1',
    reviewerName: 'Ana García',
    createdAt: '2026-04-10T10:00:00Z',
    textResponses: { p4: 'Gran idea, la usaría.' },
  },
  {
    id: 'f-2',
    reviewerName: 'Carlos López',
    createdAt: '2026-04-09T12:00:00Z',
    textResponses: { p4: 'Mejoraría el onboarding.' },
    contributorType: 'insightful',
  },
  {
    id: 'f-3',
    reviewerName: 'María Torres',
    createdAt: '2026-04-08T09:00:00Z',
    textResponses: {
      p1: 'El problema es claro.',
      p4: 'Añadiría más integraciones.',
    },
    contributorType: 'top-reviewer',
  },
]

// ---------------------------------------------------------------------------
// Suite: TeamPerspectives
// ---------------------------------------------------------------------------

describe('TeamPerspectives — heading', () => {
  it('renderiza el heading "Perspectivas del equipo"', () => {
    render(<TeamPerspectives feedbacks={FEEDBACK_LIST} />)
    expect(
      screen.getByRole('heading', { name: 'Perspectivas del equipo' })
    ).toBeInTheDocument()
  })

  it('renderiza el heading también cuando la lista está vacía', () => {
    render(<TeamPerspectives feedbacks={[]} />)
    expect(
      screen.getByRole('heading', { name: 'Perspectivas del equipo' })
    ).toBeInTheDocument()
  })
})

describe('TeamPerspectives — lista de feedbacks', () => {
  it('renderiza N instancias de FeedbackEntry cuando feedbacks.length > 0', () => {
    render(<TeamPerspectives feedbacks={FEEDBACK_LIST} />)
    // Cada FeedbackEntry renderiza un <article>
    const articles = screen.getAllByRole('article')
    expect(articles).toHaveLength(FEEDBACK_LIST.length)
  })

  it('renderiza el nombre de cada reviewer', () => {
    render(<TeamPerspectives feedbacks={FEEDBACK_LIST} />)
    expect(screen.getByText('Ana García')).toBeInTheDocument()
    expect(screen.getByText('Carlos López')).toBeInTheDocument()
    expect(screen.getByText('María Torres')).toBeInTheDocument()
  })
})

describe('TeamPerspectives — empty state', () => {
  it('muestra el mensaje vacío cuando feedbacks es array vacío', () => {
    render(<TeamPerspectives feedbacks={[]} />)
    expect(
      screen.getByText('Aún no hay perspectivas del equipo')
    ).toBeInTheDocument()
  })

  it('no renderiza articles cuando feedbacks es array vacío', () => {
    render(<TeamPerspectives feedbacks={[]} />)
    expect(screen.queryAllByRole('article')).toHaveLength(0)
  })
})
