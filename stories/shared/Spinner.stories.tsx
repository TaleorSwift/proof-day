import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Spinner } from '@/components/shared/Spinner'

const meta: Meta<typeof Spinner> = {
  title: 'Shared/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof Spinner>

export const Default: Story = {}

export const WithCustomLabel: Story = {
  args: { ariaLabel: 'Cargando comunidades…' },
}
