// @vitest-environment jsdom
// Tests — CommunityForm
// Cubre: render accesible, validación zod, submit válido, errores de servidor,
// COMMUNITY_NAME_TAKEN inline, error global, estado submitting.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks hoisted
// ---------------------------------------------------------------------------

const { mockPush, mockCreateCommunity } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockCreateCommunity: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/lib/api/communities', () => ({
  createCommunity: mockCreateCommunity,
  ApiError: class ApiError extends Error {
    code: string
    constructor(msg: string, code: string) {
      super(msg)
      this.name = 'ApiError'
      this.code = code
    }
  },
}))

import { CommunityForm } from '@/components/communities/CommunityForm'
import { ApiError } from '@/lib/api/communities'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeCommunity = () => ({
  id: 'comm-001',
  name: 'Test Community',
  slug: 'test-community',
  description: 'Una descripción de prueba',
  image_url: null,
  created_by: 'user-001',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  member_count: 1,
})

const fillValidForm = () => {
  fireEvent.change(screen.getByLabelText(/Nombre/i), {
    target: { value: 'Mi Comunidad Test' },
  })
  fireEvent.change(screen.getByLabelText(/Descripción/i), {
    target: { value: 'Una descripción válida para la comunidad.' },
  })
}

// ---------------------------------------------------------------------------
// 1. Render — inputs accesibles y botón
// ---------------------------------------------------------------------------

describe('CommunityForm — render', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza los inputs de nombre, descripción e imagen accesibles y el botón "Crear comunidad"', () => {
    render(<CommunityForm />)

    expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Imagen/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Crear comunidad/i })).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// 2. Submit vacío → errores zod con role="alert"
// ---------------------------------------------------------------------------

describe('CommunityForm — validación zod al submit vacío', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra errores de validación con role="alert" al enviar formulario vacío', async () => {
    render(<CommunityForm />)

    fireEvent.click(screen.getByRole('button', { name: /Crear comunidad/i }))

    await waitFor(() => {
      expect(screen.getByText('El nombre debe tener al menos 3 caracteres')).toBeInTheDocument()
      expect(screen.getByText('La descripción es obligatoria')).toBeInTheDocument()
    })

    expect(mockCreateCommunity).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// 3. Submit válido sin onSuccess → router.push('/communities')
// ---------------------------------------------------------------------------

describe('CommunityForm — submit válido sin onSuccess', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateCommunity.mockResolvedValue(makeCommunity())
  })

  it('llama a createCommunity con los datos del formulario', async () => {
    render(<CommunityForm />)
    fillValidForm()

    fireEvent.click(screen.getByRole('button', { name: /Crear comunidad/i }))

    await waitFor(() => {
      expect(mockCreateCommunity).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Mi Comunidad Test',
          description: 'Una descripción válida para la comunidad.',
        })
      )
    })
  })

  it('llama a router.push("/communities") tras submit exitoso', async () => {
    render(<CommunityForm />)
    fillValidForm()

    fireEvent.click(screen.getByRole('button', { name: /Crear comunidad/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/communities')
    })
  })
})

// ---------------------------------------------------------------------------
// 4. Submit válido con onSuccess → onSuccess(community), no router.push
// ---------------------------------------------------------------------------

describe('CommunityForm — submit válido con onSuccess', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('llama a onSuccess con la comunidad creada y NO llama a router.push', async () => {
    const community = makeCommunity()
    mockCreateCommunity.mockResolvedValueOnce(community)
    const onSuccess = vi.fn()
    render(<CommunityForm onSuccess={onSuccess} />)
    fillValidForm()

    fireEvent.click(screen.getByRole('button', { name: /Crear comunidad/i }))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(community)
    })

    expect(mockPush).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// 5. COMMUNITY_NAME_TAKEN → error inline bajo name, sin serverError global
// ---------------------------------------------------------------------------

describe('CommunityForm — COMMUNITY_NAME_TAKEN', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateCommunity.mockRejectedValue(
      new ApiError('El nombre ya está en uso', 'COMMUNITY_NAME_TAKEN')
    )
  })

  it('muestra el error inline bajo el campo name con id="name-error"', async () => {
    render(<CommunityForm />)
    fillValidForm()

    fireEvent.click(screen.getByRole('button', { name: /Crear comunidad/i }))

    await waitFor(() => {
      expect(screen.getByText('El nombre ya está en uso')).toBeInTheDocument()
    })

    const nameError = document.getElementById('name-error')
    expect(nameError).toBeInTheDocument()
    expect(nameError).toHaveTextContent('El nombre ya está en uso')
  })

  it('NO muestra el error en el párrafo global de serverError', async () => {
    render(<CommunityForm />)
    fillValidForm()

    fireEvent.click(screen.getByRole('button', { name: /Crear comunidad/i }))

    await waitFor(() => {
      expect(screen.getByText('El nombre ya está en uso')).toBeInTheDocument()
    })

    // El nombre-error es el único alert — sin serverError global adicional
    const nameError = document.getElementById('name-error')
    const allAlerts = screen.getAllByRole('alert')
    expect(allAlerts).toHaveLength(1)
    expect(allAlerts[0]).toBe(nameError)
  })
})

// ---------------------------------------------------------------------------
// 6. ApiError con código distinto → serverError global visible
// ---------------------------------------------------------------------------

describe('CommunityForm — ApiError con código distinto de COMMUNITY_NAME_TAKEN', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateCommunity.mockRejectedValue(
      new ApiError('Error de permisos', 'FORBIDDEN')
    )
  })

  it('muestra el mensaje de error en el párrafo global de serverError', async () => {
    render(<CommunityForm />)
    fillValidForm()

    fireEvent.click(screen.getByRole('button', { name: /Crear comunidad/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error de permisos')
    })
  })
})

// ---------------------------------------------------------------------------
// 7. Error genérico → serverError con err.message
// ---------------------------------------------------------------------------

describe('CommunityForm — Error genérico', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateCommunity.mockRejectedValue(new Error('Error de red'))
  })

  it('muestra el mensaje del Error genérico en el serverError global', async () => {
    render(<CommunityForm />)
    fillValidForm()

    fireEvent.click(screen.getByRole('button', { name: /Crear comunidad/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error de red')
    })
  })
})

// ---------------------------------------------------------------------------
// 8. Durante submit → botón disabled + texto "Creando..."
// ---------------------------------------------------------------------------

describe('CommunityForm — estado submitting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Promesa que nunca resuelve para capturar el estado intermedio
    mockCreateCommunity.mockReturnValue(new Promise(() => {}))
  })

  it('muestra el botón disabled con texto "Creando..." durante el submit', async () => {
    render(<CommunityForm />)
    fillValidForm()

    fireEvent.click(screen.getByRole('button', { name: /Crear comunidad/i }))

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /Creando/i })
      expect(btn).toBeDisabled()
      expect(btn).toHaveTextContent('Creando...')
    })
  })
})
