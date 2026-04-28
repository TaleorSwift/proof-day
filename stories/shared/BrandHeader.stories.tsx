import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { BrandHeader } from '@/components/shared/BrandHeader'

const meta = {
  title: 'Shared/BrandHeader',
  component: BrandHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof BrandHeader>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithCustomSubtitle: Story = {
  args: {
    subtitle: 'Revisa tu email — tenemos algo que decirte.',
  },
}
