// @vitest-environment jsdom
/**
 * Tests unitarios — Story 8.6: TopContributorsList (componente de presentación puro)
 * Sin mocks de Supabase — recibe datos como props.
 */

import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TopContributorsList } from '@/components/gamification/TopContributorsList'
import type { TopContributor } from '@/lib/types/gamification'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const contributors5: TopContributor[] = [
  { userId: 'u1', name: 'Ana García',    feedbackCount: 12 },
  { userId: 'u2', name: 'Bruno López',   feedbackCount: 9  },
  { userId: 'u3', name: 'Clara Martín',  feedbackCount: 7  },
  { userId: 'u4', name: 'Diego Ruiz',    feedbackCount: 4  },
  { userId: 'u5', name: 'Elena Torres',  feedbackCount: 2  },
]

const contributors1: TopContributor[] = [
  { userId: 'u1', name: 'Ana García', feedbackCount: 5 },
]

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('TopContributorsList', () => {
  it('renderiza N filas con nombre, badge y conteo', () => {
    render(<TopContributorsList contributors={contributors5} />)
    const rows = screen.getAllByTestId('top-contributor-row')
    expect(rows).toHaveLength(5)

    // Verifica nombre y conteo en cada fila
    const row0 = rows[0]
    expect(within(row0).getByTestId('contributor-name')).toHaveTextContent('Ana García')
    expect(within(row0).getByTestId('contributor-count')).toHaveTextContent('12 feedbacks')

    const row4 = rows[4]
    expect(within(row4).getByTestId('contributor-name')).toHaveTextContent('Elena Torres')
    expect(within(row4).getByTestId('contributor-count')).toHaveTextContent('2 feedbacks')
  })

  it('primer revisor (índice 0) recibe badge top-reviewer con texto "Top Reviewer"', () => {
    render(<TopContributorsList contributors={contributors5} />)
    const rows = screen.getAllByTestId('top-contributor-row')
    const badgeEl = within(rows[0]).getByTestId('contributor-badge')
    expect(badgeEl).toHaveTextContent('Top Reviewer')
  })

  it('revisores 2 y 3 (índices 1 y 2) reciben badge insightful con texto "Perspicaz"', () => {
    render(<TopContributorsList contributors={contributors5} />)
    const rows = screen.getAllByTestId('top-contributor-row')

    const badge1 = within(rows[1]).getByTestId('contributor-badge')
    expect(badge1).toHaveTextContent('Perspicaz')

    const badge2 = within(rows[2]).getByTestId('contributor-badge')
    expect(badge2).toHaveTextContent('Perspicaz')
  })

  it('revisores 4 y 5 (índices 3 y 4) reciben badge changed-thinking con texto "Cambió mi perspectiva"', () => {
    render(<TopContributorsList contributors={contributors5} />)
    const rows = screen.getAllByTestId('top-contributor-row')

    const badge3 = within(rows[3]).getByTestId('contributor-badge')
    expect(badge3).toHaveTextContent('Cambió mi perspectiva')

    const badge4 = within(rows[4]).getByTestId('contributor-badge')
    expect(badge4).toHaveTextContent('Cambió mi perspectiva')
  })

  it('muestra "Aún no hay revisores en esta comunidad" cuando array es vacío', () => {
    render(<TopContributorsList contributors={[]} />)
    expect(screen.getByTestId('top-contributors-empty')).toHaveTextContent(
      'Aún no hay revisores en esta comunidad'
    )
    expect(screen.queryByTestId('top-contributor-row')).not.toBeInTheDocument()
  })

  it('con un solo revisor renderiza exactamente 1 fila con badge top-reviewer', () => {
    render(<TopContributorsList contributors={contributors1} />)
    const rows = screen.getAllByTestId('top-contributor-row')
    expect(rows).toHaveLength(1)
    expect(within(rows[0]).getByTestId('contributor-badge')).toHaveTextContent('Top Reviewer')
  })

  it('muestra "1 feedback" en singular cuando feedbackCount es 1', () => {
    const single: TopContributor[] = [{ userId: 'u1', name: 'Test User', feedbackCount: 1 }]
    render(<TopContributorsList contributors={single} />)
    expect(screen.getByTestId('contributor-count')).toHaveTextContent('1 feedback')
  })
})
