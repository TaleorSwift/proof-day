import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ContentTag } from '@/components/shared/ContentTag'

const meta = {
  title: 'Shared/ContentTag',
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
} satisfies Meta<typeof ContentTag>

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
