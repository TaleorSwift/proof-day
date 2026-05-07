// Story 10.5 — T8.1: Storybook story para WizardStepHypothesis

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import { WizardStepHypothesis } from '@/components/projects/wizard/WizardStepHypothesis'
import type { WizardFormData } from '@/components/projects/ProjectWizard'

const EMPTY_FORM_DATA: WizardFormData = {
  templateId: null,
  selectedTemplate: null,
  title: '',
  tagline: '',
  problem: '',
  solution: '',
  targetUser: '',
  demoLink: '',
  feedbackTopics: [],
  images: [],
  hypothesis: '',
  customQuestion: '',
}

const meta = {
  title: 'Projects/WizardStepHypothesis',
  component: WizardStepHypothesis,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof WizardStepHypothesis>

export default meta
type Story = StoryObj<typeof meta>

/** Campo vacío — estado inicial */
export const SinHipotesis: Story = {
  args: {
    data: EMPTY_FORM_DATA,
    onChange: fn(),
  },
}

/** Campo con hipótesis pre-rellenada */
export const ConHipotesis: Story = {
  args: {
    data: {
      ...EMPTY_FORM_DATA,
      hypothesis: 'Si reducimos el tiempo de onboarding a menos de 5 minutos, entonces la tasa de activación sube un 30%.',
    },
    onChange: fn(),
  },
}
