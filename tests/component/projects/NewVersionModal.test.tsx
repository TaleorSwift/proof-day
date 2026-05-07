// @vitest-environment jsdom
/**
 * Story 13.2 — Tests TDD Outside-In: NewVersionModal
 * Task 8 — Tests del componente NewVersionModal
 * Cubre: render con valores pre-rellenados, cancelar, submit, loading, éxito, error, a11y.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks hoisted
// ---------------------------------------------------------------------------

const { mockPublishIteration } = vi.hoisted(() => ({
  mockPublishIteration: vi.fn(),
}))

vi.mock('@/lib/api/project-iterations', () => ({
  publishIteration: mockPublishIteration,
}))

import { NewVersionModal } from '@/components/projects/NewVersionModal'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PROJECT_ID = 'project-uuid-001'

const DEFAULT_PROPS = {
  projectId: PROJECT_ID,
  initialTitle: 'Mi proyecto inicial',
  initialDescription: 'Descripción inicial del proyecto',
  initialHypothesis: 'Hipótesis inicial en juego',
  onSuccess: vi.fn(),
  onClose: vi.fn(),
}

function renderModal(overrides: Partial<typeof DEFAULT_PROPS> = {}) {
  const props = { ...DEFAULT_PROPS, onSuccess: vi.fn(), onClose: vi.fn(), ...overrides }
  return { ...render(<NewVersionModal {...props} />), props }
}

// ---------------------------------------------------------------------------
// Suite: render con valores pre-rellenados
// ---------------------------------------------------------------------------

describe('NewVersionModal — render con valores pre-rellenados', () => {
  afterEach(() => vi.clearAllMocks())

  it('renderiza el modal con data-testid correcto', () => {
    renderModal()
    expect(screen.getByTestId('new-version-modal')).toBeInTheDocument()
  })

  it('muestra el campo título pre-rellenado con el valor inicial', () => {
    renderModal()
    const titleInput = screen.getByTestId('new-version-title')
    expect(titleInput).toHaveValue(DEFAULT_PROPS.initialTitle)
  })

  it('muestra el campo descripción pre-rellenado con el valor inicial', () => {
    renderModal()
    expect(screen.getByDisplayValue(DEFAULT_PROPS.initialDescription)).toBeInTheDocument()
  })

  it('muestra el campo hipótesis pre-rellenado con el valor inicial', () => {
    renderModal()
    expect(screen.getByDisplayValue(DEFAULT_PROPS.initialHypothesis)).toBeInTheDocument()
  })

  it('muestra el botón "Publicar versión"', () => {
    renderModal()
    expect(screen.getByTestId('new-version-submit')).toBeInTheDocument()
  })

  it('muestra el botón "Cancelar"', () => {
    renderModal()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: accesibilidad
// ---------------------------------------------------------------------------

describe('NewVersionModal — accesibilidad', () => {
  afterEach(() => vi.clearAllMocks())

  it('tiene role="dialog"', () => {
    renderModal()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('tiene aria-modal="true"', () => {
    renderModal()
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('tiene aria-labelledby apuntando al heading del modal', () => {
    renderModal()
    const dialog = screen.getByRole('dialog')
    const labelledBy = dialog.getAttribute('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    const heading = document.getElementById(labelledBy!)
    expect(heading).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: cancelar
// ---------------------------------------------------------------------------

describe('NewVersionModal — cancelar', () => {
  afterEach(() => vi.clearAllMocks())

  it('llama a onClose al hacer click en "Cancelar"', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    renderModal({ onClose })

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('no llama a publishIteration al cancelar', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(mockPublishIteration).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Suite: submit exitoso
// ---------------------------------------------------------------------------

describe('NewVersionModal — submit exitoso', () => {
  afterEach(() => vi.clearAllMocks())

  it('llama a publishIteration con los datos del formulario al hacer submit', async () => {
    mockPublishIteration.mockResolvedValue({ versionNumber: 1 })
    const user = userEvent.setup()
    renderModal()

    await user.click(screen.getByTestId('new-version-submit'))

    await waitFor(() => {
      expect(mockPublishIteration).toHaveBeenCalledWith(
        PROJECT_ID,
        expect.objectContaining({
          title: DEFAULT_PROPS.initialTitle,
          description: DEFAULT_PROPS.initialDescription,
          hypothesis: DEFAULT_PROPS.initialHypothesis,
        })
      )
    })
  })

  it('llama a publishIteration con el projectId correcto', async () => {
    mockPublishIteration.mockResolvedValue({ versionNumber: 2 })
    const user = userEvent.setup()
    renderModal()

    await user.click(screen.getByTestId('new-version-submit'))

    await waitFor(() => {
      expect(mockPublishIteration).toHaveBeenCalledWith(PROJECT_ID, expect.anything())
    })
  })

  it('llama a onSuccess con el versionNumber tras éxito', async () => {
    mockPublishIteration.mockResolvedValue({ versionNumber: 3 })
    const onSuccess = vi.fn()
    const user = userEvent.setup()
    renderModal({ onSuccess })

    await user.click(screen.getByTestId('new-version-submit'))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(3)
    })
  })

  it('llama a publishIteration con los valores editados si el usuario modifica los campos', async () => {
    mockPublishIteration.mockResolvedValue({ versionNumber: 1 })
    const user = userEvent.setup()
    renderModal()

    const titleInput = screen.getByTestId('new-version-title')
    await user.clear(titleInput)
    await user.type(titleInput, 'Título modificado')

    await user.click(screen.getByTestId('new-version-submit'))

    await waitFor(() => {
      expect(mockPublishIteration).toHaveBeenCalledWith(
        PROJECT_ID,
        expect.objectContaining({ title: 'Título modificado' })
      )
    })
  })
})

// ---------------------------------------------------------------------------
// Suite: estado de loading
// ---------------------------------------------------------------------------

describe('NewVersionModal — estado de loading', () => {
  afterEach(() => vi.clearAllMocks())

  it('muestra "Publicando..." en el botón mientras se procesa', async () => {
    let resolve!: (v: unknown) => void
    mockPublishIteration.mockImplementation(() => new Promise((res) => { resolve = res }))
    const user = userEvent.setup()
    renderModal()

    await user.click(screen.getByTestId('new-version-submit'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /publicando.../i })).toBeInTheDocument()
    })

    resolve({ versionNumber: 1 })
  })

  it('el botón submit está deshabilitado durante el loading', async () => {
    let resolve!: (v: unknown) => void
    mockPublishIteration.mockImplementation(() => new Promise((res) => { resolve = res }))
    const user = userEvent.setup()
    renderModal()

    await user.click(screen.getByTestId('new-version-submit'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /publicando.../i })).toBeDisabled()
    })

    resolve({ versionNumber: 1 })
  })
})

// ---------------------------------------------------------------------------
// Suite: manejo de errores
// ---------------------------------------------------------------------------

describe('NewVersionModal — manejo de errores', () => {
  afterEach(() => vi.clearAllMocks())

  it('muestra el mensaje de error cuando publishIteration falla', async () => {
    mockPublishIteration.mockRejectedValue(new Error('ITERATION_CREATE_ERROR'))
    const user = userEvent.setup()
    renderModal()

    await user.click(screen.getByTestId('new-version-submit'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(screen.getByText(/ITERATION_CREATE_ERROR/)).toBeInTheDocument()
  })

  it('no llama a onSuccess cuando hay un error', async () => {
    mockPublishIteration.mockRejectedValue(new Error('Error de servidor'))
    const onSuccess = vi.fn()
    const user = userEvent.setup()
    renderModal({ onSuccess })

    await user.click(screen.getByTestId('new-version-submit'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('el modal permanece abierto tras un error (no llama a onClose)', async () => {
    mockPublishIteration.mockRejectedValue(new Error('Fallo'))
    const onClose = vi.fn()
    const user = userEvent.setup()
    renderModal({ onClose })

    await user.click(screen.getByTestId('new-version-submit'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(onClose).not.toHaveBeenCalled()
  })
})
