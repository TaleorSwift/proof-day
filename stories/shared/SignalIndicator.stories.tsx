import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SignalIndicator } from '@/components/shared/SignalIndicator'

const meta: Meta<typeof SignalIndicator> = {
  title: 'Shared/SignalIndicator',
  component: SignalIndicator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    level: {
      control: 'select',
      options: ['promising', 'needs-work', 'weak'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Promising: Story = {
  name: 'Prometedor',
  args: {
    level: 'promising',
    label: 'Señal prometedora',
  },
}

export const NeedsWork: Story = {
  name: 'Necesita trabajo',
  args: {
    level: 'needs-work',
    label: 'Necesita iteración',
  },
}

export const Weak: Story = {
  name: 'Débil',
  args: {
    level: 'weak',
    label: 'Señal débil',
  },
}
