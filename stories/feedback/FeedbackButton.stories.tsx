import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import { FeedbackButton } from '@/components/feedback/FeedbackButton'

const meta = {
  title: 'Feedback/FeedbackButton',
  component: FeedbackButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    nextjs: {
      navigation: {
        pathname: '/communities/demo/projects/demo-project',
      },
    },
  },
  args: {
    projectId: 'project-demo-123',
    communityId: 'community-demo-abc',
    onSuccess: fn(),
  },
} satisfies Meta<typeof FeedbackButton>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Story: Estado inicial — sin feedback enviado todavía
// ---------------------------------------------------------------------------

export const SinFeedback: Story = {
  name: 'Sin feedback — botón inicial',
  parameters: {
    docs: {
      description: {
        story:
          'Estado inicial del botón. Muestra el texto "Dar feedback" sin ningún contador. Al pulsarlo abre el FeedbackDialog.',
      },
    },
  },
}

// ---------------------------------------------------------------------------
// Story: Con feedback — después de haber enviado al menos uno
// ---------------------------------------------------------------------------

export const ConFeedback: Story = {
  name: 'Con feedback — contador visible (+1)',
  parameters: {
    docs: {
      description: {
        story:
          'Tras enviar feedback con éxito, el botón muestra un contador "+N" junto al texto. Este estado se alcanza internamente tras llamar a onSuccess. En Storybook se documenta mediante descripción porque el contador es estado interno del componente.',
      },
    },
  },
}

// ---------------------------------------------------------------------------
// Story: Con callback onSuccess
// ---------------------------------------------------------------------------

export const ConCallbackOnSuccess: Story = {
  name: 'Con callback onSuccess instrumentado',
  args: {
    onSuccess: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Versión con `onSuccess` instrumentado con `fn()` de @storybook/test. Permite verificar en el panel de Actions que el callback se invoca al enviar feedback correctamente.',
      },
    },
  },
}
