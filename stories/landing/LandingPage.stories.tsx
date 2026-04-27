import type { Meta, StoryObj } from '@storybook/nextjs-vite'
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

/**
 * Variante Mobile — viewport 375px (iPhone SE / pantalla pequeña).
 * Decorator manual porque el proyecto no usa `@storybook/addon-viewport`.
 */
export const Mobile: Story = {
  decorators: [
    (Story) => (
      <div
        style={{
          width: 375,
          margin: '0 auto',
          borderLeft: '1px solid #e5e5e5',
          borderRight: '1px solid #e5e5e5',
          minHeight: '100vh',
        }}
      >
        <Story />
      </div>
    ),
  ],
}
