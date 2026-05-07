import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { NotificationBell } from '@/components/shared/NotificationBell'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const NOTIF_UNREAD_1 = {
  id: 'notif-001',
  userId: 'user-001',
  type: 'ai_synthesis_ready',
  payload: {
    projectId: 'project-001',
    projectSlug: 'mi-startup',
    projectTitle: 'Mi Startup IA',
    communitySlug: 'startup-madrid',
  },
  read: false,
  createdAt: '2026-05-07T10:00:00Z',
}

const NOTIF_UNREAD_2 = {
  id: 'notif-002',
  userId: 'user-001',
  type: 'ai_synthesis_ready',
  payload: {
    projectId: 'project-002',
    projectSlug: 'otro-proyecto',
    projectTitle: 'Otro Proyecto',
    communitySlug: 'startup-madrid',
  },
  read: false,
  createdAt: '2026-05-06T15:30:00Z',
}

const NOTIF_UNREAD_3 = {
  id: 'notif-003',
  userId: 'user-001',
  type: 'ai_synthesis_ready',
  payload: {
    projectId: 'project-003',
    projectSlug: 'tercer-proyecto',
    projectTitle: 'Tercer Proyecto en Análisis',
    communitySlug: 'founders-valencia',
  },
  read: false,
  createdAt: '2026-05-05T09:00:00Z',
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Shared/NotificationBell',
  component: NotificationBell,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof NotificationBell>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Con notificaciones — muestra badge con contador y lista en el dropdown.
 */
export const WithNotifications: Story = {
  name: 'Con notificaciones',
  parameters: {
    fetchMock: {
      mocks: [
        {
          matcher: { url: '/api/notifications', method: 'GET' },
          response: { body: { data: [NOTIF_UNREAD_1, NOTIF_UNREAD_2] } },
        },
      ],
    },
    docs: {
      description: {
        story: 'Campana con 2 notificaciones sin leer. Muestra badge con número y dropdown con items al hacer click.',
      },
    },
  },
  decorators: [
    (Story) => {
      const originalFetch = global.fetch
      global.fetch = async (input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : input.toString()
        if (url.includes('/api/notifications') && !url.includes('/api/notifications/')) {
          return new Response(
            JSON.stringify({ data: [NOTIF_UNREAD_1, NOTIF_UNREAD_2] }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }
        return originalFetch(input)
      }
      return <Story />
    },
  ],
}

/**
 * Sin notificaciones — no muestra badge, dropdown con mensaje vacío.
 */
export const Empty: Story = {
  name: 'Sin notificaciones',
  parameters: {
    docs: {
      description: {
        story: 'Campana sin notificaciones pendientes. No muestra badge. El dropdown indica que no hay notificaciones nuevas.',
      },
    },
  },
  decorators: [
    (Story) => {
      const originalFetch = global.fetch
      global.fetch = async (input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : input.toString()
        if (url.includes('/api/notifications') && !url.includes('/api/notifications/')) {
          return new Response(
            JSON.stringify({ data: [] }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }
        return originalFetch(input)
      }
      return <Story />
    },
  ],
}

/**
 * Badge con múltiples notificaciones — muestra badge con 3.
 */
export const WithBadgeCount: Story = {
  name: 'Badge con múltiples notificaciones',
  parameters: {
    docs: {
      description: {
        story: 'Campana con 3 notificaciones sin leer. El badge muestra el número exacto de notificaciones pendientes.',
      },
    },
  },
  decorators: [
    (Story) => {
      const originalFetch = global.fetch
      global.fetch = async (input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : input.toString()
        if (url.includes('/api/notifications') && !url.includes('/api/notifications/')) {
          return new Response(
            JSON.stringify({ data: [NOTIF_UNREAD_1, NOTIF_UNREAD_2, NOTIF_UNREAD_3] }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }
        return originalFetch(input)
      }
      return <Story />
    },
  ],
}
