// @vitest-environment jsdom
/**
 * Tests — CommunityHeader
 * Verifica el renderizado del sidebar de comunidad: nombre, miembros, descripción,
 * avatar, y visibilidad del enlace a Configuración según el rol admin.
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommunityHeader } from '@/components/communities/CommunityHeader'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const baseCommunity = {
  id: 'comm-001',
  name: 'Startup Madrid',
  slug: 'startup-madrid',
  description: 'Espacio de validación de ideas para emprendedores.',
  imageUrl: null,
  createdBy: 'user-001',
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
  memberCount: 12,
  // Story 11.1 — reciprocidad
  reciprocityThreshold: 3,
}

// ---------------------------------------------------------------------------
// AC-1: Renderizado básico — nombre y member count
// ---------------------------------------------------------------------------

describe('CommunityHeader — AC-1: nombre y member count visibles', () => {
  it('muestra el nombre de la comunidad', () => {
    render(<CommunityHeader community={baseCommunity} isAdmin={false} />)
    expect(screen.getByRole('heading', { name: 'Startup Madrid' })).toBeInTheDocument()
  })

  it('muestra el conteo de miembros en plural', () => {
    render(<CommunityHeader community={baseCommunity} isAdmin={false} />)
    expect(screen.getByText('12 miembros')).toBeInTheDocument()
  })

  it('muestra "miembro" en singular cuando memberCount es 1', () => {
    render(
      <CommunityHeader
        community={{ ...baseCommunity, memberCount: 1 }}
        isAdmin={false}
      />
    )
    expect(screen.getByText('1 miembro')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// AC-2: Descripción
// ---------------------------------------------------------------------------

describe('CommunityHeader — AC-2: descripción', () => {
  it('muestra la descripción cuando está presente', () => {
    render(<CommunityHeader community={baseCommunity} isAdmin={false} />)
    expect(
      screen.getByText('Espacio de validación de ideas para emprendedores.')
    ).toBeInTheDocument()
  })

  it('no muestra descripción cuando está vacía', () => {
    render(
      <CommunityHeader
        community={{ ...baseCommunity, description: '' }}
        isAdmin={false}
      />
    )
    expect(
      screen.queryByText('Espacio de validación de ideas para emprendedores.')
    ).not.toBeInTheDocument()
  })

  it('no muestra descripción cuando es null', () => {
    render(
      <CommunityHeader
        community={{ ...baseCommunity, description: null }}
        isAdmin={false}
      />
    )
    expect(
      screen.queryByText('Espacio de validación de ideas para emprendedores.')
    ).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// AC-3: Avatar — con y sin imagen
// ---------------------------------------------------------------------------

describe('CommunityHeader — AC-3: avatar', () => {
  it('muestra la inicial del nombre cuando no hay imageUrl', () => {
    render(<CommunityHeader community={baseCommunity} isAdmin={false} />)
    // El div con aria-hidden="true" muestra la inicial
    const initial = screen.getByText('S')
    expect(initial).toBeInTheDocument()
  })

  it('muestra un elemento img cuando hay imageUrl', () => {
    render(
      <CommunityHeader
        community={{
          ...baseCommunity,
          imageUrl: 'https://picsum.photos/seed/sm/200/200',
        }}
        isAdmin={false}
      />
    )
    const img = screen.getByAltText('Imagen de Startup Madrid')
    expect(img).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// AC-4: Enlace a Configuración — solo visible para admin
// ---------------------------------------------------------------------------

describe('CommunityHeader — AC-4: enlace Configuración según rol', () => {
  it('muestra el enlace "Configuración" cuando isAdmin es true', () => {
    render(<CommunityHeader community={baseCommunity} isAdmin={true} />)
    const link = screen.getByRole('link', { name: 'Configuración' })
    expect(link).toBeInTheDocument()
  })

  it('el enlace apunta a /communities/[slug]/settings', () => {
    render(<CommunityHeader community={baseCommunity} isAdmin={true} />)
    const link = screen.getByRole('link', { name: 'Configuración' })
    expect(link).toHaveAttribute('href', '/communities/startup-madrid/settings')
  })

  it('NO muestra el enlace "Configuración" cuando isAdmin es false', () => {
    render(<CommunityHeader community={baseCommunity} isAdmin={false} />)
    expect(screen.queryByRole('link', { name: 'Configuración' })).not.toBeInTheDocument()
  })
})
