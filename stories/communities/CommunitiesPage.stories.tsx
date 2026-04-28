// CommunitiesPage es un async Server Component que llama a Supabase y usa React.cache.
// No es posible usarlo directamente en Storybook sin un entorno servidor completo.
// Esta story renderiza los subcomponentes visuales que componen la página:
// - CommunityList (estado con lista)
// - EmptyCommunitiesState (estado vacío)
// - Banner de no-access (renderizado inline)
// Esto cubre el 100% de los estados visuales posibles de la página.
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CommunityList } from '@/components/communities/CommunityList'
import { EmptyCommunitiesState } from '@/components/communities/EmptyCommunitiesState'

const makeCommunity = (id: string, name: string, slug: string) => ({
  id,
  name,
  slug,
  description: `Espacio de validación de ideas para ${name}.`,
  image_url: `https://picsum.photos/seed/${slug}/200/200`,
  created_by: 'user-001',
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-15T10:00:00Z',
  member_count: 8,
})

const pageWrapper = (children: React.ReactNode) => (
  <main
    style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
      padding: 'var(--space-8)',
    }}
  >
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>Mis comunidades</h1>
      </div>
      {children}
    </div>
  </main>
)

// Story wrapper para estado vacío
function EmptyPage() {
  return pageWrapper(<EmptyCommunitiesState />)
}

// Story wrapper para lista de comunidades
function ListPage() {
  return pageWrapper(
    <CommunityList
      communities={[
        makeCommunity('comm-001', 'Producto Alpha', 'producto-alpha'),
        makeCommunity('comm-002', 'Beta Testers', 'beta-testers'),
        makeCommunity('comm-003', 'Innovación 2026', 'innovacion-2026'),
      ]}
    />
  )
}

// Story wrapper para banner no-access
function NoAccessPage() {
  return pageWrapper(
    <>
      <div
        role="alert"
        style={{
          backgroundColor: 'var(--color-hypothesis-bg)',
          border: '1px solid var(--color-hypothesis-border)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          fontSize: '14px',
          color: 'var(--color-text-primary)',
        }}
      >
        No tienes acceso a esta comunidad.
      </div>
      <CommunityList
        communities={[
          makeCommunity('comm-001', 'Producto Alpha', 'producto-alpha'),
          makeCommunity('comm-002', 'Beta Testers', 'beta-testers'),
        ]}
      />
    </>
  )
}

const meta: Meta = {
  title: 'Communities/CommunitiesPage',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Estado vacío — usuario sin ninguna comunidad
export const Empty: Story = {
  render: () => <EmptyPage />,
}

// Estado normal — usuario con comunidades
export const ConLista: Story = {
  render: () => <ListPage />,
}

// Estado con banner de acceso denegado
export const ConBannerNoAccess: Story = {
  render: () => <NoAccessPage />,
}
