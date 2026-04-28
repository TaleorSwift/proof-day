import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { BackButton } from '@/components/shared/BackButton'

const meta = {
  title: 'Shared/BackButton',
  component: BackButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BackButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    href: '/',
  },
}

export const CustomLabel: Story = {
  name: 'Con etiqueta personalizada',
  args: {
    href: '/communities/startup-madrid',
    label: 'Volver a la comunidad',
  },
}
