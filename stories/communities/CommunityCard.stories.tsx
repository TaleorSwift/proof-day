import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CommunityCard } from '@/components/communities/CommunityCard'

const baseCommunity = {
  id: 'comm-001',
  name: 'Producto Alpha',
  slug: 'producto-alpha',
  description: 'Espacio privado para validar ideas de producto con early adopters del equipo.',
  imageUrl: 'https://picsum.photos/seed/alpha/200/200',
  createdBy: 'user-001',
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
  memberCount: 8,
  // Story 11.1 — reciprocidad
  reciprocityThreshold: 3,
}

const meta = {
  title: 'Communities/CommunityCard',
  component: CommunityCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '320px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CommunityCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    community: baseCommunity,
  },
}

export const SinImagen: Story = {
  args: {
    community: {
      ...baseCommunity,
      id: 'comm-002',
      name: 'Beta Testers',
      slug: 'beta-testers',
      imageUrl: null,
    },
  },
}

export const SinDescripcion: Story = {
  args: {
    community: {
      ...baseCommunity,
      id: 'comm-003',
      name: 'Sin Descripción',
      slug: 'sin-descripcion',
      description: '',
      imageUrl: null,
    },
  },
}

export const SingleMember: Story = {
  args: {
    community: {
      ...baseCommunity,
      id: 'comm-004',
      name: 'Mi Comunidad',
      slug: 'mi-comunidad',
      memberCount: 1,
    },
  },
}

export const MultipleMembers: Story = {
  args: {
    community: {
      ...baseCommunity,
      id: 'comm-005',
      name: 'Gran Comunidad',
      slug: 'gran-comunidad',
      memberCount: 42,
    },
  },
}
