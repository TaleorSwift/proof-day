import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ProjectStateActions } from '@/components/projects/ProjectStateActions'

const meta = {
  title: 'Projects/ProjectStateActions',
  component: ProjectStateActions,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ProjectStateActions>

export default meta
type Story = StoryObj<typeof meta>

export const Borrador: Story = {
  args: {
    projectId: 'proj-001',
    currentStatus: 'draft',
    isBuilder: true,
  },
}

export const Live: Story = {
  args: {
    projectId: 'proj-001',
    currentStatus: 'live',
    isBuilder: true,
  },
}

export const NoBuilder: Story = {
  name: 'No Builder (oculto)',
  args: {
    projectId: 'proj-001',
    currentStatus: 'draft',
    isBuilder: false,
  },
}

export const Inactivo: Story = {
  name: 'Inactivo (oculto)',
  args: {
    projectId: 'proj-001',
    currentStatus: 'inactive',
    isBuilder: true,
  },
}
