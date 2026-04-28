import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LoginForm } from '@/components/auth/LoginForm'

const meta: Meta<typeof LoginForm> = {
  title: 'Auth/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Estado inicial — campo email vacío, listo para recibir input.
 * Muestra logo, titular, subtítulo y texto legal sin card.
 */
export const Default: Story = {
  args: {},
}

/**
 * Estado de error — link de magic link inválido o expirado.
 * Se muestra cuando el usuario llega desde /login?error=link-invalid.
 */
export const WithLinkInvalidError: Story = {
  args: {
    errorParam: 'link-invalid',
  },
}

/**
 * Estado "check email" — formulario enviado con éxito.
 * Muestra logo + mensaje de confirmación, sin card ni formulario.
 */
export const CheckEmail: Story = {
  args: {
    initialSent: true,
  },
}

/**
 * Estado server error — Supabase devuelve un error al enviar el magic link.
 * Se muestra cuando sendMagicLink devuelve { error: '...' }.
 * Usa errorParam con valor distinto de 'link-invalid' para mostrar el error
 * genérico sin el CTA "Solicitar un nuevo link".
 */
export const ServerError: Story = {
  args: {
    initialServerError: 'No pudimos enviar el email. Intenta de nuevo.',
  },
}
