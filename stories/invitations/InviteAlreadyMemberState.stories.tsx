import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { InviteAlreadyMemberState } from '@/components/invitations/InviteAlreadyMemberState'

const meta = {
  title: 'Invitations/InviteAlreadyMemberState',
  component: InviteAlreadyMemberState,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof InviteAlreadyMemberState>

export default meta
type Story = StoryObj<typeof meta>

// Usuario ya es miembro de la comunidad (AC 6 — story 2.2)
export const YaEsMiembro: Story = {}
