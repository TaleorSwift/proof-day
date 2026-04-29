// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

import { ProjectsEmptyState } from '@/components/projects/ProjectsEmptyState'

describe('ProjectsEmptyState — mensaje vacío', () => {
  it('renderiza el mensaje de comunidad sin proyectos', () => {
    render(<ProjectsEmptyState communitySlug="mi-comunidad" />)
    expect(screen.getByText('Esta comunidad no tiene proyectos aún')).toBeInTheDocument()
  })

  it('renderiza el contenedor con data-testid="empty-state"', () => {
    render(<ProjectsEmptyState communitySlug="mi-comunidad" />)
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })
})

describe('ProjectsEmptyState — canCreate=false (por defecto)', () => {
  it('no muestra el botón "Crear el primero" cuando canCreate es false', () => {
    render(<ProjectsEmptyState communitySlug="mi-comunidad" />)
    expect(screen.queryByRole('link', { name: /Crear el primero/i })).not.toBeInTheDocument()
  })

  it('no muestra el botón "Crear el primero" cuando canCreate se omite', () => {
    render(<ProjectsEmptyState communitySlug="mi-comunidad" />)
    expect(screen.queryByText('Crear el primero')).not.toBeInTheDocument()
  })
})

describe('ProjectsEmptyState — canCreate=true', () => {
  it('muestra el botón "Crear el primero" cuando canCreate es true', () => {
    render(<ProjectsEmptyState communitySlug="mi-comunidad" canCreate />)
    expect(screen.getByText('Crear el primero')).toBeInTheDocument()
  })

  it('enlaza a la ruta de creación de proyecto con el slug correcto', () => {
    render(<ProjectsEmptyState communitySlug="mi-comunidad" canCreate />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/communities/mi-comunidad/projects/new')
  })

  it('construye la ruta correctamente con un slug distinto', () => {
    render(<ProjectsEmptyState communitySlug="otra-comunidad" canCreate />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/communities/otra-comunidad/projects/new')
  })
})
