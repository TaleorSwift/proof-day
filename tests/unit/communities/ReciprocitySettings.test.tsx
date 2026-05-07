// @vitest-environment jsdom
/**
 * Tests — ReciprocitySettings (Client Component)
 * Story 11.6: Admin puede configurar el umbral de reciprocidad de su comunidad.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mock del fetch global para simular PATCH /api/communities/[id]/settings
// ---------------------------------------------------------------------------

afterEach(() => {
  vi.restoreAllMocks()
})

function mockFetchSuccess(reciprocityThreshold: number) {
  vi.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      data: { id: 'community-1', reciprocityThreshold },
    }),
  } as Response)
}

function mockFetchError(status: number, error: string, code: string) {
  vi.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({ error, code }),
  } as Response)
}

// ---------------------------------------------------------------------------
// Import del componente (tras mocks)
// ---------------------------------------------------------------------------

import ReciprocitySettings from '@/components/communities/ReciprocitySettings'

// ---------------------------------------------------------------------------
// Suite: render inicial
// ---------------------------------------------------------------------------

describe('ReciprocitySettings — render inicial', () => {
  it('muestra el campo numérico con data-testid="reciprocity-threshold-input"', () => {
    render(
      <ReciprocitySettings communityId="community-1" currentThreshold={3} />
    )
    expect(
      screen.getByTestId('reciprocity-threshold-input')
    ).toBeInTheDocument()
  })

  it('muestra el valor actual de currentThreshold en el input', () => {
    render(
      <ReciprocitySettings communityId="community-1" currentThreshold={3} />
    )
    const input = screen.getByTestId('reciprocity-threshold-input')
    // toHaveValue con type=number espera number o null
    expect(input).toHaveValue(3)
  })

  it('muestra la label "Feedbacks mínimos para publicar"', () => {
    render(
      <ReciprocitySettings communityId="community-1" currentThreshold={3} />
    )
    expect(
      screen.getByText(/Feedbacks mínimos para publicar/i)
    ).toBeInTheDocument()
  })

  it('muestra el texto de ayuda sobre los 30 días y el valor 0', () => {
    render(
      <ReciprocitySettings communityId="community-1" currentThreshold={3} />
    )
    expect(
      screen.getByText(/Los miembros deben haber dado este número de feedbacks/i)
    ).toBeInTheDocument()
  })

  it('muestra el botón "Guardar" con data-testid="save-reciprocity-btn"', () => {
    render(
      <ReciprocitySettings communityId="community-1" currentThreshold={3} />
    )
    expect(screen.getByTestId('save-reciprocity-btn')).toBeInTheDocument()
    expect(screen.getByTestId('save-reciprocity-btn')).toHaveTextContent('Guardar')
  })

  it('el botón "Guardar" está habilitado con un valor válido inicial', () => {
    render(
      <ReciprocitySettings communityId="community-1" currentThreshold={3} />
    )
    expect(screen.getByTestId('save-reciprocity-btn')).not.toBeDisabled()
  })

  it('muestra el encabezado de sección "Reciprocidad"', () => {
    render(
      <ReciprocitySettings communityId="community-1" currentThreshold={3} />
    )
    expect(screen.getByText('Reciprocidad')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: validación de rango
// Usamos fireEvent.change para simular cambios de valor en input[type=number]
// de forma directa — userEvent.type tiene comportamiento especial en jsdom
// con type=number (no dispara onChange para valores intermedios como "-").
// ---------------------------------------------------------------------------

describe('ReciprocitySettings — validación de rango', () => {
  it('deshabilita el botón "Guardar" cuando el valor es menor que 0', () => {
    render(
      <ReciprocitySettings communityId="community-1" currentThreshold={3} />
    )
    const input = screen.getByTestId('reciprocity-threshold-input')
    fireEvent.change(input, { target: { value: '-1' } })

    expect(screen.getByTestId('save-reciprocity-btn')).toBeDisabled()
  })

  it('deshabilita el botón "Guardar" cuando el valor es mayor que 10', () => {
    render(
      <ReciprocitySettings communityId="community-1" currentThreshold={3} />
    )
    const input = screen.getByTestId('reciprocity-threshold-input')
    fireEvent.change(input, { target: { value: '11' } })

    expect(screen.getByTestId('save-reciprocity-btn')).toBeDisabled()
  })

  it('habilita el botón "Guardar" cuando el valor está en rango válido (5)', () => {
    render(
      <ReciprocitySettings communityId="community-1" currentThreshold={3} />
    )
    const input = screen.getByTestId('reciprocity-threshold-input')
    fireEvent.change(input, { target: { value: '5' } })

    expect(screen.getByTestId('save-reciprocity-btn')).not.toBeDisabled()
  })

  it('habilita el botón "Guardar" cuando el valor es 0 (gate desactivado)', () => {
    render(
      <ReciprocitySettings communityId="community-1" currentThreshold={3} />
    )
    const input = screen.getByTestId('reciprocity-threshold-input')
    fireEvent.change(input, { target: { value: '0' } })

    expect(screen.getByTestId('save-reciprocity-btn')).not.toBeDisabled()
  })

  it('habilita el botón "Guardar" cuando el valor es 10 (máximo)', () => {
    render(
      <ReciprocitySettings communityId="community-1" currentThreshold={3} />
    )
    const input = screen.getByTestId('reciprocity-threshold-input')
    fireEvent.change(input, { target: { value: '10' } })

    expect(screen.getByTestId('save-reciprocity-btn')).not.toBeDisabled()
  })
})

// ---------------------------------------------------------------------------
// Suite: submit y llamada al PATCH
// ---------------------------------------------------------------------------

describe('ReciprocitySettings — submit', () => {
  it('llama a PATCH /api/communities/[id]/settings con el valor correcto al hacer submit', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: 'community-1', reciprocityThreshold: 5 } }),
    } as Response)

    const user = userEvent.setup()
    render(
      <ReciprocitySettings communityId="community-1" currentThreshold={3} />
    )

    const input = screen.getByTestId('reciprocity-threshold-input')
    // Cambiamos el valor mediante fireEvent.change para evitar comportamiento especial de type=number
    fireEvent.change(input, { target: { value: '5' } })
    await user.click(screen.getByTestId('save-reciprocity-btn'))

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/communities/community-1/settings',
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ reciprocityThreshold: 5 }),
        })
      )
    })
  })

  it('muestra feedback visual con data-testid="reciprocity-saved-feedback" tras guardar con éxito', async () => {
    mockFetchSuccess(5)
    const user = userEvent.setup()
    render(
      <ReciprocitySettings communityId="community-1" currentThreshold={3} />
    )

    // El valor inicial es 3 (válido), así que directamente hacemos click en Guardar
    await user.click(screen.getByTestId('save-reciprocity-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('reciprocity-saved-feedback')).toBeInTheDocument()
    })
  })

  it('muestra "Guardando..." en el botón mientras se envía la petición', async () => {
    vi.spyOn(global, 'fetch').mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ data: { id: 'c1', reciprocityThreshold: 5 } }),
      } as Response), 100))
    )

    const user = userEvent.setup()
    render(
      <ReciprocitySettings communityId="community-1" currentThreshold={3} />
    )

    await user.click(screen.getByTestId('save-reciprocity-btn'))

    expect(screen.getByTestId('save-reciprocity-btn')).toHaveTextContent('Guardando...')
  })

  it('el botón está deshabilitado mientras se guarda (isSaving)', async () => {
    vi.spyOn(global, 'fetch').mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ data: { id: 'c1', reciprocityThreshold: 5 } }),
      } as Response), 100))
    )

    const user = userEvent.setup()
    render(
      <ReciprocitySettings communityId="community-1" currentThreshold={3} />
    )

    await user.click(screen.getByTestId('save-reciprocity-btn'))

    expect(screen.getByTestId('save-reciprocity-btn')).toBeDisabled()
  })
})

// ---------------------------------------------------------------------------
// Suite: manejo de errores
// ---------------------------------------------------------------------------

describe('ReciprocitySettings — manejo de errores', () => {
  it('muestra mensaje de error cuando el PATCH falla con 403', async () => {
    mockFetchError(403, 'Solo el admin puede cambiar esta configuración', 'FORBIDDEN')
    const user = userEvent.setup()
    render(
      <ReciprocitySettings communityId="community-1" currentThreshold={3} />
    )

    await user.click(screen.getByTestId('save-reciprocity-btn'))

    await waitFor(() => {
      expect(
        screen.getByText(/Solo el admin puede cambiar esta configuración/i)
      ).toBeInTheDocument()
    })
  })

  it('muestra el mensaje del error cuando el PATCH falla con error de red', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'))
    const user = userEvent.setup()
    render(
      <ReciprocitySettings communityId="community-1" currentThreshold={3} />
    )

    await user.click(screen.getByTestId('save-reciprocity-btn'))

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument()
    })
  })
})
