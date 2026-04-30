import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { spyOn } from 'storybook/test'
import { TopReviewerWidget } from '@/components/gamification/TopReviewerWidget'
import * as gamificationApi from '@/lib/api/gamification'

const meta = {
  title: 'Gamification/TopReviewerWidget',
  component: TopReviewerWidget,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof TopReviewerWidget>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

// Estado carga — skeleton (data === undefined), sin mock de la API
export const Cargando: Story = {
  name: 'Cargando (estado inicial)',
  parameters: {
    docs: {
      description: {
        story:
          'Skeleton visible mientras getTopReviewer está en vuelo. Sin mock de la API, el componente queda en estado de carga.',
      },
    },
  },
  args: {
    communityId: 'comm-storybook',
  },
}

// Con reviewer — muestra nombre, iniciales/avatar y conteo de feedbacks esta semana
export const ConReviewer: Story = {
  name: 'Con reviewer (datos completos)',
  args: {
    communityId: 'comm-storybook',
  },
  play: async () => {
    spyOn(gamificationApi, 'getTopReviewer').mockResolvedValue({
      userId: 'user-ana',
      name: 'Ana García',
      avatarUrl: 'https://picsum.photos/seed/ana-garcia/40/40',
      feedbackCount: 7,
    })
  },
}

// Con reviewer sin avatar — muestra iniciales generadas del nombre
export const ConReviewerSinAvatar: Story = {
  name: 'Con reviewer sin avatar (iniciales)',
  args: {
    communityId: 'comm-storybook',
  },
  play: async () => {
    spyOn(gamificationApi, 'getTopReviewer').mockResolvedValue({
      userId: 'user-bruno',
      name: 'Bruno López',
      avatarUrl: null,
      feedbackCount: 3,
    })
  },
}

// Empty state — ningún reviewer esta semana (data === null, sin error)
export const SinReviewer: Story = {
  name: 'Sin reviewer (empty state)',
  args: {
    communityId: 'comm-storybook',
  },
  play: async () => {
    spyOn(gamificationApi, 'getTopReviewer').mockResolvedValue(null)
  },
}
