import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { InactiveBanner } from '@/components/projects/InactiveBanner'

const meta = {
  title: 'Projects/InactiveBanner',
  component: InactiveBanner,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof InactiveBanner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
