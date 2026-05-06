import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, expect } from 'storybook/test'
import { CommunityHeader } from '@/components/communities/CommunityHeader'

const baseCommunity = {
  id: 'comm-001',
  name: 'Startup Madrid',
  slug: 'startup-madrid',
  description: 'Espacio de validación de ideas para emprendedores de Madrid.',
  imageUrl: 'https://picsum.photos/seed/startup-madrid/200/200',
  createdBy: 'user-001',
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
  memberCount: 12,
  // Story 11.1 — reciprocidad
  reciprocityThreshold: 3,
}

const meta = {
  title: 'Communities/CommunityHeader',
  component: CommunityHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '280px', padding: 'var(--space-4)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CommunityHeader>

export default meta
type Story = StoryObj<typeof meta>

// Vista de miembro sin permisos de administración
export const Default: Story = {
  args: {
    community: baseCommunity,
    isAdmin: false,
  },
}

// Vista de admin — muestra el enlace a Configuración
export const ComoAdmin: Story = {
  args: {
    community: baseCommunity,
    isAdmin: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // El diferencial visual admin es el enlace a Configuración
    await expect(canvas.getByRole('link', { name: /configuración/i })).toBeInTheDocument()
  },
}

// Sin imagen de comunidad — muestra el avatar con inicial
export const SinImagen: Story = {
  args: {
    community: {
      ...baseCommunity,
      id: 'comm-002',
      name: 'Beta Testers',
      slug: 'beta-testers',
      imageUrl: null,
    },
    isAdmin: false,
  },
}

// Sin descripción — la sección de descripción no se renderiza
export const SinDescripcion: Story = {
  args: {
    community: {
      ...baseCommunity,
      id: 'comm-003',
      name: 'Proyecto Stealth',
      slug: 'proyecto-stealth',
      description: '',
      imageUrl: null,
    },
    isAdmin: false,
  },
}

// Un solo miembro — texto en singular "miembro"
export const UnSoloMiembro: Story = {
  args: {
    community: {
      ...baseCommunity,
      id: 'comm-004',
      name: 'Solo Fundador',
      slug: 'solo-fundador',
      memberCount: 1,
    },
    isAdmin: true,
  },
}
