// @vitest-environment jsdom
/**
 * Unit tests — Navbar (Story 9.5)
 * Verifica logo, nombre de usuario e icono logout con aria-label.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// ── Mocks ─────────────────────────────────────────────────────────────────────

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

// ── Import componente ─────────────────────────────────────────────────────────

import { Navbar } from '@/components/layout/Navbar'

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Navbar — Story 9.5: logo, nombre de usuario e icono logout', () => {
  it('renderiza el logo img con alt vacío (el texto "Proof Day" ya describe el enlace)', () => {
    render(<Navbar isAuthenticated={true} />)

    // alt="" + aria-hidden excluye la imagen del árbol de accesibilidad — se busca por atributo
    const logo = document.querySelector('img[src="/logo.png"]') as HTMLElement
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('alt', '')
  })

  it('muestra el nombre del usuario cuando se pasa userName', () => {
    render(<Navbar isAuthenticated={true} userName="Ana García" />)

    expect(screen.getByText('Ana García')).toBeInTheDocument()
  })

  it('el botón de logout tiene aria-label "Cerrar sesión"', () => {
    render(<Navbar isAuthenticated={true} onLogout={() => {}} />)

    const logoutButton = screen.getByRole('button', { name: 'Cerrar sesión' })
    expect(logoutButton).toBeInTheDocument()
    expect(logoutButton).toHaveAttribute('aria-label', 'Cerrar sesión')
  })

  it('el botón de logout NO muestra el texto visible "Cerrar sesión"', () => {
    render(<Navbar isAuthenticated={true} onLogout={() => {}} />)

    // El botón existe pero no tiene texto visible — solo el aria-label
    const logoutButton = screen.getByRole('button', { name: 'Cerrar sesión' })
    expect(logoutButton.textContent?.trim()).toBe('')
  })

  it('renderiza sin crash cuando no se pasa userName', () => {
    render(<Navbar isAuthenticated={true} />)

    // Comprobamos que el nav principal está presente
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    // y que no hay elemento con texto undefined o null
    expect(screen.queryByText('undefined')).not.toBeInTheDocument()
    expect(screen.queryByText('null')).not.toBeInTheDocument()
  })

  it('renderiza sin crash en estado no autenticado', () => {
    render(<Navbar isAuthenticated={false} />)

    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument()
  })
})
