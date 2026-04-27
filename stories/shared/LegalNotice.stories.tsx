import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LegalNotice } from '@/components/shared/LegalNotice'

const meta: Meta<typeof LegalNotice> = {
  title: 'Shared/LegalNotice',
  component: LegalNotice,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof LegalNotice>

export const Default: Story = {}
