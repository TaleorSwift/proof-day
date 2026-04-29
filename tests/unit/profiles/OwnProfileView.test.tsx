// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

import { OwnProfileView } from '@/components/profiles/OwnProfileView'
import type { ProfileWithStats } from '@/lib/types/profiles'

// ---------------------------------------------------------------------------
// Mocks de módulos
// ---------------------------------------------------------------------------

vi.mock('@/lib/api/profiles', () => ({
  updateProfile: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeProfile(overrides: Partial<ProfileWithStats> = {}): ProfileWithStats {
  return {
    id: 'user-1',
    name: 'Ana García',
    bio: 'Emprendedora tecnológica',
    interests: ['IA', 'Startups'],
    avatarUrl: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    feedbackCount: 7,
    projectCount: 3,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Suite: render en modo vista (no edición)
// ---------------------------------------------------------------------------

describe('OwnProfileView — modo vista', () => {
  it('muestra el nombre del perfil', () => {
    render(<OwnProfileView profile={makeProfile()} />)
    expect(screen.getByText('Ana García')).toBeInTheDocument()
  })

  it('muestra "Sin nombre" cuando name es null', () => {
    render(<OwnProfileView profile={makeProfile({ name: null })} />)
    expect(screen.getByText('Sin nombre')).toBeInTheDocument()
  })

  it('muestra la bio cuando existe', () => {
    render(<OwnProfileView profile={makeProfile()} />)
    expect(screen.getByText('Emprendedora tecnológica')).toBeInTheDocument()
  })

  it('no muestra bio cuando es null', () => {
    render(<OwnProfileView profile={makeProfile({ bio: null })} />)
    expect(screen.queryByText('Emprendedora tecnológica')).not.toBeInTheDocument()
  })

  it('muestra los intereses como etiquetas', () => {
    render(<OwnProfileView profile={makeProfile()} />)
    expect(screen.getByText('IA')).toBeInTheDocument()
    expect(screen.getByText('Startups')).toBeInTheDocument()
  })

  it('no renderiza la sección de intereses cuando el array está vacío', () => {
    render(<OwnProfileView profile={makeProfile({ interests: [] })} />)
    expect(screen.queryByText('IA')).not.toBeInTheDocument()
  })

  it('muestra el conteo de feedbacks dados', () => {
    render(<OwnProfileView profile={makeProfile({ feedbackCount: 7 })} />)
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('feedbacks dados')).toBeInTheDocument()
  })

  it('muestra el conteo de proyectos creados', () => {
    render(<OwnProfileView profile={makeProfile({ projectCount: 3 })} />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('proyectos creados')).toBeInTheDocument()
  })

  it('muestra el botón "Editar perfil"', () => {
    render(<OwnProfileView profile={makeProfile()} />)
    expect(screen.getByRole('button', { name: /editar perfil/i })).toBeInTheDocument()
  })

  it('muestra las tabs "Proyectos creados" y "Feedbacks dados"', () => {
    render(<OwnProfileView profile={makeProfile()} />)
    expect(screen.getByRole('tab', { name: /proyectos creados/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /feedbacks dados/i })).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: transición al modo edición
// ---------------------------------------------------------------------------

describe('OwnProfileView — transición a modo edición', () => {
  it('al pulsar "Editar perfil" muestra el formulario de edición', () => {
    render(<OwnProfileView profile={makeProfile()} />)
    fireEvent.click(screen.getByRole('button', { name: /editar perfil/i }))
    expect(screen.getByText('Editar perfil', { selector: 'h1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
  })

  it('al pulsar "Editar perfil" oculta el modo vista', () => {
    render(<OwnProfileView profile={makeProfile()} />)
    fireEvent.click(screen.getByRole('button', { name: /editar perfil/i }))
    expect(screen.queryByText('feedbacks dados')).not.toBeInTheDocument()
  })

  it('al pulsar "Cancelar" en el formulario vuelve al modo vista', () => {
    render(<OwnProfileView profile={makeProfile()} />)
    fireEvent.click(screen.getByRole('button', { name: /editar perfil/i }))
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(screen.getByText('feedbacks dados')).toBeInTheDocument()
  })
})
