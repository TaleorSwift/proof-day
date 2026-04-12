// @vitest-environment jsdom
/**
 * Tests — LaunchIdeaModal (Story 9.8)
 * AC-1: dialog abierto/cerrado
 * AC-2: campos del formulario
 * AC-4: submit exitoso
 * AC-5: validación de campos requeridos
 * AC-7: ruta /projects/new se mantiene (no se testea aquí, es comportamiento de rutas)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

vi.mock('@/actions/projects/launchProject', () => ({
  launchProject: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/lib/utils/imageUpload', () => ({
  uploadImageToStorage: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn() },
  Toaster: () => null,
}))

import { LaunchIdeaModal } from '@/components/projects/LaunchIdeaModal'
import { launchProject } from '@/actions/projects/launchProject'
import { toast } from 'sonner'

const DEFAULT_PROPS = {
  open: true,
  onOpenChange: vi.fn(),
  communitySlug: 'startup-madrid',
}

function fillRequiredFields() {
  fireEvent.change(screen.getByTestId('modal-field-title'), {
    target: { value: 'Pulse Check' },
  })
  fireEvent.change(screen.getByTestId('modal-field-tagline'), {
    target: { value: 'Valida tu idea en horas' },
  })
  fireEvent.change(screen.getByTestId('modal-field-problem'), {
    target: { value: 'Los builders no saben qué construir primero' },
  })
  fireEvent.change(screen.getByTestId('modal-field-solution'), {
    target: { value: 'Un modal rápido para lanzar ideas' },
  })
  fireEvent.change(screen.getByTestId('modal-field-hypothesis'), {
    target: { value: 'Si lanzo rápido, entonces recibo feedback antes' },
  })
}

describe('LaunchIdeaModal — AC-1: dialog', () => {
  beforeEach(() => {
    vi.mocked(launchProject).mockReset()
  })

  it('muestra el título "Lanzar una nueva idea" cuando open=true', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    expect(screen.getByText('Lanzar una nueva idea')).toBeInTheDocument()
  })

  it('no renderiza contenido cuando open=false', () => {
    render(
      <LaunchIdeaModal {...DEFAULT_PROPS} open={false} />
    )
    expect(screen.queryByText('Lanzar una nueva idea')).not.toBeInTheDocument()
  })

  it('muestra el botón "Cancelar"', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })

  it('muestra el botón "+ Lanzar proyecto"', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    expect(screen.getByRole('button', { name: '+ Lanzar proyecto' })).toBeInTheDocument()
  })
})

describe('LaunchIdeaModal — AC-2: campos del formulario', () => {
  it('renderiza campo Project name con data-testid correcto', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('modal-field-title')).toBeInTheDocument()
  })

  it('renderiza campo Tagline con data-testid correcto', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('modal-field-tagline')).toBeInTheDocument()
  })

  it('renderiza campo Problem con data-testid correcto', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('modal-field-problem')).toBeInTheDocument()
  })

  it('renderiza campo Solution con data-testid correcto', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('modal-field-solution')).toBeInTheDocument()
  })

  it('renderiza campo Target user con data-testid correcto', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('modal-field-target-user')).toBeInTheDocument()
  })

  it('renderiza campo Hypothesis con data-testid correcto', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('modal-field-hypothesis')).toBeInTheDocument()
  })

  it('renderiza campo Demo link con data-testid correcto', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('modal-field-demo-link')).toBeInTheDocument()
  })

  it('renderiza el uploader de imágenes con data-testid correcto', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('modal-field-images')).toBeInTheDocument()
  })

  it('renderiza los chips de feedback con data-testid correcto', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('modal-feedback-chips')).toBeInTheDocument()
  })
})

describe('LaunchIdeaModal — AC-5: validación de campos requeridos', () => {
  it('muestra error cuando se intenta submit sin title', async () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: '+ Lanzar proyecto' }))
    await waitFor(() => {
      expect(screen.getByRole('alert', { name: /title/i }) ?? screen.getAllByRole('alert')[0]).toBeInTheDocument()
    })
    expect(vi.mocked(launchProject)).not.toHaveBeenCalled()
  })

  it('no llama a launchProject si los campos requeridos están vacíos', async () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: '+ Lanzar proyecto' }))
    await waitFor(() => {
      expect(vi.mocked(launchProject)).not.toHaveBeenCalled()
    })
  })

  it('los campos con error tienen aria-invalid="true"', async () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: '+ Lanzar proyecto' }))
    await waitFor(() => {
      const titleField = screen.getByTestId('modal-field-title')
      expect(titleField).toHaveAttribute('aria-invalid', 'true')
    })
  })
})

describe('LaunchIdeaModal — AC-4: submit exitoso', () => {
  beforeEach(() => {
    vi.mocked(launchProject).mockResolvedValue({
      success: true,
      projectId: 'new-project-uuid',
    })
  })

  it('llama a launchProject con los datos del formulario', async () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: '+ Lanzar proyecto' }))
    await waitFor(() => {
      expect(vi.mocked(launchProject)).toHaveBeenCalledWith(
        expect.objectContaining({
          communitySlug: 'startup-madrid',
          title: 'Pulse Check',
          tagline: 'Valida tu idea en horas',
          problem: 'Los builders no saben qué construir primero',
          solution: 'Un modal rápido para lanzar ideas',
          hypothesis: 'Si lanzo rápido, entonces recibo feedback antes',
        })
      )
    })
  })

  it('llama a onOpenChange(false) tras submit exitoso', async () => {
    const onOpenChange = vi.fn()
    render(
      <LaunchIdeaModal
        {...DEFAULT_PROPS}
        onOpenChange={onOpenChange}
      />
    )
    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: '+ Lanzar proyecto' }))
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('muestra error cuando launchProject retorna success=false', async () => {
    vi.mocked(launchProject).mockResolvedValue({
      success: false,
      error: 'Error de servidor',
    })
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: '+ Lanzar proyecto' }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('dispara toast.success tras submit exitoso (AC-4)', async () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: '+ Lanzar proyecto' }))
    await waitFor(() => {
      expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
        '¡Idea lanzada! Ya está recibiendo feedback.'
      )
    })
  })
})
