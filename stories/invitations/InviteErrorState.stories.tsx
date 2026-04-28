import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { InviteErrorState } from '@/components/invitations/InviteErrorState'

const meta = {
  title: 'Invitations/InviteErrorState',
  component: InviteErrorState,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof InviteErrorState>

export default meta
type Story = StoryObj<typeof meta>

// Token inválido o inexistente (AC 7 — story 2.2)
export const TokenInvalido: Story = {
  args: {
    message: 'Este link ya no es válido',
  },
}

// Token ya usado — mismo mensaje (AC 7 — unificado en story 2.2 CR#5 M5)
export const TokenYaUsado: Story = {
  args: {
    message: 'Este link ya no es válido',
  },
}

// Error de procesamiento durante el join
export const ErrorProcesamiento: Story = {
  args: {
    message: 'Error al procesar el link. Por favor, inténtalo de nuevo.',
  },
}
