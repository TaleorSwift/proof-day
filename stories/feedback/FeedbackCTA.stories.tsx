import type { Meta, StoryObj } from '@storybook/react'
import { FeedbackCTA } from '@/components/feedback/FeedbackCTA'

const meta: Meta<typeof FeedbackCTA> = {
  title: 'feedback/FeedbackCTA',
  component: FeedbackCTA,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    projectId: 'project-demo-123',
    communityId: 'community-demo-abc',
  },
}

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Story: Miembro autenticado — ve el botón "Dar feedback"
// ---------------------------------------------------------------------------

export const MiembroAutenticado: Story = {
  name: 'Miembro autenticado — botón Dar feedback visible',
  args: {
    variant: 'authenticated-member',
  },
}

// ---------------------------------------------------------------------------
// Story: Owner — el componente devuelve null (nada se renderiza)
// ---------------------------------------------------------------------------

export const Owner: Story = {
  name: 'Owner — el componente devuelve null',
  args: {
    variant: 'owner',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Cuando `variant === "owner"`, `FeedbackCTA` devuelve `null`. El builder del proyecto no ve el CTA de feedback sobre su propio proyecto. El canvas de esta story aparece vacío — ese es el comportamiento correcto.',
      },
    },
  },
  // Wrapper explícito para que el canvas muestre un mensaje informativo
  // en lugar de un canvas completamente en blanco, manteniendo claridad en Storybook.
  render: () => (
    <div>
      <FeedbackCTA variant="owner" projectId="project-demo-123" communityId="community-demo-abc" />
      <p
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
        }}
      >
        (El componente no renderiza nada para variant &quot;owner&quot;)
      </p>
    </div>
  ),
}

// ---------------------------------------------------------------------------
// Story: No autenticado — ve el link de sign-in
// ---------------------------------------------------------------------------

export const NoAutenticado: Story = {
  name: 'No autenticado — link de inicio de sesión',
  args: {
    variant: 'unauthenticated',
  },
}
