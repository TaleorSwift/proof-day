// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

import { ProfileForm } from '@/components/profiles/ProfileForm'
import type { Profile } from '@/lib/types/profiles'

// ---------------------------------------------------------------------------
// Mocks de módulos
// ---------------------------------------------------------------------------

const mockUpdateProfile = vi.fn()

vi.mock('@/lib/api/profiles', () => ({
  updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
}))

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'user-1',
    name: 'Ana García',
    bio: 'Emprendedora',
    interests: ['IA', 'Startups'],
    avatarUrl: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Suite: render inicial
// ---------------------------------------------------------------------------

describe('ProfileForm — render inicial', () => {
  it('pre-rellena el campo nombre con el valor del perfil', () => {
    render(
      <ProfileForm
        profile={makeProfile()}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByLabelText(/nombre \/ alias/i)).toHaveValue('Ana García')
  })

  it('pre-rellena el campo bio con el valor del perfil', () => {
    render(
      <ProfileForm
        profile={makeProfile()}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByLabelText(/bio/i)).toHaveValue('Emprendedora')
  })

  it('muestra los intereses existentes como etiquetas', () => {
    render(
      <ProfileForm
        profile={makeProfile()}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText('IA')).toBeInTheDocument()
    expect(screen.getByText('Startups')).toBeInTheDocument()
  })

  it('muestra el botón "Guardar"', () => {
    render(
      <ProfileForm
        profile={makeProfile()}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument()
  })

  it('muestra el botón "Cancelar"', () => {
    render(
      <ProfileForm
        profile={makeProfile()}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: gestión de intereses
// ---------------------------------------------------------------------------

describe('ProfileForm — gestión de intereses', () => {
  it('añade un nuevo interés al hacer clic en el botón "+"', async () => {
    const user = userEvent.setup()
    render(
      <ProfileForm
        profile={makeProfile({ interests: [] })}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    await user.type(screen.getByPlaceholderText(/añadir interés/i), 'Blockchain')
    await user.click(screen.getByRole('button', { name: '+' }))
    expect(screen.getByText('Blockchain')).toBeInTheDocument()
  })

  it('añade un nuevo interés al pulsar Enter en el input', async () => {
    const user = userEvent.setup()
    render(
      <ProfileForm
        profile={makeProfile({ interests: [] })}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    await user.type(screen.getByPlaceholderText(/añadir interés/i), 'Web3{Enter}')
    expect(screen.getByText('Web3')).toBeInTheDocument()
  })

  it('elimina un interés al pulsar su botón ×', async () => {
    const user = userEvent.setup()
    render(
      <ProfileForm
        profile={makeProfile()}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    await user.click(screen.getByRole('button', { name: /eliminar interés IA/i }))
    expect(screen.queryByText('IA')).not.toBeInTheDocument()
  })

  it('no añade un interés duplicado', async () => {
    const user = userEvent.setup()
    render(
      <ProfileForm
        profile={makeProfile({ interests: ['IA'] })}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    await user.type(screen.getByPlaceholderText(/añadir interés/i), 'IA{Enter}')
    expect(screen.getAllByText('IA')).toHaveLength(1)
  })

  it('deshabilita el input cuando se alcanzan 10 intereses', () => {
    const intereses10 = Array.from({ length: 10 }, (_, i) => `tag${i}`)
    render(
      <ProfileForm
        profile={makeProfile({ interests: intereses10 })}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByPlaceholderText(/añadir interés/i)).toBeDisabled()
  })
})

// ---------------------------------------------------------------------------
// Suite: submit exitoso
// ---------------------------------------------------------------------------

describe('ProfileForm — submit exitoso', () => {
  beforeEach(() => {
    mockUpdateProfile.mockReset()
  })

  it('llama a updateProfile con los datos del formulario', async () => {
    const user = userEvent.setup()
    const updatedProfile = makeProfile({ name: 'Nuevo Nombre' })
    mockUpdateProfile.mockResolvedValueOnce(updatedProfile)
    const onSuccess = vi.fn()

    render(
      <ProfileForm
        profile={makeProfile()}
        onSuccess={onSuccess}
        onCancel={vi.fn()}
      />
    )

    await user.clear(screen.getByLabelText(/nombre \/ alias/i))
    await user.type(screen.getByLabelText(/nombre \/ alias/i), 'Nuevo Nombre')
    await user.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ name: 'Nuevo Nombre' })
      )
    })
  })

  it('llama a onSuccess con el perfil actualizado tras submit correcto', async () => {
    const user = userEvent.setup()
    const updatedProfile = makeProfile({ name: 'Nuevo Nombre' })
    mockUpdateProfile.mockResolvedValueOnce(updatedProfile)
    const onSuccess = vi.fn()

    render(
      <ProfileForm
        profile={makeProfile()}
        onSuccess={onSuccess}
        onCancel={vi.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(updatedProfile)
    })
  })

  it('muestra "Guardando..." durante el submit', async () => {
    const user = userEvent.setup()
    mockUpdateProfile.mockImplementation(() => new Promise(() => {})) // never resolves

    render(
      <ProfileForm
        profile={makeProfile()}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /guardando/i })).toBeInTheDocument()
    })
  })
})

// ---------------------------------------------------------------------------
// Suite: manejo de error en submit
// ---------------------------------------------------------------------------

describe('ProfileForm — error en submit', () => {
  beforeEach(() => {
    mockUpdateProfile.mockReset()
  })

  it('muestra mensaje de error cuando updateProfile lanza una excepción', async () => {
    const user = userEvent.setup()
    mockUpdateProfile.mockRejectedValueOnce(new Error('Error al guardar el perfil'))

    render(
      <ProfileForm
        profile={makeProfile()}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error al guardar el perfil')
    })
  })
})

// ---------------------------------------------------------------------------
// Suite: cancelar
// ---------------------------------------------------------------------------

describe('ProfileForm — cancelar', () => {
  it('llama a onCancel al pulsar el botón Cancelar', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(
      <ProfileForm
        profile={makeProfile()}
        onSuccess={vi.fn()}
        onCancel={onCancel}
      />
    )

    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
