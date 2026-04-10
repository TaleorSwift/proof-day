import type { Meta, StoryObj } from '@storybook/react'
import { Navbar } from '@/components/layout/Navbar'

const meta: Meta<typeof Navbar> = {
  title: 'layout/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    isAuthenticated: {
      control: 'boolean',
    },
    onLogout: {
      action: 'logout',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Authenticated: Story = {
  args: {
    isAuthenticated: true,
  },
}

export const Unauthenticated: Story = {
  args: {
    isAuthenticated: false,
  },
}
