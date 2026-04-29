// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks — declarados ANTES de los imports del componente bajo test
// ---------------------------------------------------------------------------

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockSignOut = vi.fn().mockResolvedValue({})

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { signOut: mockSignOut },
  }),
}))

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// ---------------------------------------------------------------------------
// Import del componente bajo test
// ---------------------------------------------------------------------------

import { NavbarClient } from '@/components/layout/NavbarClient'

// ---------------------------------------------------------------------------
// Suite: renderizado
// ---------------------------------------------------------------------------

describe('NavbarClient — renderizado', () => {
  it('renderiza el componente sin errores cuando el usuario está autenticado', () => {
    render(<NavbarClient isAuthenticated={true} />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renderiza el componente sin errores cuando el usuario no está autenticado', () => {
    render(<NavbarClient isAuthenticated={false} />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('muestra el nombre de usuario cuando se proporciona', () => {
    render(<NavbarClient isAuthenticated={true} userName="Javi López" />)
    expect(screen.getByText('Javi López')).toBeInTheDocument()
  })

  it('muestra "Iniciar sesión" cuando el usuario no está autenticado', () => {
    render(<NavbarClient isAuthenticated={false} />)
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: logout
// ---------------------------------------------------------------------------

describe('NavbarClient — logout', () => {
  it('llama a signOut al hacer click en el botón de cerrar sesión', async () => {
    render(<NavbarClient isAuthenticated={true} />)
    const logoutButton = screen.getByRole('button', { name: 'Cerrar sesión' })
    fireEvent.click(logoutButton)
    await vi.waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1)
    })
  })

  it('redirige a /login tras cerrar sesión', async () => {
    render(<NavbarClient isAuthenticated={true} />)
    const logoutButton = screen.getByRole('button', { name: 'Cerrar sesión' })
    fireEvent.click(logoutButton)
    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })
})
