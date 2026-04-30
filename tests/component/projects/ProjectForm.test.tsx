// @vitest-environment jsdom
/**
 * Tests — ProjectForm (components/projects/ProjectForm.tsx)
 * Client Component — cubre modo crear, modo editar, submit, validación y feedbackTopics.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks hoisted
// ---------------------------------------------------------------------------

const { mockRouterRefresh, mockRouterPush, mockCreateProject, mockUpdateProject } = vi.hoisted(
  () => ({
    mockRouterRefresh: vi.fn(),
    mockRouterPush: vi.fn(),
    mockCreateProject: vi.fn(),
    mockUpdateProject: vi.fn(),
  })
)

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRouterRefresh,
    push: mockRouterPush,
  }),
}))

vi.mock('@/lib/api/projects', () => ({
  createProject: mockCreateProject,
  updateProject: mockUpdateProject,
}))

// ImageGallery requiere fetch real y storage — mockeamos para tests unitarios
vi.mock('@/components/projects/ImageGallery', () => ({
  ImageGallery: ({ projectId }: { projectId: string }) => (
    <div data-testid="image-gallery" data-project-id={projectId} />
  ),
}))

import { ProjectForm } from '@/components/projects/ProjectForm'
import type { ProjectRow } from '@/lib/types/projects'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const COMMUNITY_ID = 'b0000000-0000-4000-8000-000000000001'
const COMMUNITY_SLUG = 'producto-alpha'
const PROJECT_ID = 'c0000000-0000-4000-8000-000000000099'

const defaultProject: ProjectRow = {
  id: PROJECT_ID,
  slug: 'mi-proyecto-editable',
  community_id: COMMUNITY_ID,
  builder_id: 'a0000000-0000-4000-8000-000000000001',
  title: 'Mi proyecto editable',
  problem: 'Los equipos remotos pierden el rastro de la moral del equipo.',
  solution: 'Una encuesta semanal de pulso de 3 preguntas.',
  hypothesis: 'Si reducimos la fricción, la respuesta superará el 80%.',
  image_urls: [],
  status: 'draft',
  decision: null,
  decided_at: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  target_user: 'Engineering managers',
  demo_url: 'https://demo.miproyecto.com',
  feedback_topics: ['Claridad del problema', 'UX del onboarding'],
  tagline: 'Pulso semanal en 60 segundos',
  would_use_count: 0,
  template_id: null,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderModoCrear() {
  return render(
    <ProjectForm communityId={COMMUNITY_ID} communitySlug={COMMUNITY_SLUG} />
  )
}

function renderModoEditar(overrides: Partial<ProjectRow> = {}) {
  return render(
    <ProjectForm
      communityId={COMMUNITY_ID}
      communitySlug={COMMUNITY_SLUG}
      projectId={PROJECT_ID}
      defaultValues={{ ...defaultProject, ...overrides }}
    />
  )
}

// ---------------------------------------------------------------------------
// AC-1: Render modo crear
// ---------------------------------------------------------------------------

describe('ProjectForm — AC-1: modo crear', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('muestra el label "Título" con input', () => {
    renderModoCrear()
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
  })

  it('muestra el label "Descripción del problema" con textarea', () => {
    renderModoCrear()
    expect(screen.getByLabelText(/descripción del problema/i)).toBeInTheDocument()
  })

  it('muestra el label "Solución propuesta" con textarea', () => {
    renderModoCrear()
    expect(screen.getByLabelText(/solución propuesta/i)).toBeInTheDocument()
  })

  it('muestra el label "Hipótesis" con textarea', () => {
    renderModoCrear()
    expect(screen.getByLabelText(/hipótesis/i)).toBeInTheDocument()
  })

  it('muestra botón "Crear proyecto"', () => {
    renderModoCrear()
    expect(screen.getByRole('button', { name: /crear proyecto/i })).toBeInTheDocument()
  })

  it('NO muestra botón "Guardar cambios" en modo crear', () => {
    renderModoCrear()
    expect(screen.queryByRole('button', { name: /guardar cambios/i })).not.toBeInTheDocument()
  })

  it('muestra el mensaje de imagen pendiente (no es isEdit)', () => {
    renderModoCrear()
    expect(screen.getByText(/podrás subir imágenes una vez creado el proyecto/i)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// AC-2: Render modo editar con defaultValues
// ---------------------------------------------------------------------------

describe('ProjectForm — AC-2: modo editar con defaultValues', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('rellena el campo título con el valor de defaultValues', () => {
    renderModoEditar()
    const input = screen.getByLabelText(/título/i) as HTMLInputElement
    expect(input.value).toBe('Mi proyecto editable')
  })

  it('rellena el campo problema con el valor de defaultValues', () => {
    renderModoEditar()
    const textarea = screen.getByLabelText(/descripción del problema/i) as HTMLTextAreaElement
    expect(textarea.value).toBe('Los equipos remotos pierden el rastro de la moral del equipo.')
  })

  it('rellena el campo solución con el valor de defaultValues', () => {
    renderModoEditar()
    const textarea = screen.getByLabelText(/solución propuesta/i) as HTMLTextAreaElement
    expect(textarea.value).toBe('Una encuesta semanal de pulso de 3 preguntas.')
  })

  it('rellena el campo hipótesis con el valor de defaultValues', () => {
    renderModoEditar()
    const textarea = screen.getByLabelText(/hipótesis/i) as HTMLTextAreaElement
    expect(textarea.value).toBe('Si reducimos la fricción, la respuesta superará el 80%.')
  })

  it('muestra botón "Guardar cambios" en modo editar', () => {
    renderModoEditar()
    expect(screen.getByRole('button', { name: /guardar cambios/i })).toBeInTheDocument()
  })

  it('NO muestra botón "Crear proyecto" en modo editar', () => {
    renderModoEditar()
    expect(screen.queryByRole('button', { name: /crear proyecto/i })).not.toBeInTheDocument()
  })

  it('muestra el componente ImageGallery en modo editar', () => {
    renderModoEditar()
    expect(screen.getByTestId('image-gallery')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// AC-3: Submit modo editar → llama updateProject y router.refresh()
// ---------------------------------------------------------------------------

describe('ProjectForm — AC-3: submit modo editar', () => {
  beforeEach(() => {
    mockUpdateProject.mockResolvedValue({ ...defaultProject })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('llama updateProject con projectId y datos del formulario al hacer submit', async () => {
    const user = userEvent.setup()
    renderModoEditar()

    await user.click(screen.getByRole('button', { name: /guardar cambios/i }))

    await waitFor(() => {
      expect(mockUpdateProject).toHaveBeenCalledWith(
        PROJECT_ID,
        expect.objectContaining({ title: 'Mi proyecto editable' })
      )
    })
  })

  it('NO incluye communityId en el objeto pasado a updateProject (modo editar)', async () => {
    const user = userEvent.setup()
    renderModoEditar()

    await user.click(screen.getByRole('button', { name: /guardar cambios/i }))

    await waitFor(() => {
      expect(mockUpdateProject).toHaveBeenCalledWith(
        PROJECT_ID,
        expect.not.objectContaining({ communityId: expect.anything() })
      )
    })
  })

  it('llama router.refresh() tras un submit exitoso en modo editar', async () => {
    const user = userEvent.setup()
    renderModoEditar()

    await user.click(screen.getByRole('button', { name: /guardar cambios/i }))

    await waitFor(() => {
      expect(mockRouterRefresh).toHaveBeenCalledTimes(1)
    })
  })

  it('NO llama router.push() en modo editar (solo refresh)', async () => {
    const user = userEvent.setup()
    renderModoEditar()

    await user.click(screen.getByRole('button', { name: /guardar cambios/i }))

    await waitFor(() => {
      expect(mockUpdateProject).toHaveBeenCalled()
    })
    expect(mockRouterPush).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// AC-4: Submit modo crear → llama createProject y router.push()
// ---------------------------------------------------------------------------

describe('ProjectForm — AC-4: submit modo crear', () => {
  beforeEach(() => {
    mockCreateProject.mockResolvedValue({
      ...defaultProject,
      id: 'new-project-id',
      slug: 'nuevo-proyecto',
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('llama createProject con datos del formulario al hacer submit en modo crear', async () => {
    const user = userEvent.setup()
    renderModoCrear()

    await user.type(screen.getByLabelText(/título/i), 'Nuevo proyecto test')
    await user.type(
      screen.getByLabelText(/descripción del problema/i),
      'Un problema real y urgente.'
    )
    await user.type(screen.getByLabelText(/solución propuesta/i), 'Una solución elegante.')
    await user.type(screen.getByLabelText(/hipótesis/i), 'Si lo lanzamos el 80% lo usará.')

    await user.click(screen.getByRole('button', { name: /crear proyecto/i }))

    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Nuevo proyecto test',
          communityId: COMMUNITY_ID,
          imageUrls: [],
        })
      )
    })
  })

  it('llama router.push() a la ruta de edición tras crear un proyecto', async () => {
    const user = userEvent.setup()
    renderModoCrear()

    await user.type(screen.getByLabelText(/título/i), 'Nuevo proyecto test')
    await user.type(
      screen.getByLabelText(/descripción del problema/i),
      'Un problema real y urgente.'
    )
    await user.type(screen.getByLabelText(/solución propuesta/i), 'Una solución elegante.')
    await user.type(screen.getByLabelText(/hipótesis/i), 'Si lo lanzamos el 80% lo usará.')

    await user.click(screen.getByRole('button', { name: /crear proyecto/i }))

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith(
        `/communities/${COMMUNITY_SLUG}/projects/nuevo-proyecto/edit`
      )
    })
  })

  it('SÍ incluye communityId en el objeto pasado a createProject (modo crear)', async () => {
    const user = userEvent.setup()
    renderModoCrear()

    await user.type(screen.getByLabelText(/título/i), 'Proyecto con communityId')
    await user.type(
      screen.getByLabelText(/descripción del problema/i),
      'Problema de prueba.'
    )
    await user.type(screen.getByLabelText(/solución propuesta/i), 'Solución de prueba.')
    await user.type(screen.getByLabelText(/hipótesis/i), 'Hipótesis de prueba.')

    await user.click(screen.getByRole('button', { name: /crear proyecto/i }))

    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalledWith(
        expect.objectContaining({ communityId: COMMUNITY_ID })
      )
    })
  })
})

// ---------------------------------------------------------------------------
// AC-5: Normalización de campos opcionales
// ---------------------------------------------------------------------------

describe('ProjectForm — AC-5: normalización de campos opcionales', () => {
  beforeEach(() => {
    mockUpdateProject.mockResolvedValue({ ...defaultProject })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('envía targetUser como undefined cuando el campo está vacío', async () => {
    const user = userEvent.setup()
    renderModoEditar({ target_user: null })

    await user.click(screen.getByRole('button', { name: /guardar cambios/i }))

    await waitFor(() => {
      expect(mockUpdateProject).toHaveBeenCalledWith(
        PROJECT_ID,
        expect.objectContaining({ targetUser: undefined })
      )
    })
  })

  it('envía demoUrl como undefined cuando el campo está vacío', async () => {
    const user = userEvent.setup()
    renderModoEditar({ demo_url: null })

    await user.click(screen.getByRole('button', { name: /guardar cambios/i }))

    await waitFor(() => {
      expect(mockUpdateProject).toHaveBeenCalledWith(
        PROJECT_ID,
        expect.objectContaining({ demoUrl: undefined })
      )
    })
  })

  it('envía feedbackTopics como [] cuando no hay chips seleccionados (borrado explícito)', async () => {
    const user = userEvent.setup()
    // Renderizar en modo editar sin topics — eliminamos todos los chips existentes
    renderModoEditar({ feedback_topics: [] })

    await user.click(screen.getByRole('button', { name: /guardar cambios/i }))

    await waitFor(() => {
      expect(mockUpdateProject).toHaveBeenCalledWith(
        PROJECT_ID,
        expect.objectContaining({ feedbackTopics: [] })
      )
    })
  })
})

// ---------------------------------------------------------------------------
// AC-6: feedbackTopics — añadir y eliminar chips
// ---------------------------------------------------------------------------

describe('ProjectForm — AC-6: feedbackTopics — estado local', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('muestra los topics iniciales como chips en modo editar', () => {
    renderModoEditar()
    expect(screen.getByText('Claridad del problema')).toBeInTheDocument()
    expect(screen.getByText('UX del onboarding')).toBeInTheDocument()
  })

  it('añade un nuevo topic al escribir en el input y pulsar "Añadir"', async () => {
    const user = userEvent.setup()
    renderModoCrear()

    const topicInput = screen.getByLabelText(/temas de feedback/i)
    await user.type(topicInput, 'Pricing')
    await user.click(screen.getByRole('button', { name: /añadir/i }))

    expect(screen.getByText('Pricing')).toBeInTheDocument()
  })

  it('limpia el input tras añadir un topic', async () => {
    const user = userEvent.setup()
    renderModoCrear()

    const topicInput = screen.getByLabelText(/temas de feedback/i) as HTMLInputElement
    await user.type(topicInput, 'Pricing')
    await user.click(screen.getByRole('button', { name: /añadir/i }))

    expect(topicInput.value).toBe('')
  })

  it('elimina un topic al hacer click en el botón de eliminar del chip', async () => {
    const user = userEvent.setup()
    renderModoEditar()

    const deleteButton = screen.getByRole('button', {
      name: /eliminar tema: claridad del problema/i,
    })
    await user.click(deleteButton)

    expect(screen.queryByText('Claridad del problema')).not.toBeInTheDocument()
  })

  it('no añade un topic duplicado', async () => {
    const user = userEvent.setup()
    renderModoCrear()

    const topicInput = screen.getByLabelText(/temas de feedback/i)
    await user.type(topicInput, 'Pricing')
    await user.click(screen.getByRole('button', { name: /añadir/i }))
    await user.type(topicInput, 'Pricing')
    await user.click(screen.getByRole('button', { name: /añadir/i }))

    const chips = screen.getAllByText('Pricing')
    expect(chips).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// AC-7: isSubmitting → botón disabled durante la petición
// ---------------------------------------------------------------------------

describe('ProjectForm — AC-7: isSubmitting → botón disabled', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('deshabilita el botón submit mientras la petición está en curso', async () => {
    // Retrasamos la resolución para capturar el estado intermedio
    let resolveUpdate!: (value: ProjectRow) => void
    mockUpdateProject.mockImplementation(
      () => new Promise<ProjectRow>((res) => { resolveUpdate = res })
    )

    const user = userEvent.setup()
    renderModoEditar()

    await user.click(screen.getByRole('button', { name: /guardar cambios/i }))

    // Durante la petición el botón debe estar deshabilitado
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /guardando.../i })).toBeDisabled()
    })

    // Limpiar: resolver la promesa pendiente
    resolveUpdate({ ...defaultProject })
  })

  it('el botón submit tiene aria-busy=true mientras la petición está en curso', async () => {
    let resolveUpdate!: (value: ProjectRow) => void
    mockUpdateProject.mockImplementation(
      () => new Promise<ProjectRow>((res) => { resolveUpdate = res })
    )

    const user = userEvent.setup()
    renderModoEditar()

    await user.click(screen.getByRole('button', { name: /guardar cambios/i }))

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /guardando.../i })
      expect(btn).toHaveAttribute('aria-busy', 'true')
    })

    // Limpiar: resolver la promesa pendiente
    resolveUpdate({ ...defaultProject })
  })
})
