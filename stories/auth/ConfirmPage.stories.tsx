import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import { BrandHeader } from '@/components/shared/BrandHeader'
import { ConfirmButton } from '@/components/auth/ConfirmButton'

// Composición visual de la página /auth/confirm.
// ConfirmPage es un Server Component — la story compone directamente
// BrandHeader + ConfirmButton (caso válido) o un estado de error (caso inválido)
// replicando el JSX que el usuario vería en cada rama.

interface ConfirmPageCompositionProps {
  /** Cuando está presente, muestra la UI de confirmación con el botón. */
  token?: string
  type?: string
  redirectTo?: string
  /** Cuando true, simula el estado de parámetros inválidos antes de la redirección. */
  missingParams?: boolean
}

const ConfirmPageComposition = ({
  token = 'token-hash-magiclink-ejemplo',
  type = 'magiclink',
  redirectTo = '/communities',
  missingParams = false,
}: ConfirmPageCompositionProps) => {
  if (missingParams) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
        <BrandHeader subtitle="El enlace no es válido o ha expirado." />
        <p className="text-(--color-weak-text) text-(--text-sm) text-center">
          Redirigiendo a /login…
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <BrandHeader subtitle="Un último paso para acceder." />
      <ConfirmButton token={token} type={type} redirectTo={redirectTo} />
    </div>
  )
}

const meta = {
  title: 'Auth/ConfirmPage',
  component: ConfirmPageComposition,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        push: fn(),
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: 'var(--color-background)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ConfirmPageComposition>

export default meta
type Story = StoryObj<typeof meta>

/** Estado por defecto — token válido, listo para confirmar el magic link. */
export const Default: Story = {
  args: {
    token: 'token-hash-magiclink-ejemplo',
    type: 'magiclink',
    redirectTo: '/communities',
    missingParams: false,
  },
}

/**
 * Estado de parámetros inválidos — token o type ausentes en la URL.
 * La página real redirige inmediatamente a /login?error=link-invalid;
 * esta variante muestra el estado visual antes de la redirección para
 * documentación y QA visual.
 */
export const MissingParams: Story = {
  args: {
    missingParams: true,
  },
}
