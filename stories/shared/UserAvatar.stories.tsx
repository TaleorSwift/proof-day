import type { Meta, StoryObj } from '@storybook/react'
import { UserAvatar } from '@/components/ui/UserAvatar'

const meta: Meta<typeof UserAvatar> = {
  title: 'shared/UserAvatar',
  component: UserAvatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    showName: {
      control: 'boolean',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'Ana García',
    size: 'md',
    showName: false,
  },
}

export const WithName: Story = {
  name: 'Con nombre visible',
  args: {
    name: 'Ana García',
    size: 'md',
    showName: true,
  },
}

export const SmallSize: Story = {
  name: 'Tamaño pequeño',
  args: {
    name: 'Carlos Ruiz',
    size: 'sm',
    showName: false,
  },
}

export const LargeSize: Story = {
  name: 'Tamaño grande',
  args: {
    name: 'María López',
    size: 'lg',
    showName: true,
  },
}

export const ShortName: Story = {
  name: 'Nombre corto',
  args: {
    name: 'Jo',
    size: 'md',
    showName: true,
  },
}

export const LongName: Story = {
  name: 'Nombre largo',
  args: {
    name: 'Francisco Javier Rodríguez Martínez',
    size: 'md',
    showName: true,
  },
}
