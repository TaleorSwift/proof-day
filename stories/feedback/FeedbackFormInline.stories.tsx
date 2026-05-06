import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FeedbackFormInline } from '@/components/feedback/FeedbackFormInline'

const meta = {
  title: 'Feedback/FeedbackFormInline',
  component: FeedbackFormInline,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FeedbackFormInline>

export default meta
type Story = StoryObj<typeof meta>

export const EstadoInicial: Story = {
  name: 'Estado Inicial',
  args: {
    projectId: 'proj-storybook-001',
    communityId: 'comm-storybook-001',
  },
}

export const Cargando: Story = {
  name: 'Cargando',
  args: {
    projectId: 'proj-storybook-001',
    communityId: 'comm-storybook-001',
  },
  parameters: {
    // Decorador para simular estado de carga — ver nota abajo
    docs: {
      description: {
        story: 'Estado de carga tras pulsar "Compartir insight". El botón muestra "Enviando..." y está deshabilitado.',
      },
    },
  },
}

export const Confirmacion: Story = {
  name: 'Confirmación',
  args: {
    projectId: 'proj-storybook-001',
    communityId: 'comm-storybook-001',
  },
  parameters: {
    docs: {
      description: {
        story: 'Estado de confirmación tras envío exitoso. Muestra mensaje de agradecimiento.',
      },
    },
  },
}

// Story 10.5 — HypothesisContextBanner
export const ConHipotesis: Story = {
  name: 'Con hipótesis del proyecto',
  args: {
    projectId: 'proj-storybook-001',
    communityId: 'comm-storybook-001',
    hypothesis: 'Si reducimos el tiempo de onboarding a menos de 5 minutos, entonces la tasa de activación sube un 30%.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Story 10.5 — Muestra el banner de hipótesis en modo read-only antes del formulario cuando el proyecto tiene hypothesis definida.',
      },
    },
  },
}

// ── Story 11.2 — campo condicional customAnswer ────────────────────────────────

/** Reviewer ve bloque de pregunta custom del Builder */
export const ConPreguntaCustom: Story = {
  name: 'Con pregunta custom del Builder',
  args: {
    projectId: 'proj-storybook-001',
    communityId: 'comm-storybook-001',
    customQuestion: '¿Echarías en falta esta funcionalidad si desapareciera mañana?',
  },
  parameters: {
    docs: {
      description: {
        story: 'Story 11.2 — AC-5: El Reviewer ve el bloque de pregunta custom del Builder al final del formulario. El campo de respuesta es opcional.',
      },
    },
  },
}

/** Reviewer no ve bloque custom — sin customQuestion */
export const SinPreguntaCustom: Story = {
  name: 'Sin pregunta custom (comportamiento anterior)',
  args: {
    projectId: 'proj-storybook-001',
    communityId: 'comm-storybook-001',
  },
  parameters: {
    docs: {
      description: {
        story: 'Story 11.2 — AC-6: Sin customQuestion, el formulario funciona exactamente igual que antes. El bloque de respuesta custom no aparece en el DOM.',
      },
    },
  },
}

/** Reviewer con hipótesis Y pregunta custom — ambos bloques visibles */
export const ConHipotesisYPreguntaCustom: Story = {
  name: 'Con hipótesis y pregunta custom',
  args: {
    projectId: 'proj-storybook-001',
    communityId: 'comm-storybook-001',
    hypothesis: 'Si reducimos el tiempo de onboarding a menos de 5 minutos, la tasa de activación sube un 30%.',
    customQuestion: '¿Cuánto tiempo te tomaría adoptar esta herramienta en tu equipo?',
  },
  parameters: {
    docs: {
      description: {
        story: 'Story 10.5 + 11.2 — Ambos bloques contextuales visibles: banner de hipótesis y pregunta custom del Builder.',
      },
    },
  },
}
