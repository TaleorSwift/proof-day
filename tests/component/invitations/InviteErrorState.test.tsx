// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks — declarados ANTES de los imports del componente bajo test
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Import del componente bajo test
// ---------------------------------------------------------------------------

import { InviteErrorState } from '@/components/invitations/InviteErrorState'

// ---------------------------------------------------------------------------
// Suite: InviteErrorState
// ---------------------------------------------------------------------------

describe('InviteErrorState — encabezado', () => {
  it('renderiza el título "Link inválido"', () => {
    render(<InviteErrorState message="Este link ya no es válido" />)
    expect(screen.getByRole('heading', { name: 'Link inválido' })).toBeInTheDocument()
  })
})

describe('InviteErrorState — mensaje de error', () => {
  it('renderiza el mensaje de error recibido por props', () => {
    render(<InviteErrorState message="Este link ya no es válido" />)
    expect(screen.getByText('Este link ya no es válido')).toBeInTheDocument()
  })

  it('renderiza un mensaje de error distinto cuando se pasa otro valor', () => {
    render(<InviteErrorState message="Error al procesar el link. Por favor, inténtalo de nuevo." />)
    expect(screen.getByText('Error al procesar el link. Por favor, inténtalo de nuevo.')).toBeInTheDocument()
  })
})

describe('InviteErrorState — instrucciones al usuario', () => {
  it('muestra la instrucción para solicitar un nuevo link', () => {
    render(<InviteErrorState message="Token expirado" />)
    expect(
      screen.getByText('Solicita un nuevo link de invitación al administrador de la comunidad.')
    ).toBeInTheDocument()
  })
})
