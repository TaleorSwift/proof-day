import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { FeedbackTopicChips } from '@/components/projects/FeedbackTopicChips'

const meta: Meta<typeof FeedbackTopicChips> = {
  title: 'Projects/FeedbackTopicChips',
  component: FeedbackTopicChips,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof FeedbackTopicChips>

export const SinSeleccion: Story = {
  args: {
    value: [],
    onChange: () => {},
  },
}

export const TresSeleccionados: Story = {
  args: {
    value: ['problem_clarity', 'technical_feasibility', 'market_fit'],
    onChange: () => {},
  },
}

export const TodosSeleccionados: Story = {
  args: {
    value: [
      'problem_clarity',
      'willingness_to_use',
      'technical_feasibility',
      'missing_features',
      'market_fit',
      'ux_concerns',
    ],
    onChange: () => {},
  },
}

function InteractivoTemplate() {
  const [selected, setSelected] = useState<string[]>([])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <FeedbackTopicChips value={selected} onChange={setSelected} />
      <p style={{ fontSize: '14px', color: '#6B6B63' }}>
        Seleccionados: {selected.length > 0 ? selected.join(', ') : 'ninguno'}
      </p>
    </div>
  )
}

export const Interactivo: Story = {
  render: () => <InteractivoTemplate />,
}
