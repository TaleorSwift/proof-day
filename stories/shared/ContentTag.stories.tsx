import type { Meta, StoryObj } from '@storybook/react'
import { ContentTag } from '@/components/shared/ContentTag'

const meta: Meta<typeof ContentTag> = {
  title: 'shared/ContentTag',
  component: ContentTag,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Productividad',
    variant: 'default',
  },
}

export const Outline: Story = {
  name: 'Outline',
  args: {
    label: 'B2B',
    variant: 'outline',
  },
}

export const LongLabel: Story = {
  name: 'Etiqueta larga',
  args: {
    label: 'Gestión de equipos remotos',
    variant: 'default',
  },
}
