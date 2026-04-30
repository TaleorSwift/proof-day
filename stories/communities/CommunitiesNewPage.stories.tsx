// CommunitiesNewPage es un Server Component sin dependencias async.
// Storybook no puede renderizar páginas async directamente — se renderiza inline
// replicando el markup de la página para cobertura visual completa.
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CommunityForm } from '@/components/communities/CommunityForm'

function CommunitiesNewPageWrapper() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        padding: 'var(--space-8)',
      }}
    >
      <div style={{ maxWidth: '512px', margin: '0 auto' }}>
        <h1
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-6)',
          }}
        >
          Crear comunidad
        </h1>
        <CommunityForm />
      </div>
    </main>
  )
}

const meta = {
  title: 'Communities/CommunitiesNewPage',
  component: CommunitiesNewPageWrapper,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof CommunitiesNewPageWrapper>

export default meta
type Story = StoryObj<typeof meta>

// Vista completa de la página /communities/new con formulario vacío.
export const Default: Story = {
  render: () => <CommunitiesNewPageWrapper />,
}
