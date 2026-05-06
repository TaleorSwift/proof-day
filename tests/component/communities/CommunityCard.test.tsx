// @vitest-environment jsdom
/**
 * Tests — CommunityCard
 * Verifica renderizado con imagen y fallback de avatar cuando imageUrl es null.
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommunityCard } from '@/components/communities/CommunityCard'
import type { Community } from '@/lib/types/communities'

const base: Community = {
  id: 'c-1',
  name: 'Test Community',
  slug: 'test-community',
  description: 'Descripción de prueba',
  imageUrl: null,
  createdBy: 'user-1',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  memberCount: 3,
  // Story 11.1 — reciprocidad
  reciprocityThreshold: 3,
}

describe('CommunityCard — imagen', () => {
  it('muestra la imagen cuando imageUrl tiene valor', () => {
    render(<CommunityCard community={{ ...base, imageUrl: 'https://picsum.photos/seed/test/400/400' }} />)
    expect(screen.getByAltText('Imagen de Test Community')).toBeInTheDocument()
  })

  it('muestra el avatar con la inicial cuando image_url es null', () => {
    render(<CommunityCard community={base} />)
    expect(screen.queryByAltText('Imagen de Test Community')).not.toBeInTheDocument()
    // El avatar muestra la inicial del nombre
    expect(screen.getByText('T')).toBeInTheDocument()
  })
})

describe('CommunityCard — contenido', () => {
  it('renderiza el nombre de la comunidad', () => {
    render(<CommunityCard community={base} />)
    expect(screen.getByText('Test Community')).toBeInTheDocument()
  })

  it('renderiza la descripción', () => {
    render(<CommunityCard community={base} />)
    expect(screen.getByText('Descripción de prueba')).toBeInTheDocument()
  })

  it('muestra "miembros" en plural', () => {
    render(<CommunityCard community={base} />)
    expect(screen.getByText('3 miembros')).toBeInTheDocument()
  })

  it('muestra "miembro" en singular con 1 miembro', () => {
    render(<CommunityCard community={{ ...base, memberCount: 1 }} />)
    expect(screen.getByText('1 miembro')).toBeInTheDocument()
  })

  it('enlaza a la ruta de la comunidad por slug', () => {
    render(<CommunityCard community={base} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/communities/test-community')
  })
})
