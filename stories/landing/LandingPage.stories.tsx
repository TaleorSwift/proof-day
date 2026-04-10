import type { Meta, StoryObj } from '@storybook/react'
import { WelcomeScreen } from '@/components/landing/WelcomeScreen'

const meta: Meta<typeof WelcomeScreen> = {
  title: 'pages/LandingPage',
  component: WelcomeScreen,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Estado Default — welcome screen sin sesión activa.
 * Muestra logo, H1, subtítulo, CTA naranja y texto legal.
 */
export const Default: Story = {}
