import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CommunityCard } from '@/components/communities/CommunityCard'

const baseCommunity = {
  id: 'comm-001',
  name: 'Producto Alpha',
  slug: 'producto-alpha',
  description: 'Espacio privado para validar ideas de producto con early adopters del equipo.',
  image_url: 'https://picsum.photos/seed/alpha/200/200',
  created_by: 'user-001',
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-15T10:00:00Z',
  member_count: 8,
}

const meta: Meta<typeof CommunityCard> = {
  title: 'Communities/CommunityCard',
  component: CommunityCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '320px' }}>
        <Story />
      </div>
    ),
  ],
}

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
      image_url: null,
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
      image_url: null,
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
      member_count: 1,
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
      member_count: 42,
    },
  },
}
