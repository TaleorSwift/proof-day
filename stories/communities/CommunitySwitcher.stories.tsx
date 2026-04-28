// CommunitySwitcher es un Client Component que usa useRouter de next/navigation.
// Se mockea el router con parameters.nextjs para evitar errores en Storybook.
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CommunitySwitcher } from '@/components/communities/CommunitySwitcher'

const makeCommunity = (id: string, name: string, slug: string) => ({
  id,
  name,
  slug,
  description: `Descripción de ${name}.`,
  image_url: null,
  created_by: 'user-001',
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-15T10:00:00Z',
  member_count: 5,
})

const meta = {
  title: 'Communities/CommunitySwitcher',
  component: CommunitySwitcher,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    nextjs: {
      appDirectory: true,
      navigation: {
        push: () => {},
      },
    },
  },
} satisfies Meta<typeof CommunitySwitcher>

export default meta
type Story = StoryObj<typeof meta>

// Con 1 comunidad: muestra el nombre como texto sin dropdown
export const OneCommunity: Story = {
  args: {
    communities: [makeCommunity('comm-001', 'Producto Alpha', 'producto-alpha')],
    activeCommunitySlug: 'producto-alpha',
  },
}

// Con múltiples comunidades: muestra dropdown con la activa marcada
export const ManyCommunities: Story = {
  args: {
    communities: [
      makeCommunity('comm-001', 'Producto Alpha', 'producto-alpha'),
      makeCommunity('comm-002', 'Beta Testers', 'beta-testers'),
      makeCommunity('comm-003', 'Innovación 2026', 'innovacion-2026'),
    ],
    activeCommunitySlug: 'beta-testers',
  },
}

// Sin comunidad activa seleccionada (muestra "Mis comunidades")
export const SinActiva: Story = {
  args: {
    communities: [
      makeCommunity('comm-001', 'Producto Alpha', 'producto-alpha'),
      makeCommunity('comm-002', 'Beta Testers', 'beta-testers'),
    ],
    activeCommunitySlug: undefined,
  },
}
