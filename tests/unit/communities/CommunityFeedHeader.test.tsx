// @vitest-environment jsdom
/**
 * Tests — CommunityFeedHeader (Story 9.9)
 * Verifica el header "Ideas en validación", subtítulo y botón Lanzar idea.
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { CommunityFeedHeader } from '@/components/communities/CommunityFeedHeader'

// ---------------------------------------------------------------------------
// AC-1: H1 "Ideas en validación" y subtítulo
// ---------------------------------------------------------------------------

describe('CommunityFeedHeader — AC-1: heading y subtítulo', () => {
  it('renderiza h1 con texto "Ideas en validación"', () => {
    render(
      <CommunityFeedHeader
        communityName="Startup Madrid"
        communitySlug="startup-madrid"
      />
    )
    const heading = screen.getByRole('heading', { level: 1, name: 'Ideas en validación' })
    expect(heading).toBeInTheDocument()
  })

  it('h1 tiene data-testid="feed-heading"', () => {
    render(
      <CommunityFeedHeader
        communityName="Startup Madrid"
        communitySlug="startup-madrid"
      />
    )
    expect(screen.getByTestId('feed-heading')).toBeInTheDocument()
  })

  it('renderiza subtítulo con texto esperado', () => {
    render(
      <CommunityFeedHeader
        communityName="Startup Madrid"
        communitySlug="startup-madrid"
      />
    )
    expect(
      screen.getByTestId('feed-subheading')
    ).toHaveTextContent('Da feedback. Aprende más rápido. Decide qué construir.')
  })
})

// ---------------------------------------------------------------------------
// AC-2: Botón "Lanzar idea"
// ---------------------------------------------------------------------------

describe('CommunityFeedHeader — AC-2: botón Lanzar idea', () => {
  it('renderiza botón con data-testid="btn-launch-idea"', () => {
    render(
      <CommunityFeedHeader
        communityName="Startup Madrid"
        communitySlug="startup-madrid"
      />
    )
    expect(screen.getByTestId('btn-launch-idea')).toBeInTheDocument()
  })

  it('botón tiene texto "+ Lanzar idea"', () => {
    render(
      <CommunityFeedHeader
        communityName="Startup Madrid"
        communitySlug="startup-madrid"
      />
    )
    expect(screen.getByTestId('btn-launch-idea')).toHaveTextContent('+ Lanzar idea')
  })
})

// ---------------------------------------------------------------------------
// AC-4: Metadatos de comunidad accesibles pero secundarios
// ---------------------------------------------------------------------------

describe('CommunityFeedHeader — AC-4: metadatos de comunidad', () => {
  it('muestra el nombre de la comunidad en posición secundaria', () => {
    render(
      <CommunityFeedHeader
        communityName="Startup Madrid"
        communitySlug="startup-madrid"
      />
    )
    expect(screen.getByTestId('community-name-secondary')).toHaveTextContent('Startup Madrid')
  })
})
