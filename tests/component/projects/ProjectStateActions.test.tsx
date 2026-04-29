// @vitest-environment jsdom
/**
 * Tests — ProjectStateActions (components/projects/ProjectStateActions.tsx)
 * Cubre: flujo draft→publicar (con confirmación), live→inactivo, inactive→publicar,
 * y el caso isBuilder: false (no renderiza nada).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks hoisted
// ---------------------------------------------------------------------------

const { mockPublishProject, mockDeactivateProject } = vi.hoisted(() => ({
  mockPublishProject: vi.fn(),
  mockDeactivateProject: vi.fn(),
}))

vi.mock('@/lib/api/projects', () => ({
  publishProject: mockPublishProject,
  deactivateProject: mockDeactivateProject,
}))

import { ProjectStateActions } from '@/components/projects/ProjectStateActions'
import type { ProjectStatus } from '@/lib/types/projects'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PROJECT_ID = 'p0000000-0000-4000-8000-000000000001'

function renderAcciones(
  status: ProjectStatus,
  isBuilder = true,
  onStatusChange = vi.fn()
) {
  return render(
    <ProjectStateActions
      projectId={PROJECT_ID}
      currentStatus={status}
      isBuilder={isBuilder}
      onStatusChange={onStatusChange}
    />
  )
}

// ---------------------------------------------------------------------------
// isBuilder: false — no renderiza nada
// ---------------------------------------------------------------------------

describe('ProjectStateActions — isBuilder: false', () => {
  it('no renderiza ningún botón cuando isBuilder es false', () => {
    const { container } = renderAcciones('draft', false)
    expect(container).toBeEmptyDOMElement()
  })

  it('no renderiza ningún botón con status live cuando isBuilder es false', () => {
    const { container } = renderAcciones('live', false)
    expect(container).toBeEmptyDOMElement()
  })
})

// ---------------------------------------------------------------------------
// Estado draft — flujo con confirmación
// ---------------------------------------------------------------------------

describe('ProjectStateActions — estado draft', () => {
  afterEach(() => vi.clearAllMocks())

  it('muestra el botón "Publicar" en estado draft', () => {
    renderAcciones('draft')
    expect(screen.getByRole('button', { name: /^publicar$/i })).toBeInTheDocument()
  })

  it('no muestra el panel de confirmación inicialmente', () => {
    renderAcciones('draft')
    expect(screen.queryByText(/¿listo para compartir/i)).not.toBeInTheDocument()
  })

  it('al hacer click en "Publicar" muestra el panel de confirmación', async () => {
    const user = userEvent.setup()
    renderAcciones('draft')

    await user.click(screen.getByRole('button', { name: /^publicar$/i }))

    expect(screen.getByText(/¿listo para compartir/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /publicar ahora/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
  })

  it('al hacer click en "Cancelar" en el panel vuelve al estado inicial', async () => {
    const user = userEvent.setup()
    renderAcciones('draft')

    await user.click(screen.getByRole('button', { name: /^publicar$/i }))
    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(screen.queryByText(/¿listo para compartir/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^publicar$/i })).toBeInTheDocument()
  })

  it('al confirmar llama a publishProject con el projectId correcto', async () => {
    mockPublishProject.mockResolvedValue({})
    const user = userEvent.setup()
    renderAcciones('draft')

    await user.click(screen.getByRole('button', { name: /^publicar$/i }))
    await user.click(screen.getByRole('button', { name: /publicar ahora/i }))

    await waitFor(() => {
      expect(mockPublishProject).toHaveBeenCalledWith(PROJECT_ID)
    })
  })

  it('al confirmar con éxito llama a onStatusChange con "live"', async () => {
    mockPublishProject.mockResolvedValue({})
    const onStatusChange = vi.fn()
    const user = userEvent.setup()
    render(
      <ProjectStateActions
        projectId={PROJECT_ID}
        currentStatus="draft"
        isBuilder={true}
        onStatusChange={onStatusChange}
      />
    )

    await user.click(screen.getByRole('button', { name: /^publicar$/i }))
    await user.click(screen.getByRole('button', { name: /publicar ahora/i }))

    await waitFor(() => {
      expect(onStatusChange).toHaveBeenCalledWith('live')
    })
  })

  it('tras publicar con éxito desde draft el panel de confirmación desaparece', async () => {
    mockPublishProject.mockResolvedValue({})
    const user = userEvent.setup()
    renderAcciones('draft')

    await user.click(screen.getByRole('button', { name: /^publicar$/i }))
    await user.click(screen.getByRole('button', { name: /publicar ahora/i }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /publicar ahora/i })).not.toBeInTheDocument()
    })
  })

  it('muestra el botón deshabilitado con texto "Publicando..." mientras se procesa', async () => {
    let resolvePublish!: (value: unknown) => void
    mockPublishProject.mockImplementation(
      () => new Promise((res) => { resolvePublish = res })
    )
    const user = userEvent.setup()
    renderAcciones('draft')

    await user.click(screen.getByRole('button', { name: /^publicar$/i }))
    await user.click(screen.getByRole('button', { name: /publicar ahora/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /publicando.../i })).toBeDisabled()
    })

    resolvePublish({})
  })

  it('muestra un mensaje de error en role="alert" cuando publishProject lanza excepción', async () => {
    mockPublishProject.mockRejectedValue(new Error('Error de red'))
    const user = userEvent.setup()
    renderAcciones('draft')

    await user.click(screen.getByRole('button', { name: /^publicar$/i }))
    await user.click(screen.getByRole('button', { name: /publicar ahora/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error de red')
    })
  })

  it('no llama a deactivateProject desde estado draft', async () => {
    mockPublishProject.mockResolvedValue({})
    const user = userEvent.setup()
    renderAcciones('draft')

    await user.click(screen.getByRole('button', { name: /^publicar$/i }))
    await user.click(screen.getByRole('button', { name: /publicar ahora/i }))

    await waitFor(() => expect(mockPublishProject).toHaveBeenCalled())
    expect(mockDeactivateProject).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Estado live — marcar como inactivo
// ---------------------------------------------------------------------------

describe('ProjectStateActions — estado live', () => {
  afterEach(() => vi.clearAllMocks())

  it('muestra el botón "Marcar como inactivo" en estado live', () => {
    renderAcciones('live')
    expect(screen.getByRole('button', { name: /marcar como inactivo/i })).toBeInTheDocument()
  })

  it('no muestra el botón "Publicar" en estado live', () => {
    renderAcciones('live')
    expect(screen.queryByRole('button', { name: /^publicar$/i })).not.toBeInTheDocument()
  })

  it('al hacer click llama a deactivateProject con el projectId correcto', async () => {
    mockDeactivateProject.mockResolvedValue({})
    const user = userEvent.setup()
    renderAcciones('live')

    await user.click(screen.getByRole('button', { name: /marcar como inactivo/i }))

    await waitFor(() => {
      expect(mockDeactivateProject).toHaveBeenCalledWith(PROJECT_ID)
    })
  })

  it('llama a onStatusChange con "inactive" tras desactivar con éxito', async () => {
    mockDeactivateProject.mockResolvedValue({})
    const onStatusChange = vi.fn()
    const user = userEvent.setup()
    render(
      <ProjectStateActions
        projectId={PROJECT_ID}
        currentStatus="live"
        isBuilder={true}
        onStatusChange={onStatusChange}
      />
    )

    await user.click(screen.getByRole('button', { name: /marcar como inactivo/i }))

    await waitFor(() => {
      expect(onStatusChange).toHaveBeenCalledWith('inactive')
    })
  })

  it('muestra el botón deshabilitado con texto "Procesando..." mientras se procesa', async () => {
    let resolveDeactivate!: (value: unknown) => void
    mockDeactivateProject.mockImplementation(
      () => new Promise((res) => { resolveDeactivate = res })
    )
    const user = userEvent.setup()
    renderAcciones('live')

    await user.click(screen.getByRole('button', { name: /marcar como inactivo/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /procesando.../i })).toBeDisabled()
    })

    resolveDeactivate({})
  })

  it('muestra un mensaje de error cuando deactivateProject lanza excepción', async () => {
    mockDeactivateProject.mockRejectedValue(new Error('Error al desactivar'))
    const user = userEvent.setup()
    renderAcciones('live')

    await user.click(screen.getByRole('button', { name: /marcar como inactivo/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error al desactivar')
    })
  })

  it('no llama a publishProject desde estado live', async () => {
    mockDeactivateProject.mockResolvedValue({})
    const user = userEvent.setup()
    renderAcciones('live')

    await user.click(screen.getByRole('button', { name: /marcar como inactivo/i }))

    await waitFor(() => expect(mockDeactivateProject).toHaveBeenCalled())
    expect(mockPublishProject).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Estado inactive — volver a publicar (sin confirmación)
// ---------------------------------------------------------------------------

describe('ProjectStateActions — estado inactive', () => {
  afterEach(() => vi.clearAllMocks())

  it('muestra el botón "Publicar" en estado inactive', () => {
    renderAcciones('inactive')
    expect(screen.getByRole('button', { name: /^publicar$/i })).toBeInTheDocument()
  })

  it('no muestra el botón "Marcar como inactivo" en estado inactive', () => {
    renderAcciones('inactive')
    expect(screen.queryByRole('button', { name: /marcar como inactivo/i })).not.toBeInTheDocument()
  })

  it('al hacer click llama a publishProject directamente sin confirmación', async () => {
    mockPublishProject.mockResolvedValue({})
    const user = userEvent.setup()
    renderAcciones('inactive')

    await user.click(screen.getByRole('button', { name: /^publicar$/i }))

    await waitFor(() => {
      expect(mockPublishProject).toHaveBeenCalledWith(PROJECT_ID)
    })
  })

  it('llama a onStatusChange con "live" tras publicar desde inactive', async () => {
    mockPublishProject.mockResolvedValue({})
    const onStatusChange = vi.fn()
    const user = userEvent.setup()
    render(
      <ProjectStateActions
        projectId={PROJECT_ID}
        currentStatus="inactive"
        isBuilder={true}
        onStatusChange={onStatusChange}
      />
    )

    await user.click(screen.getByRole('button', { name: /^publicar$/i }))

    await waitFor(() => {
      expect(onStatusChange).toHaveBeenCalledWith('live')
    })
  })

  it('muestra el botón deshabilitado con texto "Publicando..." mientras se procesa', async () => {
    let resolvePublish!: (value: unknown) => void
    mockPublishProject.mockImplementation(
      () => new Promise((res) => { resolvePublish = res })
    )
    const user = userEvent.setup()
    renderAcciones('inactive')

    await user.click(screen.getByRole('button', { name: /^publicar$/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /publicando.../i })).toBeDisabled()
    })

    resolvePublish({})
  })

  it('muestra un mensaje de error cuando publishProject lanza excepción desde inactive', async () => {
    mockPublishProject.mockRejectedValue(new Error('Fallo publicación'))
    const user = userEvent.setup()
    renderAcciones('inactive')

    await user.click(screen.getByRole('button', { name: /^publicar$/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Fallo publicación')
    })
  })
})
