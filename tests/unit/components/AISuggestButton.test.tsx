// @vitest-environment jsdom
// Story 13.7 — Tests del componente AISuggestButton
// TDD Outside-In: tests escritos ANTES de la implementación
//
// Comportamientos cubiertos:
//   - Renderiza habilitado cuando context.title no está vacío
//   - Renderiza deshabilitado cuando context.title === ''
//   - Muestra spinner durante la llamada a la API (estado loading)
//   - Llama a onSuggestion con el texto retornado por la API
//   - No llama a onSuggestion si la API devuelve error

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mock global fetch
// ---------------------------------------------------------------------------

const mockFetch = vi.fn()
global.fetch = mockFetch

// ---------------------------------------------------------------------------
// Import del componente — DESPUÉS de los mocks
// ---------------------------------------------------------------------------

import { AISuggestButton } from '@/components/projects/wizard/AISuggestButton'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const defaultProps = {
  field: 'problem' as const,
  context: {
    title: 'Mi proyecto',
    problem: '',
    solution: '',
  },
  onSuggestion: vi.fn(),
}

const disabledProps = {
  ...defaultProps,
  context: {
    ...defaultProps.context,
    title: '',
  },
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('AISuggestButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renderiza habilitado cuando context.title no está vacío', () => {
    render(<AISuggestButton {...defaultProps} />)
    const button = screen.getByRole('button')
    expect(button).not.toBeDisabled()
  })

  it('renderiza deshabilitado cuando context.title está vacío', () => {
    render(<AISuggestButton {...disabledProps} />)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('muestra spinner durante la llamada a la API', async () => {
    // La promesa no resuelve de inmediato — simula estado loading
    let resolveFetch: (value: unknown) => void
    mockFetch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = resolve
      })
    )

    render(<AISuggestButton {...defaultProps} />)
    const button = screen.getByRole('button')
    fireEvent.click(button)

    // El botón debe estar deshabilitado mientras carga
    expect(button).toBeDisabled()
    // El spinner debe estar presente
    expect(screen.getByTestId('ai-suggest-spinner')).toBeInTheDocument()

    // Resolver para limpiar
    resolveFetch!({
      ok: true,
      json: async () => ({ suggestion: 'texto' }),
    })
  })

  it('llama a onSuggestion con el texto retornado por la API', async () => {
    const onSuggestion = vi.fn()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestion: 'Sugerencia generada por IA' }),
    })

    render(<AISuggestButton {...defaultProps} onSuggestion={onSuggestion} />)
    const button = screen.getByRole('button')
    await userEvent.click(button)

    await waitFor(() => {
      expect(onSuggestion).toHaveBeenCalledWith('Sugerencia generada por IA')
    })
  })

  it('no llama a onSuggestion si la API devuelve error', async () => {
    const onSuggestion = vi.fn()
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'AI_UNAVAILABLE' }),
    })

    render(<AISuggestButton {...defaultProps} onSuggestion={onSuggestion} />)
    const button = screen.getByRole('button')
    await userEvent.click(button)

    await waitFor(() => {
      expect(onSuggestion).not.toHaveBeenCalled()
    })
  })

  it('muestra texto "Sugerir con IA" en el botón habilitado', () => {
    render(<AISuggestButton {...defaultProps} />)
    expect(screen.getByText(/sugerir con ia/i)).toBeInTheDocument()
  })

  it('vuelve al estado habilitado tras recibir respuesta de la API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestion: 'Texto generado' }),
    })

    render(<AISuggestButton {...defaultProps} />)
    const button = screen.getByRole('button')
    await userEvent.click(button)

    await waitFor(() => {
      expect(button).not.toBeDisabled()
    })
  })

  it('muestra mensaje de error cuando la API retorna 503', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({ error: 'AI_UNAVAILABLE' }),
    })

    render(<AISuggestButton {...defaultProps} />)
    const button = screen.getByRole('button')
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByTestId('ai-suggest-error')).toBeInTheDocument()
      expect(screen.getByTestId('ai-suggest-error')).toHaveTextContent(
        'Error al generar sugerencia'
      )
    })
  })

  it('muestra mensaje de error cuando la llamada a fetch lanza una excepción', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<AISuggestButton {...defaultProps} />)
    const button = screen.getByRole('button')
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByTestId('ai-suggest-error')).toBeInTheDocument()
      expect(screen.getByTestId('ai-suggest-error')).toHaveTextContent(
        'Error al generar sugerencia'
      )
    })
  })
})
