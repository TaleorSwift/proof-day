import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { BrandHeader } from '@/components/shared/BrandHeader'

const meta: Meta<typeof BrandHeader> = {
  title: 'Shared/BrandHeader',
  component: BrandHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}
export default meta
type Story = StoryObj<typeof BrandHeader>

export const Default: Story = {}

export const WithCustomSubtitle: Story = {
  args: {
    subtitle: 'Revisa tu email — tenemos algo que decirte.',
  },
}
