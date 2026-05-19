import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import { BrandHeader } from '@/components/shared/BrandHeader'
import { ConfirmButton } from '@/components/auth/ConfirmButton'

// Composición visual de la página /auth/confirm (caso válido).
// ConfirmPage es un Server Component — la story compone directamente
// BrandHeader + ConfirmButton replicando el JSX del caso válido.

const ConfirmPageComposition = ({
  token,
  type,
  redirectTo,
}: {
  token: string
  type: string
  redirectTo: string
}) => (
  <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
    <BrandHeader subtitle="Un último paso para acceder." />
    <ConfirmButton token={token} type={type} redirectTo={redirectTo} />
  </div>
)

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
  },
}
