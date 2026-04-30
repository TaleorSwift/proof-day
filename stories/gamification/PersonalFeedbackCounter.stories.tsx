import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { spyOn } from 'storybook/test'
import { PersonalFeedbackCounter } from '@/components/gamification/PersonalFeedbackCounter'
import * as gamificationApi from '@/lib/api/gamification'

const meta = {
  title: 'Gamification/PersonalFeedbackCounter',
  component: PersonalFeedbackCounter,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof PersonalFeedbackCounter>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

// Estado de carga inicial — sin mock, el componente muestra el skeleton
export const Cargando: Story = {
  name: 'Cargando (estado inicial)',
  parameters: {
    docs: {
      description: {
        story:
          'Skeleton visible mientras getFeedbackCount está en vuelo. Sin mock de la API, el componente queda en estado de carga.',
      },
    },
  },
  args: {
    communityId: 'comm-storybook',
  },
}

// 0 feedbacks — texto "Has dado 0 feedbacks"
export const CeroFeedbacks: Story = {
  name: 'Sin feedbacks (count = 0)',
  args: {
    communityId: 'comm-storybook',
  },
  play: async () => {
    spyOn(gamificationApi, 'getFeedbackCount').mockResolvedValue({
      count: 0,
      communityId: 'comm-storybook',
    })
  },
}

// 1 feedback — texto singular "Has dado 1 feedback"
export const UnFeedback: Story = {
  name: 'Un feedback (singular)',
  args: {
    communityId: 'comm-storybook',
  },
  play: async () => {
    spyOn(gamificationApi, 'getFeedbackCount').mockResolvedValue({
      count: 1,
      communityId: 'comm-storybook',
    })
  },
}

// Varios feedbacks — texto plural "Has dado N feedbacks"
export const VariosFeedbacks: Story = {
  name: 'Varios feedbacks (plural)',
  args: {
    communityId: 'comm-storybook',
  },
  play: async () => {
    spyOn(gamificationApi, 'getFeedbackCount').mockResolvedValue({
      count: 14,
      communityId: 'comm-storybook',
    })
  },
}
