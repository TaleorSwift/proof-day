// NavbarClient envuelve Navbar añadiendo la lógica de logout con Supabase.
// En Storybook el logout no ejecuta ninguna llamada real; useRouter se
// proporciona via parameters.nextjs.navigation.
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import { NavbarClient } from '@/components/layout/NavbarClient'

const meta = {
  title: 'Layout/NavbarClient',
  component: NavbarClient,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        push: fn(),
      },
    },
  },
  argTypes: {
    isAuthenticated: {
      control: 'boolean',
    },
    userName: {
      control: 'text',
    },
  },
} satisfies Meta<typeof NavbarClient>

export default meta
type Story = StoryObj<typeof meta>

/** Usuario autenticado con nombre completo. */
export const Autenticado: Story = {
  args: {
    isAuthenticated: true,
    userName: 'Ana García',
  },
}

/** Usuario autenticado sin nombre — muestra solo el avatar con inicial del email. */
export const AutenticadoSinNombre: Story = {
  name: 'Autenticado sin nombre',
  args: {
    isAuthenticated: true,
  },
}

/** Usuario no autenticado — muestra enlace "Iniciar sesión". */
export const NoAutenticado: Story = {
  name: 'No autenticado',
  args: {
    isAuthenticated: false,
  },
}
