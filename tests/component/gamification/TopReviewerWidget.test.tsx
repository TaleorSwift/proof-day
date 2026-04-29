// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

import { TopReviewerWidget } from '@/components/gamification/TopReviewerWidget'
import type { TopReviewer } from '@/lib/types/gamification'

// ---------------------------------------------------------------------------
// Mocks de módulos
// ---------------------------------------------------------------------------

const mockGetTopReviewer = vi.fn()

vi.mock('@/lib/api/gamification', () => ({
  getTopReviewer: (...args: unknown[]) => mockGetTopReviewer(...args),
  getFeedbackCount: vi.fn(),
}))

// next/link es un wrapper simple en jsdom — pasa aria-label y href al anchor
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode
    href: string
    'aria-label'?: string
  }) => React.createElement('a', { href, 'aria-label': ariaLabel }, children),
}))

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const topReviewer: TopReviewer = {
  userId: 'user-42',
  name: 'Carlos Méndez',
  avatarUrl: null,
  feedbackCount: 5,
}

const topReviewerWithAvatar: TopReviewer = {
  userId: 'user-43',
  name: 'Lucía Fernández',
  avatarUrl: 'https://example.com/avatar.jpg',
  feedbackCount: 3,
}

// ---------------------------------------------------------------------------
// Suite: estado de carga (skeleton)
// ---------------------------------------------------------------------------

describe('TopReviewerWidget — estado de carga', () => {
  it('renderiza skeletons mientras se resuelve la promesa', () => {
    mockGetTopReviewer.mockImplementation(() => new Promise(() => {})) // never resolves
    const { container } = render(<TopReviewerWidget communityId="com-1" />)
    // El componente renderiza skeletons — comprobamos que no se muestra contenido real
    expect(screen.queryByText(/top reviewer esta semana/i)).not.toBeInTheDocument()
    // Hay elementos skeleton (divs sin texto de contenido)
    expect(container.firstChild).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: reviewer encontrado
// ---------------------------------------------------------------------------

describe('TopReviewerWidget — con top reviewer', () => {
  beforeEach(() => {
    mockGetTopReviewer.mockReset()
  })

  it('muestra el encabezado "Top Reviewer esta semana"', async () => {
    mockGetTopReviewer.mockResolvedValueOnce(topReviewer)
    render(<TopReviewerWidget communityId="com-1" />)
    await waitFor(() => {
      expect(screen.getByText(/top reviewer esta semana/i)).toBeInTheDocument()
    })
  })

  it('muestra el nombre del top reviewer', async () => {
    mockGetTopReviewer.mockResolvedValueOnce(topReviewer)
    render(<TopReviewerWidget communityId="com-1" />)
    await waitFor(() => {
      expect(screen.getByText('Carlos Méndez')).toBeInTheDocument()
    })
  })

  it('muestra el conteo de feedbacks en plural', async () => {
    mockGetTopReviewer.mockResolvedValueOnce(topReviewer)
    render(<TopReviewerWidget communityId="com-1" />)
    await waitFor(() => {
      expect(screen.getByText('5 feedbacks esta semana')).toBeInTheDocument()
    })
  })

  it('muestra "1 feedback" en singular cuando feedbackCount es 1', async () => {
    mockGetTopReviewer.mockResolvedValueOnce({ ...topReviewer, feedbackCount: 1 })
    render(<TopReviewerWidget communityId="com-1" />)
    await waitFor(() => {
      expect(screen.getByText('1 feedback esta semana')).toBeInTheDocument()
    })
  })

  it('el avatar tiene un enlace al perfil del reviewer', async () => {
    mockGetTopReviewer.mockResolvedValueOnce(topReviewer)
    render(<TopReviewerWidget communityId="com-1" />)
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /ver perfil de Carlos Méndez/i })
      expect(link).toHaveAttribute('href', '/profile/user-42')
    })
  })

  it('calcula las iniciales correctamente a partir del nombre', async () => {
    mockGetTopReviewer.mockResolvedValueOnce(topReviewer)
    render(<TopReviewerWidget communityId="com-1" />)
    await waitFor(() => {
      expect(screen.getByText('CM')).toBeInTheDocument()
    })
  })

  it('muestra "?" como iniciales cuando name es null', async () => {
    mockGetTopReviewer.mockResolvedValueOnce({ ...topReviewer, name: null })
    render(<TopReviewerWidget communityId="com-1" />)
    await waitFor(() => {
      expect(screen.getByText('?')).toBeInTheDocument()
    })
  })

  it('llama a getTopReviewer con el communityId correcto', async () => {
    mockGetTopReviewer.mockResolvedValueOnce(topReviewer)
    render(<TopReviewerWidget communityId="com-99" />)
    await waitFor(() => {
      expect(mockGetTopReviewer).toHaveBeenCalledWith('com-99')
    })
  })

  it('muestra el nombre del reviewer cuando avatarUrl no es null', async () => {
    // En jsdom Radix AvatarImage no renderiza <img> (requiere evento load real)
    // Verificamos que los datos del reviewer con avatar se muestran correctamente
    mockGetTopReviewer.mockResolvedValueOnce(topReviewerWithAvatar)
    render(<TopReviewerWidget communityId="com-1" />)
    await waitFor(() => {
      expect(screen.getByText('Lucía Fernández')).toBeInTheDocument()
      expect(screen.getByText('3 feedbacks esta semana')).toBeInTheDocument()
    })
  })
})

// ---------------------------------------------------------------------------
// Suite: empty state (data === null, sin error)
// ---------------------------------------------------------------------------

describe('TopReviewerWidget — sin reviewer esta semana', () => {
  beforeEach(() => {
    mockGetTopReviewer.mockReset()
  })

  it('muestra el encabezado y el mensaje de empty state cuando data es null', async () => {
    mockGetTopReviewer.mockResolvedValueOnce(null)
    render(<TopReviewerWidget communityId="com-1" />)
    await waitFor(() => {
      expect(screen.getByText(/top reviewer esta semana/i)).toBeInTheDocument()
      expect(screen.getByText(/sé el primero en dar feedback esta semana/i)).toBeInTheDocument()
    })
  })
})

// ---------------------------------------------------------------------------
// Suite: estado de error
// ---------------------------------------------------------------------------

describe('TopReviewerWidget — estado de error', () => {
  beforeEach(() => {
    mockGetTopReviewer.mockReset()
  })

  it('no renderiza nada (null) cuando la llamada a la API lanza un error', async () => {
    mockGetTopReviewer.mockRejectedValueOnce(new Error('Error de red'))
    const { container } = render(<TopReviewerWidget communityId="com-1" />)
    await waitFor(() => {
      // Cuando hay error, data===null y error!==null → retorna null (contenedor vacío)
      expect(container.firstChild).toBeNull()
    })
  })
})
