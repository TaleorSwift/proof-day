// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

import ProfileError from '@/app/(app)/profile/error'

// ---------------------------------------------------------------------------
// Suite: ProfileError — renderizado
// ---------------------------------------------------------------------------

describe('ProfileError — renderizado', () => {
  it('muestra el título "Algo salió mal"', () => {
    const error = new Error('test error')
    const reset = vi.fn()

    render(<ProfileError error={error} reset={reset} />)

    expect(screen.getByText('Algo salió mal')).toBeInTheDocument()
  })

  it('muestra el mensaje descriptivo del error', () => {
    const error = new Error('test error')
    const reset = vi.fn()

    render(<ProfileError error={error} reset={reset} />)

    expect(
      screen.getByText(/No hemos podido cargar tu perfil/i)
    ).toBeInTheDocument()
  })

  it('muestra el botón "Reintentar"', () => {
    const error = new Error('test error')
    const reset = vi.fn()

    render(<ProfileError error={error} reset={reset} />)

    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: ProfileError — interacción
// ---------------------------------------------------------------------------

describe('ProfileError — interacción', () => {
  it('llama a reset al hacer click en "Reintentar"', () => {
    const error = new Error('test error')
    const reset = vi.fn()

    render(<ProfileError error={error} reset={reset} />)

    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }))

    expect(reset).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// Suite: ProfileError — logging del error
// ---------------------------------------------------------------------------

describe('ProfileError — logging del error', () => {
  it('llama a console.error con el error recibido al montar el componente', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('profile error') as Error & { digest?: string }
    error.digest = 'digest-123'
    const reset = vi.fn()

    render(<ProfileError error={error} reset={reset} />)

    expect(consoleSpy).toHaveBeenCalledWith(error)
    consoleSpy.mockRestore()
  })

  it('acepta error con digest opcional sin fallar', () => {
    const error = new Error('error sin digest') as Error & { digest?: string }
    const reset = vi.fn()

    expect(() => render(<ProfileError error={error} reset={reset} />)).not.toThrow()
  })
})
