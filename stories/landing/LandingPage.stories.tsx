import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { WelcomeScreen } from '@/components/landing/WelcomeScreen'

const meta = {
  title: 'Pages/Landing',
  component: WelcomeScreen,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof WelcomeScreen>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Estado Default — welcome screen sin sesión activa.
 * Muestra logo, H1, subtítulo, CTA naranja y texto legal.
 */
export const Default: Story = {}

/**
 * Variante MobileFrame — wrapper de containment con 375px de ancho fijo
 * (iPhone SE / pantalla pequeña). NO es un viewport real: solo restringe
 * el ancho del contenedor para visualizar el layout en móvil.
 *
 * Para un viewport real (que afecte a `window.innerWidth`, media queries
 * del navegador, etc.) haría falta `@storybook/addon-viewport`, que
 * actualmente no está instalado en el proyecto (fuera de scope).
 */
export const MobileFrame: Story = {
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
