import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { WelcomeScreen } from '@/components/landing/WelcomeScreen'

/**
 * WelcomeScreen — pantalla de bienvenida de la aplicación.
 * Componente visual puro extraído de app/page.tsx para facilitar
 * testing y documentación en Storybook sin lógica de autenticación.
 */
const meta = {
  title: 'Landing/WelcomeScreen',
  component: WelcomeScreen,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof WelcomeScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Estado por defecto — welcome screen completa con logo, CTA y texto legal. */
export const Default: Story = {}

/**
 * MobileFrame — contenedor de 375px (iPhone SE) para visualizar
 * el layout en ancho de móvil sin cambiar el viewport real.
 */
export const MobileFrame: Story = {
  name: 'Mobile (375px)',
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
