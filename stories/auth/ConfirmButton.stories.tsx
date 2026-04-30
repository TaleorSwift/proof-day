import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import { ConfirmButton } from '@/components/auth/ConfirmButton'

/**
 * ConfirmButton — botón que llama a supabase.auth.verifyOtp para confirmar
 * un token de invitación o signup. Muestra estados de carga y error.
 *
 * En Storybook el componente usa useRouter de Next.js, que se proporciona
 * via parameters.nextjs.navigation.
 */
const meta = {
  title: 'Auth/ConfirmButton',
  component: ConfirmButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    nextjs: {
      appDirectory: true,
      navigation: {
        push: fn(),
      },
    },
  },
} satisfies Meta<typeof ConfirmButton>

export default meta
type Story = StoryObj<typeof meta>

/** Estado por defecto — token válido, listo para confirmar. */
export const Pendiente: Story = {
  args: {
    token: 'token-hash-ejemplo-valido',
    type: 'invite',
    redirectTo: '/communities',
  },
}

/** Confirmación de signup con redirección personalizada. */
export const Signup: Story = {
  name: 'Signup (tipo signup)',
  args: {
    token: 'token-hash-signup-ejemplo',
    type: 'signup',
    redirectTo: '/communities',
  },
}

/** Magic link — type no especificado, usa el valor por defecto. */
export const MagicLink: Story = {
  name: 'MagicLink (sin type)',
  args: {
    token: 'token-hash-magiclink-ejemplo',
    redirectTo: '/communities',
  },
}

/**
 * Estado de error — simula que el OTP ha expirado.
 * Para mostrar el mensaje de error en Storybook se puede activar
 * el estado manualmente haciendo clic en el botón con un token inválido.
 */
export const RedirectPersonalizado: Story = {
  name: 'Redirección personalizada',
  args: {
    token: 'token-hash-ejemplo',
    type: 'invite',
    redirectTo: '/communities/producto-alpha',
  },
}
