import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { fn, spyOn } from 'storybook/test'
import { DecisionDialog } from '@/components/projects/DecisionDialog'
import * as projectsApi from '@/lib/api/projects'

const meta = {
  title: 'Projects/DecisionDialog',
  component: DecisionDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof DecisionDialog>

export default meta
type Story = StoryObj<typeof meta>

// ── Templates ─────────────────────────────────────────────────────────────────

function AbiertoPorDefectoTemplate() {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <DecisionDialog
      projectId="proj-001"
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onSuccess={fn()}
    />
  )
}

function ConfirmandoTemplate() {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <DecisionDialog
      projectId="proj-001"
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onSuccess={fn()}
    />
  )
}

function ConErrorTemplate() {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <DecisionDialog
      projectId="proj-001"
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onSuccess={fn()}
    />
  )
}

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Abierto — diálogo en estado inicial, sin decisión seleccionada.
 * El botón "Confirmar decision" aparece deshabilitado hasta seleccionar una opción.
 */
export const Abierto: Story = {
  render: () => <AbiertoPorDefectoTemplate />,
  args: {
    projectId: 'proj-001',
    isOpen: true,
    onClose: fn(),
    onSuccess: fn(),
  },
}

/**
 * Confirmando — diálogo con estado de carga.
 * La play function selecciona una opción y hace click en "Confirmar decision".
 * El action está mockeado con una promesa que nunca resuelve, mostrando "Confirmando...".
 */
export const Confirmando: Story = {
  render: () => <ConfirmandoTemplate />,
  args: {
    projectId: 'proj-001',
    isOpen: true,
    onClose: fn(),
    onSuccess: fn(),
  },
  play: async ({ canvasElement }) => {
    const { within, userEvent } = await import('storybook/test')
    const canvas = within(canvasElement)
    const user = userEvent.setup()

    spyOn(projectsApi, 'registerDecision').mockReturnValue(new Promise(() => {}))

    const iterarButton = canvas.getByRole('button', { name: /iterar/i })
    await user.click(iterarButton)

    const confirmarButton = canvas.getByRole('button', { name: /confirmar decision/i })
    await user.click(confirmarButton)
  },
  parameters: {
    docs: {
      description: {
        story:
          'Selecciona "Iterar" y hace click en confirmar. El action devuelve una promesa que nunca resuelve, mostrando el botón en estado "Confirmando...".',
      },
    },
  },
}

/**
 * ConError — diálogo tras fallo de la API.
 * La play function selecciona "Escalar", hace click en confirmar y el action
 * lanza un error, mostrando el mensaje de error bajo las opciones.
 */
export const ConError: Story = {
  render: () => <ConErrorTemplate />,
  args: {
    projectId: 'proj-001',
    isOpen: true,
    onClose: fn(),
    onSuccess: fn(),
  },
  play: async ({ canvasElement }) => {
    const { within, userEvent } = await import('storybook/test')
    const canvas = within(canvasElement)
    const user = userEvent.setup()

    spyOn(projectsApi, 'registerDecision').mockRejectedValue(
      new Error('Error al registrar la decisión')
    )

    const escalarButton = canvas.getByRole('button', { name: /escalar/i })
    await user.click(escalarButton)

    const confirmarButton = canvas.getByRole('button', { name: /confirmar decision/i })
    await user.click(confirmarButton)
  },
  parameters: {
    docs: {
      description: {
        story:
          'El action lanza un error. Tras el submit, el mensaje "Error al registrar la decisión" aparece bajo las opciones de decisión.',
      },
    },
  },
}
