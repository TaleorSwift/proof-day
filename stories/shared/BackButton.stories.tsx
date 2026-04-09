import type { Meta, StoryObj } from '@storybook/react'
import { BackButton } from '@/components/shared/BackButton'

const meta: Meta<typeof BackButton> = {
  title: 'shared/BackButton',
  component: BackButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

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
