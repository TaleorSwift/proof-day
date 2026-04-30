import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FeedbackCounter } from '@/components/feedback/FeedbackCounter'

const meta = {
  title: 'Feedback/FeedbackCounter',
  component: FeedbackCounter,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof FeedbackCounter>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Story: Cero feedbacks
// ---------------------------------------------------------------------------

export const Cero: Story = {
  name: 'Cero feedbacks — plural',
  args: {
    count: 0,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Muestra "0 feedbacks" (plural). El componente usa el plural cuando count es 0 o más de 1.',
      },
    },
  },
}

// ---------------------------------------------------------------------------
// Story: Un solo feedback
// ---------------------------------------------------------------------------

export const Uno: Story = {
  name: 'Un feedback — singular',
  args: {
    count: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Muestra "1 feedback" en singular. El componente aplica el singular únicamente cuando count === 1.',
      },
    },
  },
}

// ---------------------------------------------------------------------------
// Story: Varios feedbacks
// ---------------------------------------------------------------------------

export const Varios: Story = {
  name: 'Varios feedbacks — plural',
  args: {
    count: 42,
  },
  parameters: {
    docs: {
      description: {
        story: 'Muestra "42 feedbacks" (plural). Representa el caso de múltiples entradas.',
      },
    },
  },
}
