// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

vi.mock('@/lib/api/feedback', () => ({
  getFeedbacks: vi.fn(),
}))

vi.mock('@/lib/utils/date', () => ({
  getRelativeTime: vi.fn((date: string) => `hace un momento (${date})`),
}))

vi.mock('@/lib/utils/string', () => ({
  getInitials: vi.fn((name: string) => name.slice(0, 2).toUpperCase()),
}))

import { FeedbackList } from '@/components/feedback/FeedbackList'
import { getFeedbacks, type FeedbackWithReviewer } from '@/lib/api/feedback'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const FEEDBACK_SIN_AVATAR: FeedbackWithReviewer = {
  id: 'fb-1',
  text_responses: { p4: 'Mejoraría el onboarding del producto.' },
  created_at: '2026-04-10T10:00:00Z',
  profiles: { id: 'user-1', name: 'Ana García', avatar_url: null },
  // Story 13.4 — sin iteración asignada
  iteration_id: null,
  project_iterations: null,
}

const FEEDBACK_CON_AVATAR: FeedbackWithReviewer = {
  id: 'fb-2',
  text_responses: {
    p1: 'Sí, el problema es muy real.',
    p2: 'Definitivamente la usaría.',
    p3: 'Técnicamente viable.',
    p4: 'Añadiría integración con Slack.',
  },
  created_at: '2026-04-09T15:30:00Z',
  profiles: {
    id: 'user-2',
    name: 'Carlos López',
    avatar_url: 'https://picsum.photos/seed/carlos/32/32',
  },
  // Story 13.4 — sin iteración asignada
  iteration_id: null,
  project_iterations: null,
}

const FEEDBACK_SIN_PERFIL: FeedbackWithReviewer = {
  id: 'fb-3',
  text_responses: { p4: 'Feedback sin perfil.' },
  created_at: '2026-04-08T09:00:00Z',
  profiles: null,
  // Story 13.4 — sin iteración asignada
  iteration_id: null,
  project_iterations: null,
}

// ---------------------------------------------------------------------------
// Suite: FeedbackList — cuando isBuilder es false
// ---------------------------------------------------------------------------

describe('FeedbackList — cuando isBuilder es false', () => {
  it('devuelve null y no renderiza nada', () => {
    const { container } = render(
      <FeedbackList projectId="proj-123" isBuilder={false} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('no llama a getFeedbacks', () => {
    render(<FeedbackList projectId="proj-123" isBuilder={false} />)
    expect(vi.mocked(getFeedbacks)).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Suite: FeedbackList — estado de carga
// ---------------------------------------------------------------------------

describe('FeedbackList — estado de carga', () => {
  it('muestra el skeleton mientras carga', async () => {
    vi.mocked(getFeedbacks).mockImplementation(
      () => new Promise(() => {}) // promesa que nunca resuelve
    )
    const { container } = render(
      <FeedbackList projectId="proj-123" isBuilder={true} />
    )
    // El skeleton renderiza divs — verifica que el container no está vacío
    expect(container.firstChild).not.toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Suite: FeedbackList — lista vacía
// ---------------------------------------------------------------------------

describe('FeedbackList — lista vacía', () => {
  beforeEach(() => {
    vi.mocked(getFeedbacks).mockReset()
    vi.mocked(getFeedbacks).mockResolvedValue([])
  })

  it('muestra "Aún no has recibido feedback" cuando la lista está vacía', async () => {
    render(<FeedbackList projectId="proj-123" isBuilder={true} />)
    await waitFor(() => {
      expect(screen.getByText('Aún no has recibido feedback')).toBeInTheDocument()
    })
  })
})

// ---------------------------------------------------------------------------
// Suite: FeedbackList — lista con items
// ---------------------------------------------------------------------------

describe('FeedbackList — lista con items', () => {
  beforeEach(() => {
    vi.mocked(getFeedbacks).mockReset()
    vi.mocked(getFeedbacks).mockResolvedValue([FEEDBACK_SIN_AVATAR, FEEDBACK_CON_AVATAR])
  })

  it('renderiza el nombre del reviewer para cada feedback', async () => {
    render(<FeedbackList projectId="proj-123" isBuilder={true} />)
    await waitFor(() => {
      expect(screen.getByText('Ana García')).toBeInTheDocument()
      expect(screen.getByText('Carlos López')).toBeInTheDocument()
    })
  })

  it('renderiza una imagen cuando el reviewer tiene avatar_url', async () => {
    render(<FeedbackList projectId="proj-123" isBuilder={true} />)
    await waitFor(() => {
      const img = screen.getByAltText('Carlos López')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute(
        'src',
        'https://picsum.photos/seed/carlos/32/32'
      )
    })
  })

  it('renderiza un avatar de iniciales cuando el reviewer no tiene avatar_url', async () => {
    render(<FeedbackList projectId="proj-123" isBuilder={true} />)
    await waitFor(() => {
      // getInitials mock devuelve las dos primeras letras en mayúscula
      expect(screen.getByText('AN')).toBeInTheDocument()
    })
  })

  it('muestra el texto de respuesta p4 de cada feedback', async () => {
    render(<FeedbackList projectId="proj-123" isBuilder={true} />)
    await waitFor(() => {
      expect(
        screen.getByText('Mejoraría el onboarding del producto.')
      ).toBeInTheDocument()
      expect(screen.getByText('Añadiría integración con Slack.')).toBeInTheDocument()
    })
  })

  it('muestra respuestas opcionales (p1, p2, p3) cuando tienen valor', async () => {
    render(<FeedbackList projectId="proj-123" isBuilder={true} />)
    await waitFor(() => {
      expect(screen.getByText('Sí, el problema es muy real.')).toBeInTheDocument()
      expect(screen.getByText('Definitivamente la usaría.')).toBeInTheDocument()
      expect(screen.getByText('Técnicamente viable.')).toBeInTheDocument()
    })
  })

  it('no muestra la label de una pregunta cuando su respuesta es undefined', async () => {
    render(<FeedbackList projectId="proj-123" isBuilder={true} />)
    await waitFor(() => {
      // FEEDBACK_SIN_AVATAR solo tiene p4 — las labels p1/p2/p3 no deben aparecer
      // (al menos en ese entry, aunque el otro sí las tiene)
      const labels = screen.queryAllByText('¿Entiendes el problema?')
      // Solo aparece una vez (del segundo feedback que sí tiene p1)
      expect(labels).toHaveLength(1)
    })
  })

  it('llama a getFeedbacks con el projectId correcto', async () => {
    render(<FeedbackList projectId="proj-especifico" isBuilder={true} />)
    await waitFor(() => {
      expect(vi.mocked(getFeedbacks)).toHaveBeenCalledWith('proj-especifico')
    })
  })

  it('renderiza un elemento time con dateTime para cada feedback', async () => {
    render(<FeedbackList projectId="proj-123" isBuilder={true} />)
    await waitFor(() => {
      const timeElements = screen.getAllByText(/hace un momento/)
      expect(timeElements).toHaveLength(2)
    })
  })
})

// ---------------------------------------------------------------------------
// Suite: FeedbackList — perfil nulo (Usuario anónimo)
// ---------------------------------------------------------------------------

describe('FeedbackList — perfil nulo', () => {
  beforeEach(() => {
    vi.mocked(getFeedbacks).mockReset()
    vi.mocked(getFeedbacks).mockResolvedValue([FEEDBACK_SIN_PERFIL])
  })

  it('muestra "Usuario" cuando profiles es null', async () => {
    render(<FeedbackList projectId="proj-123" isBuilder={true} />)
    await waitFor(() => {
      expect(screen.getByText('Usuario')).toBeInTheDocument()
    })
  })
})

// ---------------------------------------------------------------------------
// Suite: FeedbackList — badge de versión (Story 13.4, AC4)
// ---------------------------------------------------------------------------

describe('FeedbackList — badge de versión (Story 13.4)', () => {
  it('muestra el badge "v2" cuando el feedback tiene iteration_id y project_iterations con version_number=2', async () => {
    const feedbackConVersion: FeedbackWithReviewer = {
      ...FEEDBACK_SIN_AVATAR,
      id: 'fb-v2',
      iteration_id: 'iter-uuid-001',
      project_iterations: { version_number: 2 },
    }
    vi.mocked(getFeedbacks).mockResolvedValueOnce([feedbackConVersion])
    render(<FeedbackList projectId="proj-123" isBuilder={true} />)
    await waitFor(() => {
      expect(screen.getByTestId('feedback-version-badge')).toBeInTheDocument()
      expect(screen.getByTestId('feedback-version-badge')).toHaveTextContent('v2')
    })
  })

  it('no muestra el badge cuando iteration_id es null', async () => {
    vi.mocked(getFeedbacks).mockResolvedValueOnce([FEEDBACK_SIN_AVATAR])
    render(<FeedbackList projectId="proj-123" isBuilder={true} />)
    await waitFor(() => {
      expect(screen.queryByTestId('feedback-version-badge')).not.toBeInTheDocument()
    })
  })
})

// ---------------------------------------------------------------------------
// Suite: FeedbackList — manejo de errores
// ---------------------------------------------------------------------------

describe('FeedbackList — manejo de errores', () => {
  beforeEach(() => {
    vi.mocked(getFeedbacks).mockReset()
  })

  it('muestra el mensaje de error cuando getFeedbacks falla', async () => {
    vi.mocked(getFeedbacks).mockRejectedValueOnce(
      new Error('Error al obtener feedbacks')
    )
    render(<FeedbackList projectId="proj-123" isBuilder={true} />)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Error al obtener feedbacks'
      )
    })
  })

  it('muestra error genérico cuando el error no es instancia de Error', async () => {
    vi.mocked(getFeedbacks).mockRejectedValueOnce('fallo desconocido')
    render(<FeedbackList projectId="proj-123" isBuilder={true} />)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Error al cargar feedbacks'
      )
    })
  })
})
