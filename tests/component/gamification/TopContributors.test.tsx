// @vitest-environment jsdom
/**
 * Tests unitarios — TopContributors (Server Component)
 *
 * TopContributors es un async Server Component que llama a Supabase y delega el
 * renderizado a TopContributorsList.  Lo probamos mockeando las capas de
 * infraestructura (createClient, gamification.repository) para poder ejecutarlo
 * directamente en jsdom sin un entorno Next.js completo.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { TopContributors } from '@/components/gamification/TopContributors'

// ---------------------------------------------------------------------------
// Mocks de infraestructura
// ---------------------------------------------------------------------------

const mockGetAllFeedbacksByCommunity = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({}),
}))

vi.mock('@/lib/repositories/gamification.repository', () => ({
  createGamificationRepository: vi.fn(() => ({
    getAllFeedbacksByCommunity: mockGetAllFeedbacksByCommunity,
  })),
}))

// ---------------------------------------------------------------------------
// Fixtures — filas de feedbacks con join de perfiles
// ---------------------------------------------------------------------------

type FeedbackRow = {
  reviewer_id: string
  created_at: string
  profiles: { name: string | null } | null
}

function makeFeedback(reviewerId: string, name: string | null, createdAt = '2026-01-01T00:00:00Z'): FeedbackRow {
  return {
    reviewer_id: reviewerId,
    created_at: createdAt,
    profiles: name ? { name } : null,
  }
}

// ---------------------------------------------------------------------------
// Suite: con contribuidores
// ---------------------------------------------------------------------------

describe('TopContributors — con datos', () => {
  beforeEach(() => {
    mockGetAllFeedbacksByCommunity.mockReset()
  })

  it('renderiza el top contribuidor con mayor conteo de feedbacks', async () => {
    const feedbacks: FeedbackRow[] = [
      makeFeedback('u1', 'Ana García'),
      makeFeedback('u1', 'Ana García', '2026-01-02T00:00:00Z'),
      makeFeedback('u1', 'Ana García', '2026-01-03T00:00:00Z'),
      makeFeedback('u2', 'Bruno López'),
      makeFeedback('u2', 'Bruno López', '2026-01-02T00:00:00Z'),
    ]
    mockGetAllFeedbacksByCommunity.mockResolvedValueOnce({ data: feedbacks })

    const element = await TopContributors({ communityId: 'com-1' })
    render(element)

    // Hay múltiples filas, usamos la primera (mayor conteo = Ana García con 3)
    const names = screen.getAllByTestId('contributor-name')
    expect(names[0]).toHaveTextContent('Ana García')
  })

  it('muestra el conteo correcto de feedbacks del top contribuidor', async () => {
    const feedbacks: FeedbackRow[] = [
      makeFeedback('u1', 'Ana García'),
      makeFeedback('u1', 'Ana García', '2026-01-02T00:00:00Z'),
      makeFeedback('u1', 'Ana García', '2026-01-03T00:00:00Z'),
    ]
    mockGetAllFeedbacksByCommunity.mockResolvedValueOnce({ data: feedbacks })

    const element = await TopContributors({ communityId: 'com-1' })
    render(element)

    expect(screen.getByTestId('contributor-count')).toHaveTextContent('3 feedbacks')
  })

  it('renderiza los 5 contribuidores cuando hay suficientes datos', async () => {
    const feedbacks: FeedbackRow[] = [
      makeFeedback('u1', 'Usuario 1'),
      makeFeedback('u2', 'Usuario 2'),
      makeFeedback('u3', 'Usuario 3'),
      makeFeedback('u4', 'Usuario 4'),
      makeFeedback('u5', 'Usuario 5'),
      makeFeedback('u1', 'Usuario 1', '2026-01-02T00:00:00Z'),
    ]
    mockGetAllFeedbacksByCommunity.mockResolvedValueOnce({ data: feedbacks })

    const element = await TopContributors({ communityId: 'com-1' })
    render(element)

    const rows = screen.getAllByTestId('top-contributor-row')
    expect(rows).toHaveLength(5)
  })

  it('usa slice del userId como fallback de nombre cuando profiles es null', async () => {
    const feedbacks: FeedbackRow[] = [
      { reviewer_id: 'abcdef12-1234', created_at: '2026-01-01T00:00:00Z', profiles: null },
    ]
    mockGetAllFeedbacksByCommunity.mockResolvedValueOnce({ data: feedbacks })

    const element = await TopContributors({ communityId: 'com-1' })
    render(element)

    // El fallback es userId.slice(0, 8) = 'abcdef12'
    expect(screen.getByTestId('contributor-name')).toHaveTextContent('abcdef12')
  })
})

// ---------------------------------------------------------------------------
// Suite: lista vacía
// ---------------------------------------------------------------------------

describe('TopContributors — sin datos', () => {
  beforeEach(() => {
    mockGetAllFeedbacksByCommunity.mockReset()
  })

  it('muestra el empty state cuando no hay feedbacks', async () => {
    mockGetAllFeedbacksByCommunity.mockResolvedValueOnce({ data: [] })

    const element = await TopContributors({ communityId: 'com-1' })
    render(element)

    expect(screen.getByTestId('top-contributors-empty')).toBeInTheDocument()
  })

  it('muestra el empty state cuando data es null', async () => {
    mockGetAllFeedbacksByCommunity.mockResolvedValueOnce({ data: null })

    const element = await TopContributors({ communityId: 'com-1' })
    render(element)

    expect(screen.getByTestId('top-contributors-empty')).toBeInTheDocument()
  })
})
