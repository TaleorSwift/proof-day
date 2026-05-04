// @vitest-environment jsdom
/**
 * Tests — LaunchIdeaModal (Story 9.8, actualizado en Story 10.3 para wizard)
 * AC-1: dialog abierto/cerrado
 * AC-2: campos del formulario — ahora en pasos del wizard
 * AC-4: submit exitoso — ahora desde el paso 3
 * AC-5: el wizard no avanza si los campos requeridos están vacíos
 * AC-7: ruta /projects/new se mantiene (no se testea aquí, es comportamiento de rutas)
 *
 * Nota Story 10.3: la estructura ha cambiado de formulario plano a wizard multi-paso.
 * Los campos de paso 2 usan data-testid "wizard-field-*" (en lugar de "modal-field-*").
 * Los campos de paso 3 siguen con los testids propios de ImageUploader y FeedbackTopicChips.
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

// Navega a paso 2 y rellena los campos requeridos
function navigateToStep2AndFillRequired() {
  // Paso 1 → Paso 2
  fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

  fireEvent.change(screen.getByTestId('wizard-field-title'), {
    target: { value: 'Pulse Check' },
  })
  fireEvent.change(screen.getByTestId('wizard-field-tagline'), {
    target: { value: 'Valida tu idea en horas' },
  })
  fireEvent.change(screen.getByTestId('wizard-field-problem'), {
    target: { value: 'Los builders no saben qué construir primero' },
  })
  fireEvent.change(screen.getByTestId('wizard-field-solution'), {
    target: { value: 'Un modal rápido para lanzar ideas' },
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
    render(<LaunchIdeaModal {...DEFAULT_PROPS} open={false} />)
    expect(screen.queryByText('Lanzar una nueva idea')).not.toBeInTheDocument()
  })

  it('muestra el botón "Cancelar" en paso 1', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })

  it('muestra el botón "Continuar" en paso 1', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeInTheDocument()
  })

  // Story 10.4: submit temporal eliminado del paso 3 — ahora hay botón "Publicar" en paso 5
  it('muestra el botón "Publicar" en paso 5 (preview)', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    navigateToStep2AndFillRequired()
    // Paso 2 → 3 → 4 → 5
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    expect(screen.getByRole('button', { name: /publicar/i })).toBeInTheDocument()
  })
})

describe('LaunchIdeaModal — AC-2: campos del formulario (wizard)', () => {
  it('renderiza campo title en paso 2', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    expect(screen.getByTestId('wizard-field-title')).toBeInTheDocument()
  })

  it('renderiza campo tagline en paso 2', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    expect(screen.getByTestId('wizard-field-tagline')).toBeInTheDocument()
  })

  it('renderiza campo problem en paso 2', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    expect(screen.getByTestId('wizard-field-problem')).toBeInTheDocument()
  })

  it('renderiza campo solution en paso 2', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    expect(screen.getByTestId('wizard-field-solution')).toBeInTheDocument()
  })

  it('renderiza campo target-user en paso 3', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    navigateToStep2AndFillRequired()
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    expect(screen.getByTestId('wizard-field-target-user')).toBeInTheDocument()
  })

  it('renderiza campo demo-link en paso 3', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    navigateToStep2AndFillRequired()
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    expect(screen.getByTestId('wizard-field-demo-link')).toBeInTheDocument()
  })

  it('renderiza el uploader de imágenes en paso 3', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    navigateToStep2AndFillRequired()
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    expect(screen.getByTestId('modal-field-images')).toBeInTheDocument()
  })

  it('renderiza los chips de feedback en paso 3', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    navigateToStep2AndFillRequired()
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    expect(screen.getByTestId('modal-feedback-chips')).toBeInTheDocument()
  })
})

describe('LaunchIdeaModal — AC-5: campos requeridos del paso 2', () => {
  it('el botón "Continuar" en paso 2 está deshabilitado si los campos están vacíos', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    // En paso 2 sin rellenar, Continuar está deshabilitado
    expect(screen.getByRole('button', { name: /continuar/i })).toBeDisabled()
  })

  it('no llama a launchProject desde paso 2 (Continuar no hace submit)', async () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    // Intentar hacer click en Continuar sin datos
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    await waitFor(() => {
      expect(vi.mocked(launchProject)).not.toHaveBeenCalled()
    })
  })
})

// Story 10.4: submit migrado al paso 5 (ProjectPreview → botón "Publicar")
describe('LaunchIdeaModal — AC-4: submit exitoso (desde paso 5)', () => {
  beforeEach(() => {
    vi.mocked(launchProject).mockResolvedValue({
      success: true,
      projectId: 'new-project-uuid',
      projectSlug: 'new-project',
    })
  })

  // Helper: navega al paso 5 y hace click en Publicar
  function navigateToStep5AndPublish() {
    navigateToStep2AndFillRequired()
    // Paso 2 → 3 → 4 → 5
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    fireEvent.click(screen.getByRole('button', { name: /publicar/i }))
  }

  it('llama a launchProject con los datos del formulario desde el paso 5', async () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    navigateToStep5AndPublish()
    await waitFor(() => {
      expect(vi.mocked(launchProject)).toHaveBeenCalledWith(
        expect.objectContaining({
          communitySlug: 'startup-madrid',
          title: 'Pulse Check',
          tagline: 'Valida tu idea en horas',
          problem: 'Los builders no saben qué construir primero',
          solution: 'Un modal rápido para lanzar ideas',
        }),
      )
    })
  })

  it('llama a onOpenChange(false) tras submit exitoso', async () => {
    const onOpenChange = vi.fn()
    render(<LaunchIdeaModal {...DEFAULT_PROPS} onOpenChange={onOpenChange} />)
    navigateToStep5AndPublish()
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
    navigateToStep5AndPublish()
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('dispara toast.success tras submit exitoso (AC-4)', async () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    navigateToStep5AndPublish()
    await waitFor(() => {
      expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
        '¡Idea lanzada! Ya está recibiendo feedback.',
      )
    })
  })
})
