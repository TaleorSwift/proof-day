import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Spinner } from '@/components/shared/Spinner'

const meta = {
  title: 'Shared/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Spinner>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithCustomLabel: Story = {
  args: { ariaLabel: 'Cargando comunidades…' },
}
