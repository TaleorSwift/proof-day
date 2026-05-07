// Story 10.4 — T8.1: Storybook story para ProjectPreview

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import { ProjectPreview } from '@/components/projects/ProjectPreview'
import type { WizardFormData } from '@/components/projects/ProjectWizard'

// ── Datos de base ─────────────────────────────────────────────────────────────

const FULL_FORM_DATA: WizardFormData = {
  templateId: '11111111-0000-0000-0000-000000000001',
  selectedTemplate: null,
  title: 'Pulse Check',
  tagline: 'Valida tu idea en horas con feedback real de builders',
  problem: 'Los equipos remotos no tienen visibilidad sobre el bienestar del equipo en tiempo real, lo que provoca que los problemas escalen sin ser detectados.',
  solution: 'Un dashboard de bienestar semanal con alertas automáticas para managers, basado en encuestas anónimas de 2 minutos.',
  targetUser: 'Engineering managers con 5+ reportes remotos',
  demoLink: 'https://pulse-check.example.com',
  feedbackTopics: ['Claridad del problema', 'Disposición de uso'],
  images: [],
  hypothesis: 'Si los team leads ven las tendencias de bienestar semanalmente, intervendrán 2x más rápido ante caídas de moral.',
  customQuestion: '',
}

const FORM_DATA_SIN_HIPOTESIS: WizardFormData = {
  ...FULL_FORM_DATA,
  hypothesis: '',
}

const meta = {
  title: 'Projects/ProjectPreview',
  component: ProjectPreview,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ProjectPreview>

export default meta
type Story = StoryObj<typeof meta>

/** Vista completa con template y hipótesis */
export const ConTemplateYHipotesis: Story = {
  args: {
    data: FULL_FORM_DATA,
    templateName: 'SaaS',
    onEdit: fn(),
    onPublish: fn(),
    isPublishing: false,
  },
}

/** Vista sin template seleccionado (no muestra pill de tipo) */
export const SinTemplate: Story = {
  args: {
    data: FULL_FORM_DATA,
    templateName: undefined,
    onEdit: fn(),
    onPublish: fn(),
    isPublishing: false,
  },
}

/** Vista sin hipótesis (sección hipótesis no aparece) */
export const SinHipotesis: Story = {
  args: {
    data: FORM_DATA_SIN_HIPOTESIS,
    templateName: 'Feature / Mejora',
    onEdit: fn(),
    onPublish: fn(),
    isPublishing: false,
  },
}

/** Estado publicando — botón "Publicar" deshabilitado */
export const Publicando: Story = {
  args: {
    data: FULL_FORM_DATA,
    templateName: 'SaaS',
    onEdit: fn(),
    onPublish: fn(),
    isPublishing: true,
  },
}
