// @vitest-environment jsdom
// Story 12.5 — Tests del componente NotificationBell
// TDD Outside-In: tests escritos ANTES de la implementación
//
// - badge visible cuando hay notificaciones no leídas
// - badge oculto cuando no hay notificaciones
// - click en notificación llama PATCH /api/notifications/[id]
// - click en notificación con projectSlug y communitySlug navega a la ruta

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mock de next/navigation
// ---------------------------------------------------------------------------

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// ---------------------------------------------------------------------------
// Import del componente — DESPUÉS de los mocks
// ---------------------------------------------------------------------------

import { NotificationBell } from '@/components/shared/NotificationBell'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_NOTIF_UNREAD = {
  id: 'notif-001',
  userId: 'user-001',
  type: 'ai_synthesis_ready',
  payload: {
    projectId: 'project-001',
    projectSlug: 'my-project',
    projectTitle: 'Mi Proyecto',
    communitySlug: 'startup-madrid',
  },
  read: false,
  createdAt: '2026-05-07T10:00:00Z',
}

const MOCK_NOTIF_WITHOUT_SLUGS = {
  id: 'notif-002',
  userId: 'user-001',
  type: 'ai_synthesis_ready',
  payload: {
    projectId: 'project-002',
    projectTitle: 'Otro Proyecto',
  },
  read: false,
  createdAt: '2026-05-07T09:00:00Z',
}

const MOCK_NOTIF_NEW_ITERATION = {
  id: 'notif-003',
  userId: 'user-001',
  type: 'new_iteration_ready',
  payload: {
    projectId: 'project-003',
    projectSlug: 'proyecto-iteracion',
    projectTitle: 'Proyecto con Iteración',
    versionNumber: 2,
    communitySlug: 'startup-madrid',
  },
  read: false,
  createdAt: '2026-05-07T11:00:00Z',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetchSuccess(data: unknown) {
  return vi.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data }),
  } as Response)
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

afterEach(() => {
  vi.restoreAllMocks()
  mockPush.mockReset()
})

// ---------------------------------------------------------------------------
// Suite: render inicial y fetch
// ---------------------------------------------------------------------------

describe('NotificationBell — render inicial', () => {
  it('renderiza el botón con data-testid="notification-bell"', async () => {
    mockFetchSuccess([])

    render(<NotificationBell />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
    })
  })

  it('llama a GET /api/notifications al montar', async () => {
    const fetchSpy = mockFetchSuccess([])

    render(<NotificationBell />)

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/notifications')
    })
  })
})

// ---------------------------------------------------------------------------
// Suite: badge
// ---------------------------------------------------------------------------

describe('NotificationBell — badge', () => {
  it('muestra el badge con data-testid="notification-badge" cuando hay notificaciones no leídas', async () => {
    mockFetchSuccess([MOCK_NOTIF_UNREAD])

    render(<NotificationBell />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-badge')).toBeInTheDocument()
    })
  })

  it('el badge muestra el número correcto de notificaciones no leídas', async () => {
    mockFetchSuccess([MOCK_NOTIF_UNREAD, MOCK_NOTIF_WITHOUT_SLUGS])

    render(<NotificationBell />)

    await waitFor(() => {
      const badge = screen.getByTestId('notification-badge')
      expect(badge).toHaveTextContent('2')
    })
  })

  it('NO muestra el badge cuando no hay notificaciones', async () => {
    mockFetchSuccess([])

    render(<NotificationBell />)

    // Esperamos a que el fetch termine
    await waitFor(() => {
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: dropdown con notificaciones
// ---------------------------------------------------------------------------

describe('NotificationBell — dropdown', () => {
  it('muestra los items de notificación con data-testid correcto al abrir', async () => {
    mockFetchSuccess([MOCK_NOTIF_UNREAD])

    const user = userEvent.setup()
    render(<NotificationBell />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('notification-bell'))

    await waitFor(() => {
      expect(
        screen.getByTestId(`notification-item-${MOCK_NOTIF_UNREAD.id}`)
      ).toBeInTheDocument()
    })
  })

  it('muestra el título del proyecto en el item de notificación', async () => {
    mockFetchSuccess([MOCK_NOTIF_UNREAD])

    const user = userEvent.setup()
    render(<NotificationBell />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('notification-bell'))

    await waitFor(() => {
      expect(screen.getByText('Mi Proyecto')).toBeInTheDocument()
    })
  })
})

// ---------------------------------------------------------------------------
// Suite: click en notificación — PATCH + navegación
// ---------------------------------------------------------------------------

describe('NotificationBell — click en notificación', () => {
  beforeEach(() => {
    // Primer fetch: GET notificaciones
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [MOCK_NOTIF_UNREAD] }),
      } as Response)
      // Segundo fetch: PATCH marcar como leída
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { ...MOCK_NOTIF_UNREAD, read: true },
        }),
      } as Response)
  })

  it('llama a PATCH /api/notifications/[id] al hacer click', async () => {
    const user = userEvent.setup()
    render(<NotificationBell />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('notification-bell'))

    await waitFor(() => {
      expect(
        screen.getByTestId(`notification-item-${MOCK_NOTIF_UNREAD.id}`)
      ).toBeInTheDocument()
    })

    await user.click(screen.getByTestId(`notification-item-${MOCK_NOTIF_UNREAD.id}`))

    await waitFor(() => {
      const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls as [string, RequestInit | undefined][]
      const patchCall = calls.find(([url, opts]) =>
        url === `/api/notifications/${MOCK_NOTIF_UNREAD.id}` &&
        opts?.method === 'PATCH'
      )
      expect(patchCall).toBeDefined()
    })
  })

  it('navega a la ruta del proyecto cuando tiene communitySlug y projectSlug', async () => {
    const user = userEvent.setup()
    render(<NotificationBell />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('notification-bell'))

    await waitFor(() => {
      expect(
        screen.getByTestId(`notification-item-${MOCK_NOTIF_UNREAD.id}`)
      ).toBeInTheDocument()
    })

    await user.click(screen.getByTestId(`notification-item-${MOCK_NOTIF_UNREAD.id}`))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        '/communities/startup-madrid/projects/my-project'
      )
    })
  })
})

// ---------------------------------------------------------------------------
// Suite: new_iteration_ready — subtexto y navegación
// ---------------------------------------------------------------------------

describe('NotificationBell — new_iteration_ready', () => {
  it('muestra "Nueva versión disponible — vN" para notificaciones new_iteration_ready', async () => {
    mockFetchSuccess([MOCK_NOTIF_NEW_ITERATION])

    const user = userEvent.setup()
    render(<NotificationBell />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('notification-bell'))

    await waitFor(() => {
      expect(screen.getByText('Nueva versión disponible — v2')).toBeInTheDocument()
    })
  })

  it('muestra el projectTitle del payload como título en new_iteration_ready', async () => {
    mockFetchSuccess([MOCK_NOTIF_NEW_ITERATION])

    const user = userEvent.setup()
    render(<NotificationBell />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('notification-bell'))

    await waitFor(() => {
      expect(screen.getByText('Proyecto con Iteración')).toBeInTheDocument()
    })
  })

  it('sigue mostrando "Síntesis IA disponible" para notificaciones ai_synthesis_ready', async () => {
    mockFetchSuccess([MOCK_NOTIF_UNREAD])

    const user = userEvent.setup()
    render(<NotificationBell />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('notification-bell'))

    await waitFor(() => {
      expect(screen.getByText('Síntesis IA disponible')).toBeInTheDocument()
    })
  })

  it('navega a la ruta correcta al hacer click en notificación new_iteration_ready', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [MOCK_NOTIF_NEW_ITERATION] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { ...MOCK_NOTIF_NEW_ITERATION, read: true } }),
      } as Response)

    const user = userEvent.setup()
    render(<NotificationBell />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('notification-bell'))

    await waitFor(() => {
      expect(
        screen.getByTestId(`notification-item-${MOCK_NOTIF_NEW_ITERATION.id}`)
      ).toBeInTheDocument()
    })

    await user.click(screen.getByTestId(`notification-item-${MOCK_NOTIF_NEW_ITERATION.id}`))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        '/communities/startup-madrid/projects/proyecto-iteracion'
      )
    })
  })
})

// ---------------------------------------------------------------------------
// Suite: feedback_attributed — subtexto y navegación
// ---------------------------------------------------------------------------

const MOCK_NOTIF_FEEDBACK_ATTRIBUTED = {
  id: 'notif-004',
  userId: 'user-001',
  type: 'feedback_attributed',
  payload: {
    projectId: 'project-004',
    projectSlug: 'proyecto-atribuido',
    projectTitle: 'Proyecto Atribuido',
    versionNumber: 1,
    communitySlug: 'startup-madrid',
  },
  read: false,
  createdAt: '2026-05-07T12:00:00Z',
}

const MOCK_NOTIF_FEEDBACK_ATTRIBUTED_NO_VERSION = {
  id: 'notif-005',
  userId: 'user-001',
  type: 'feedback_attributed',
  payload: {
    projectId: 'project-005',
    projectSlug: 'proyecto-atribuido-sin-version',
    projectTitle: 'Proyecto Sin Versión',
    communitySlug: 'startup-madrid',
  },
  read: false,
  createdAt: '2026-05-07T12:00:00Z',
}

describe('NotificationBell — feedback_attributed', () => {
  it('muestra "Tu feedback fue registrado en v1" para notificaciones feedback_attributed', async () => {
    mockFetchSuccess([MOCK_NOTIF_FEEDBACK_ATTRIBUTED])

    const user = userEvent.setup()
    render(<NotificationBell />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('notification-bell'))

    await waitFor(() => {
      expect(screen.getByText('Tu feedback fue registrado en v1')).toBeInTheDocument()
    })
  })

  it('muestra texto fallback cuando feedback_attributed no tiene versionNumber', async () => {
    mockFetchSuccess([MOCK_NOTIF_FEEDBACK_ATTRIBUTED_NO_VERSION])

    const user = userEvent.setup()
    render(<NotificationBell />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('notification-bell'))

    await waitFor(() => {
      expect(screen.getByText('Tu feedback fue registrado en esta versión')).toBeInTheDocument()
    })
  })

  it('muestra el projectTitle del payload como título en feedback_attributed', async () => {
    mockFetchSuccess([MOCK_NOTIF_FEEDBACK_ATTRIBUTED])

    const user = userEvent.setup()
    render(<NotificationBell />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('notification-bell'))

    await waitFor(() => {
      expect(screen.getByText('Proyecto Atribuido')).toBeInTheDocument()
    })
  })

  it('navega a la ruta correcta al hacer click en notificación feedback_attributed', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [MOCK_NOTIF_FEEDBACK_ATTRIBUTED] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { ...MOCK_NOTIF_FEEDBACK_ATTRIBUTED, read: true } }),
      } as Response)

    const user = userEvent.setup()
    render(<NotificationBell />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('notification-bell'))

    await waitFor(() => {
      expect(
        screen.getByTestId(`notification-item-${MOCK_NOTIF_FEEDBACK_ATTRIBUTED.id}`)
      ).toBeInTheDocument()
    })

    await user.click(screen.getByTestId(`notification-item-${MOCK_NOTIF_FEEDBACK_ATTRIBUTED.id}`))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        '/communities/startup-madrid/projects/proyecto-atribuido'
      )
    })
  })
})

// ---------------------------------------------------------------------------
// Suite: click en notificación sin slugs — no navega
// ---------------------------------------------------------------------------

describe('NotificationBell — click sin slugs', () => {
  it('NO navega cuando la notificación no tiene communitySlug o projectSlug', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [MOCK_NOTIF_WITHOUT_SLUGS] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { ...MOCK_NOTIF_WITHOUT_SLUGS, read: true },
        }),
      } as Response)

    const user = userEvent.setup()
    render(<NotificationBell />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('notification-bell'))

    await waitFor(() => {
      expect(
        screen.getByTestId(`notification-item-${MOCK_NOTIF_WITHOUT_SLUGS.id}`)
      ).toBeInTheDocument()
    })

    await user.click(screen.getByTestId(`notification-item-${MOCK_NOTIF_WITHOUT_SLUGS.id}`))

    await waitFor(() => {
      const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls as [string, RequestInit | undefined][]
      const patchCall = calls.find(([url, opts]) =>
        url === `/api/notifications/${MOCK_NOTIF_WITHOUT_SLUGS.id}` &&
        opts?.method === 'PATCH'
      )
      expect(patchCall).toBeDefined()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })
})
