import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CommunityList } from '@/components/communities/CommunityList'

const makeCommunity = (id: string, name: string, slug: string, memberCount: number) => ({
  id,
  name,
  slug,
  description: `Descripción de la comunidad ${name}.`,
  image_url: `https://picsum.photos/seed/${slug}/200/200`,
  created_by: 'user-001',
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-15T10:00:00Z',
  member_count: memberCount,
})

const meta = {
  title: 'Communities/CommunityList',
  component: CommunityList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof CommunityList>

export default meta
type Story = StoryObj<typeof meta>

export const TwoCards: Story = {
  args: {
    communities: [
      makeCommunity('comm-001', 'Producto Alpha', 'producto-alpha', 8),
      makeCommunity('comm-002', 'Beta Testers', 'beta-testers', 15),
    ],
  },
}

export const ManyCards: Story = {
  args: {
    communities: [
      makeCommunity('comm-001', 'Producto Alpha', 'producto-alpha', 8),
      makeCommunity('comm-002', 'Beta Testers', 'beta-testers', 15),
      makeCommunity('comm-003', 'Innovación 2026', 'innovacion-2026', 3),
      makeCommunity('comm-004', 'Equipo Diseño', 'equipo-diseno', 22),
      makeCommunity('comm-005', 'Startup Founders', 'startup-founders', 47),
      makeCommunity('comm-006', 'Growth Hacking', 'growth-hacking', 12),
    ],
  },
}
