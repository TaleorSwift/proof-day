import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DraftBanner } from '@/components/projects/DraftBanner'

const meta = {
  title: 'Projects/DraftBanner',
  component: DraftBanner,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof DraftBanner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
