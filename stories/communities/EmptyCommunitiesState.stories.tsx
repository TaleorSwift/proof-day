import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { EmptyCommunitiesState } from '@/components/communities/EmptyCommunitiesState'

const meta: Meta<typeof EmptyCommunitiesState> = {
  title: 'Communities/EmptyCommunitiesState',
  component: EmptyCommunitiesState,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
