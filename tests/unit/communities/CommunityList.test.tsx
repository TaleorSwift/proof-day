// @vitest-environment jsdom
/**
 * Tests — CommunityList
 * Verifica que renderiza el número correcto de CommunityCard.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

import { CommunityList } from '@/components/communities/CommunityList'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeCommunity = (id: string, name: string, slug: string) => ({
  id,
  name,
  slug,
  description: `Descripción de ${name}`,
  image_url: null,
  created_by: 'user-001',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  member_count: 3,
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CommunityList', () => {
  it('renderiza exactamente N tarjetas cuando se pasan N comunidades', () => {
    const communities = [
      makeCommunity('c1', 'Alpha', 'alpha'),
      makeCommunity('c2', 'Beta', 'beta'),
      makeCommunity('c3', 'Gamma', 'gamma'),
    ]
    render(<CommunityList communities={communities} />)

    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.getByText('Gamma')).toBeInTheDocument()
  })

  it('renderiza 2 tarjetas con 2 comunidades', () => {
    const communities = [
      makeCommunity('c1', 'Alpha', 'alpha'),
      makeCommunity('c2', 'Beta', 'beta'),
    ]
    render(<CommunityList communities={communities} />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
  })

  it('renderiza 6 tarjetas con 6 comunidades', () => {
    const communities = Array.from({ length: 6 }, (_, i) =>
      makeCommunity(`c${i}`, `Comunidad ${i}`, `comunidad-${i}`)
    )
    render(<CommunityList communities={communities} />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(6)
  })

  it('cada tarjeta enlaza al slug correcto', () => {
    const communities = [
      makeCommunity('c1', 'Producto Alpha', 'producto-alpha'),
      makeCommunity('c2', 'Beta Testers', 'beta-testers'),
    ]
    render(<CommunityList communities={communities} />)

    const links = screen.getAllByRole('link')
    const hrefs = links.map((l) => l.getAttribute('href'))
    expect(hrefs).toContain('/communities/producto-alpha')
    expect(hrefs).toContain('/communities/beta-testers')
  })

  it('renderiza lista vacía sin errores cuando communities es []', () => {
    const { container } = render(<CommunityList communities={[]} />)
    expect(container.firstChild).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
