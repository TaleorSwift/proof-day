// @vitest-environment jsdom
/**
 * Tests — DecisionDialog (components/projects/DecisionDialog.tsx)
 * Cubre: render del diálogo, opciones de decisión, flujo de selección y confirmación,
 * estado de carga, errores y cierre del diálogo.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks hoisted
// ---------------------------------------------------------------------------

const { mockRegisterDecision } = vi.hoisted(() => ({
  mockRegisterDecision: vi.fn(),
}))

vi.mock('@/lib/api/projects', () => ({
  registerDecision: mockRegisterDecision,
}))

import { DecisionDialog } from '@/components/projects/DecisionDialog'
import type { ProjectDecision } from '@/lib/types/projects'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PROJECT_ID = 'p0000000-0000-4000-8000-000000000001'

function renderDialog(overrides: {
  isOpen?: boolean
  onClose?: () => void
  onSuccess?: (d: ProjectDecision) => void
} = {}) {
  const props = {
    projectId: PROJECT_ID,
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    ...overrides,
  }
  return { ...render(<DecisionDialog {...props} />), props }
}

// ---------------------------------------------------------------------------
// Render básico
// ---------------------------------------------------------------------------

describe('DecisionDialog — render', () => {
  afterEach(() => vi.clearAllMocks())

  it('muestra el título "Registrar tu decisión" cuando isOpen=true', () => {
    renderDialog()
    expect(screen.getByText('Registrar tu decisión')).toBeInTheDocument()
  })

  it('no muestra el diálogo cuando isOpen=false', () => {
    renderDialog({ isOpen: false })
    expect(screen.queryByText('Registrar tu decisión')).not.toBeInTheDocument()
  })

  it('muestra la descripción de irreversibilidad', () => {
    renderDialog()
    expect(screen.getByText(/esta acción es irreversible/i)).toBeInTheDocument()
  })

  it('muestra el botón "Cancelar"', () => {
    renderDialog()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
  })

  it('muestra el botón "Confirmar decision"', () => {
    renderDialog()
    expect(screen.getByRole('button', { name: /confirmar decision/i })).toBeInTheDocument()
  })

  it('el botón "Confirmar decision" está deshabilitado si no hay decisión seleccionada', () => {
    renderDialog()
    expect(screen.getByRole('button', { name: /confirmar decision/i })).toBeDisabled()
  })
})

// ---------------------------------------------------------------------------
// Opciones de decisión
// ---------------------------------------------------------------------------

describe('DecisionDialog — opciones de decisión', () => {
  afterEach(() => vi.clearAllMocks())

  it('muestra la opción "Iterar"', () => {
    renderDialog()
    expect(screen.getByText('Iterar')).toBeInTheDocument()
  })

  it('muestra la opción "Escalar"', () => {
    renderDialog()
    expect(screen.getByText('Escalar')).toBeInTheDocument()
  })

  it('muestra la opción "Abandonar"', () => {
    renderDialog()
    expect(screen.getByText('Abandonar')).toBeInTheDocument()
  })

  it('muestra la descripción de cada opción', () => {
    renderDialog()
    expect(screen.getByText('Refinando la propuesta')).toBeInTheDocument()
    expect(screen.getByText('Llevando la idea adelante')).toBeInTheDocument()
    expect(screen.getByText('Desarrollo detenido')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Selección de decisión
// ---------------------------------------------------------------------------

describe('DecisionDialog — selección de decisión', () => {
  afterEach(() => vi.clearAllMocks())

  it('al seleccionar una opción el botón "Confirmar decision" se habilita', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByText('Iterar'))

    expect(screen.getByRole('button', { name: /confirmar decision/i })).not.toBeDisabled()
  })

  it('se puede seleccionar la opción "Iterar"', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByText('Iterar'))

    expect(screen.getByRole('button', { name: /confirmar decision/i })).not.toBeDisabled()
  })

  it('se puede seleccionar la opción "Escalar"', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByText('Escalar'))

    expect(screen.getByRole('button', { name: /confirmar decision/i })).not.toBeDisabled()
  })

  it('se puede seleccionar la opción "Abandonar"', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByText('Abandonar'))

    expect(screen.getByRole('button', { name: /confirmar decision/i })).not.toBeDisabled()
  })
})

// ---------------------------------------------------------------------------
// Flujo de confirmación exitosa
// ---------------------------------------------------------------------------

describe('DecisionDialog — confirmación exitosa', () => {
  afterEach(() => vi.clearAllMocks())

  it('llama a registerDecision con projectId e "iterate" al confirmar "Iterar"', async () => {
    mockRegisterDecision.mockResolvedValue({})
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByText('Iterar'))
    await user.click(screen.getByRole('button', { name: /confirmar decision/i }))

    await waitFor(() => {
      expect(mockRegisterDecision).toHaveBeenCalledWith(PROJECT_ID, 'iterate')
    })
  })

  it('llama a registerDecision con "scale" al confirmar "Escalar"', async () => {
    mockRegisterDecision.mockResolvedValue({})
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByText('Escalar'))
    await user.click(screen.getByRole('button', { name: /confirmar decision/i }))

    await waitFor(() => {
      expect(mockRegisterDecision).toHaveBeenCalledWith(PROJECT_ID, 'scale')
    })
  })

  it('llama a registerDecision con "abandon" al confirmar "Abandonar"', async () => {
    mockRegisterDecision.mockResolvedValue({})
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByText('Abandonar'))
    await user.click(screen.getByRole('button', { name: /confirmar decision/i }))

    await waitFor(() => {
      expect(mockRegisterDecision).toHaveBeenCalledWith(PROJECT_ID, 'abandon')
    })
  })

  it('llama a onSuccess con la decisión correcta tras confirmación exitosa', async () => {
    mockRegisterDecision.mockResolvedValue({})
    const onSuccess = vi.fn()
    const user = userEvent.setup()
    render(
      <DecisionDialog
        projectId={PROJECT_ID}
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />
    )

    await user.click(screen.getByText('Iterar'))
    await user.click(screen.getByRole('button', { name: /confirmar decision/i }))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('iterate')
    })
  })

  it('llama a onClose tras confirmación exitosa', async () => {
    mockRegisterDecision.mockResolvedValue({})
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(
      <DecisionDialog
        projectId={PROJECT_ID}
        isOpen={true}
        onClose={onClose}
        onSuccess={vi.fn()}
      />
    )

    await user.click(screen.getByText('Escalar'))
    await user.click(screen.getByRole('button', { name: /confirmar decision/i }))

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
  })
})

// ---------------------------------------------------------------------------
// Estado de carga
// ---------------------------------------------------------------------------

describe('DecisionDialog — estado de carga', () => {
  afterEach(() => vi.clearAllMocks())

  it('muestra "Confirmando..." en el botón mientras se procesa', async () => {
    let resolveDecision!: (value: unknown) => void
    mockRegisterDecision.mockImplementation(
      () => new Promise((res) => { resolveDecision = res })
    )
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByText('Iterar'))
    await user.click(screen.getByRole('button', { name: /confirmar decision/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirmando.../i })).toBeInTheDocument()
    })

    resolveDecision({})
  })

  it('el botón "Confirmar decision" está deshabilitado mientras se procesa', async () => {
    let resolveDecision!: (value: unknown) => void
    mockRegisterDecision.mockImplementation(
      () => new Promise((res) => { resolveDecision = res })
    )
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByText('Iterar'))
    await user.click(screen.getByRole('button', { name: /confirmar decision/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirmando.../i })).toBeDisabled()
    })

    resolveDecision({})
  })

  it('el botón "Cancelar" está deshabilitado mientras se procesa', async () => {
    let resolveDecision!: (value: unknown) => void
    mockRegisterDecision.mockImplementation(
      () => new Promise((res) => { resolveDecision = res })
    )
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByText('Iterar'))
    await user.click(screen.getByRole('button', { name: /confirmar decision/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled()
    })

    resolveDecision({})
  })
})

// ---------------------------------------------------------------------------
// Manejo de errores
// ---------------------------------------------------------------------------

describe('DecisionDialog — manejo de errores', () => {
  afterEach(() => vi.clearAllMocks())

  it('muestra el mensaje de error cuando registerDecision lanza excepción', async () => {
    mockRegisterDecision.mockRejectedValue(new Error('Error de servidor'))
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByText('Iterar'))
    await user.click(screen.getByRole('button', { name: /confirmar decision/i }))

    await waitFor(() => {
      expect(screen.getByText('Error de servidor')).toBeInTheDocument()
    })
  })

  it('no llama a onSuccess ni a onClose cuando hay un error', async () => {
    mockRegisterDecision.mockRejectedValue(new Error('Error de servidor'))
    const onSuccess = vi.fn()
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(
      <DecisionDialog
        projectId={PROJECT_ID}
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    )

    await user.click(screen.getByText('Escalar'))
    await user.click(screen.getByRole('button', { name: /confirmar decision/i }))

    await waitFor(() => {
      expect(screen.getByText('Error de servidor')).toBeInTheDocument()
    })
    expect(onSuccess).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('el botón "Confirmar decision" vuelve a habilitarse tras recibir un error', async () => {
    mockRegisterDecision.mockRejectedValue(new Error('Fallo'))
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByText('Iterar'))
    await user.click(screen.getByRole('button', { name: /confirmar decision/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirmar decision/i })).not.toBeDisabled()
    })
  })
})

// ---------------------------------------------------------------------------
// Cierre del diálogo
// ---------------------------------------------------------------------------

describe('DecisionDialog — cierre del diálogo', () => {
  afterEach(() => vi.clearAllMocks())

  it('llama a onClose al hacer click en el botón "Cancelar"', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(
      <DecisionDialog
        projectId={PROJECT_ID}
        isOpen={true}
        onClose={onClose}
        onSuccess={vi.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(onClose).toHaveBeenCalled()
  })
})
