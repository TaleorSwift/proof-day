import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LegalNotice } from '@/components/shared/LegalNotice'

const meta = {
  title: 'Shared/LegalNotice',
  component: LegalNotice,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof LegalNotice>
export default meta
type Story = StoryObj<typeof meta>

/** Texto legal canónico — comportamiento por defecto. */
export const Default: Story = {}

/** Texto alternativo vía prop children — para variantes futuras. */
export const WithCustomText: Story = {
  args: {
    children: 'Texto legal personalizado para variantes de producto.',
  },
}
