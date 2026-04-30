// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks — declarados ANTES de los imports del componente bajo test
// ---------------------------------------------------------------------------

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// ---------------------------------------------------------------------------
// Import del componente bajo test
// ---------------------------------------------------------------------------

import { InviteAlreadyMemberState } from '@/components/invitations/InviteAlreadyMemberState'

// ---------------------------------------------------------------------------
// Suite: InviteAlreadyMemberState
// ---------------------------------------------------------------------------

describe('InviteAlreadyMemberState — encabezado', () => {
  it('renderiza el título "Ya eres miembro de esta comunidad"', () => {
    render(<InviteAlreadyMemberState />)
    expect(screen.getByRole('heading', { name: 'Ya eres miembro de esta comunidad' })).toBeInTheDocument()
  })
})

describe('InviteAlreadyMemberState — mensaje informativo', () => {
  it('muestra el mensaje indicando que ya forma parte de la comunidad', () => {
    render(<InviteAlreadyMemberState />)
    expect(screen.getByText('Ya formas parte de esta comunidad. Puedes acceder directamente.')).toBeInTheDocument()
  })
})

describe('InviteAlreadyMemberState — enlace a comunidades', () => {
  it('renderiza el enlace "Ver mis comunidades"', () => {
    render(<InviteAlreadyMemberState />)
    expect(screen.getByRole('link', { name: 'Ver mis comunidades' })).toBeInTheDocument()
  })

  it('enlaza a la ruta /communities', () => {
    render(<InviteAlreadyMemberState />)
    expect(screen.getByRole('link', { name: 'Ver mis comunidades' })).toHaveAttribute('href', '/communities')
  })
})
