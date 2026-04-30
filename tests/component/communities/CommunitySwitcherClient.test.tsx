// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const pathnameMock = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => pathnameMock(),
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/components/communities/CommunitySwitcher', () => ({
  CommunitySwitcher: ({
    communities,
    activeCommunitySlug,
  }: {
    communities: unknown[]
    activeCommunitySlug: string | undefined
  }) => (
    <div
      data-testid="community-switcher"
      data-communities={communities.length}
      data-active-slug={activeCommunitySlug ?? ''}
    />
  ),
}))

import { CommunitySwitcherClient } from '@/components/communities/CommunitySwitcherClient'
import type { Community } from '@/lib/types/communities'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeCommunity(id: string, slug: string): Community {
  return {
    id,
    name: `Comunidad ${id}`,
    slug,
    description: null,
    image_url: null,
    created_by: 'user-001',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    member_count: 1,
  }
}

const alpha = makeCommunity('c1', 'producto-alpha')
const beta = makeCommunity('c2', 'beta-testers')

// ---------------------------------------------------------------------------
// Suite: extracción del slug activo desde la ruta
// ---------------------------------------------------------------------------

describe('CommunitySwitcherClient — extracción del slug activo', () => {
  beforeEach(() => vi.clearAllMocks())

  it('extrae el slug correcto de /communities/producto-alpha', () => {
    pathnameMock.mockReturnValue('/communities/producto-alpha')

    render(<CommunitySwitcherClient communities={[alpha, beta]} />)

    expect(screen.getByTestId('community-switcher')).toHaveAttribute(
      'data-active-slug',
      'producto-alpha'
    )
  })

  it('extrae el slug correcto de /communities/beta-testers/settings', () => {
    pathnameMock.mockReturnValue('/communities/beta-testers/settings')

    render(<CommunitySwitcherClient communities={[alpha, beta]} />)

    expect(screen.getByTestId('community-switcher')).toHaveAttribute(
      'data-active-slug',
      'beta-testers'
    )
  })

  it('no extrae slug activo en /communities sin subpath', () => {
    pathnameMock.mockReturnValue('/communities')

    render(<CommunitySwitcherClient communities={[alpha, beta]} />)

    expect(screen.getByTestId('community-switcher')).toHaveAttribute('data-active-slug', '')
  })

  it('no extrae slug activo en /communities/new (ruta reservada)', () => {
    pathnameMock.mockReturnValue('/communities/new')

    render(<CommunitySwitcherClient communities={[alpha, beta]} />)

    expect(screen.getByTestId('community-switcher')).toHaveAttribute('data-active-slug', '')
  })

  it('no extrae slug activo en rutas fuera de /communities', () => {
    pathnameMock.mockReturnValue('/profile')

    render(<CommunitySwitcherClient communities={[alpha, beta]} />)

    expect(screen.getByTestId('community-switcher')).toHaveAttribute('data-active-slug', '')
  })
})

// ---------------------------------------------------------------------------
// Suite: paso de comunidades al CommunitySwitcher
// ---------------------------------------------------------------------------

describe('CommunitySwitcherClient — paso de comunidades', () => {
  beforeEach(() => vi.clearAllMocks())

  it('pasa todas las comunidades al CommunitySwitcher', () => {
    pathnameMock.mockReturnValue('/communities/producto-alpha')

    render(<CommunitySwitcherClient communities={[alpha, beta]} />)

    expect(screen.getByTestId('community-switcher')).toHaveAttribute('data-communities', '2')
  })

  it('funciona correctamente con array vacío de comunidades', () => {
    pathnameMock.mockReturnValue('/communities')

    render(<CommunitySwitcherClient communities={[]} />)

    expect(screen.getByTestId('community-switcher')).toHaveAttribute('data-communities', '0')
  })
})
