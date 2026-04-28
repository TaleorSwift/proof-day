import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { EmptyCommunitiesState } from '@/components/communities/EmptyCommunitiesState'

const meta = {
  title: 'Communities/EmptyCommunitiesState',
  component: EmptyCommunitiesState,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof EmptyCommunitiesState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
