import type { Meta, StoryObj } from '@storybook/react'
import { LoginForm } from '@/components/auth/LoginForm'

const meta: Meta<typeof LoginForm> = {
  title: 'auth/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Estado inicial — campo email vacío, listo para recibir input.
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
