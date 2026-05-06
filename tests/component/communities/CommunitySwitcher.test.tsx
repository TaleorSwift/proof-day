// @vitest-environment jsdom
/**
 * Tests — CommunitySwitcher
 * Verifica el dropdown de selección de comunidad activa.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

// Mock mínimo de Radix DropdownMenu para entorno jsdom
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div role="menu">{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
    <div role="menuitem" onClick={onClick} {...props}>
      {children}
    </div>
  ),
}))

import { CommunitySwitcher } from '@/components/communities/CommunitySwitcher'

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
  // Story 11.1 — reciprocidad
  reciprocity_threshold: 3,
})

const alpha = makeCommunity('c1', 'Producto Alpha', 'producto-alpha')
const beta = makeCommunity('c2', 'Beta Testers', 'beta-testers')

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CommunitySwitcher — con 1 comunidad', () => {
  it('muestra el nombre de la comunidad como texto (sin dropdown)', () => {
    render(<CommunitySwitcher communities={[alpha]} activeCommunitySlug="producto-alpha" />)
    expect(screen.getByText('Producto Alpha')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

describe('CommunitySwitcher — con 0 comunidades', () => {
  it('no renderiza nada', () => {
    const { container } = render(
      <CommunitySwitcher communities={[]} activeCommunitySlug={undefined} />
    )
    expect(container.firstChild).toBeNull()
  })
})

describe('CommunitySwitcher — con 2+ comunidades', () => {
  beforeEach(() => {
    pushMock.mockClear()
  })

  it('muestra el nombre de la comunidad activa en el trigger', () => {
    render(
      <CommunitySwitcher
        communities={[alpha, beta]}
        activeCommunitySlug="beta-testers"
      />
    )
    expect(screen.getByRole('button')).toHaveTextContent('Beta Testers')
  })

  it('muestra "Mis comunidades" en el trigger cuando no hay comunidad activa', () => {
    render(
      <CommunitySwitcher communities={[alpha, beta]} activeCommunitySlug={undefined} />
    )
    expect(screen.getByRole('button')).toHaveTextContent('Mis comunidades')
  })

  it('lista todas las comunidades disponibles en el dropdown', () => {
    render(
      <CommunitySwitcher communities={[alpha, beta]} activeCommunitySlug="producto-alpha" />
    )
    const items = screen.getAllByRole('menuitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Producto Alpha')
    expect(items[1]).toHaveTextContent('Beta Testers')
  })

  it('navega al slug correcto al hacer click en un item', () => {
    render(
      <CommunitySwitcher communities={[alpha, beta]} activeCommunitySlug="producto-alpha" />
    )
    const betaItem = screen.getByRole('menuitem', { name: /Beta Testers/ })
    fireEvent.click(betaItem)
    expect(pushMock).toHaveBeenCalledWith('/communities/beta-testers')
  })

  it('navega al slug de la primera comunidad al hacer click en ella', () => {
    render(
      <CommunitySwitcher communities={[alpha, beta]} activeCommunitySlug="beta-testers" />
    )
    const alphaItem = screen.getByRole('menuitem', { name: /Producto Alpha/ })
    fireEvent.click(alphaItem)
    expect(pushMock).toHaveBeenCalledWith('/communities/producto-alpha')
  })
})
