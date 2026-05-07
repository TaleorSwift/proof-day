// Story 13.2 — Storybook para NewVersionModal
// Task 10 — 3 variantes: Default, Loading, Error

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn, spyOn } from 'storybook/test'
import { NewVersionModal } from '@/components/projects/NewVersionModal'
import * as projectIterationsApi from '@/lib/api/project-iterations'

const meta = {
  title: 'Projects/NewVersionModal',
  component: NewVersionModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof NewVersionModal>

export default meta
type Story = StoryObj<typeof meta>

// ── Args base ─────────────────────────────────────────────────────────────────

const BASE_ARGS = {
  projectId: 'project-uuid-001',
  initialTitle: 'Plataforma de validación de ideas',
  initialDescription: 'Muchos builders no saben si su idea es viable sin invertir meses.\n\nUna plataforma donde puedan recibir feedback estructurado de peers en 48 horas.',
  initialHypothesis: 'Si los builders reciben 3 feedbacks estructurados en las primeras 48h, aumenta un 40% la probabilidad de continuar con el proyecto.',
  onSuccess: fn(),
  onClose: fn(),
}

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Default — modal abierto con los valores actuales del proyecto pre-rellenados.
 * El Builder puede editar los campos antes de publicar la versión.
 */
export const Default: Story = {
  args: BASE_ARGS,
  parameters: {
    docs: {
      description: {
        story: 'Estado inicial del modal con los campos título, descripción e hipótesis pre-rellenados con los valores actuales del proyecto.',
      },
    },
  },
}

/**
 * Loading — estado durante la publicación de la versión.
 * La play function hace click en "Publicar versión" con un mock que nunca resuelve,
 * mostrando el botón en estado "Publicando...".
 */
export const Loading: Story = {
  args: BASE_ARGS,
  play: async ({ canvasElement }) => {
    const { within, userEvent } = await import('storybook/test')
    const canvas = within(canvasElement)
    const user = userEvent.setup()

    spyOn(projectIterationsApi, 'publishIteration').mockReturnValue(new Promise(() => {}))

    const submitButton = canvas.getByTestId('new-version-submit')
    await user.click(submitButton)
  },
  parameters: {
    docs: {
      description: {
        story: 'Hace click en "Publicar versión" con un mock que nunca resuelve. El botón muestra "Publicando..." y está deshabilitado.',
      },
    },
  },
}

/**
 * ConError — estado de error tras fallo de la API.
 * La play function hace click en "Publicar versión" con un mock que lanza un error,
 * mostrando el mensaje de error bajo el formulario.
 */
export const ConError: Story = {
  args: BASE_ARGS,
  play: async ({ canvasElement }) => {
    const { within, userEvent } = await import('storybook/test')
    const canvas = within(canvasElement)
    const user = userEvent.setup()

    spyOn(projectIterationsApi, 'publishIteration').mockRejectedValue(
      new Error('Error al crear la iteración. Inténtalo de nuevo.')
    )

    const submitButton = canvas.getByTestId('new-version-submit')
    await user.click(submitButton)
  },
  parameters: {
    docs: {
      description: {
        story: 'El mock lanza un error. Tras el submit, el mensaje de error aparece con role="alert" y el modal permanece abierto para reintentar.',
      },
    },
  },
}
