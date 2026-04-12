// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: React.ReactNode
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    asChild,
    disabled,
    'aria-label': ariaLabel,
    ...props
  }: {
    children: React.ReactNode
    asChild?: boolean
    variant?: string
    disabled?: boolean
    'aria-label'?: string
    [key: string]: unknown
  }) => {
    if (asChild) return <>{children}</>
    return (
      <button disabled={disabled} aria-label={ariaLabel} {...props}>
        {children}
      </button>
    )
  },
}))

import { EmptyCommunitiesState } from '@/components/communities/EmptyCommunitiesState'

describe('EmptyCommunitiesState', () => {
  it('renderiza el contenedor de estado vacío con data-testid correcto', () => {
    render(<EmptyCommunitiesState />)
    expect(screen.getByTestId('communities-empty-state')).toBeInTheDocument()
  })

  it('muestra el texto "Aún no perteneces a ninguna comunidad"', () => {
    render(<EmptyCommunitiesState />)
    const emptyState = screen.getByTestId('communities-empty-state')
    expect(emptyState).toHaveTextContent('Aún no perteneces a ninguna comunidad')
  })

  it('renderiza el CTA con data-testid btn-create-community', () => {
    render(<EmptyCommunitiesState />)
    expect(screen.getByTestId('btn-create-community')).toBeInTheDocument()
  })

  it('el CTA apunta a /communities/new', () => {
    render(<EmptyCommunitiesState />)
    const cta = screen.getByTestId('btn-create-community')
    expect(cta).toHaveAttribute('href', '/communities/new')
  })

  it('el CTA contiene el texto "Crear comunidad"', () => {
    render(<EmptyCommunitiesState />)
    expect(screen.getByTestId('btn-create-community')).toHaveTextContent('Crear comunidad')
  })
})
