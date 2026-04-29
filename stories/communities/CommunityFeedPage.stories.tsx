// CommunityPage ([slug]/page.tsx) es un async Server Component que llama a Supabase.
// No es posible usarlo directamente en Storybook sin un entorno servidor completo.
// Esta story replica el layout visual de la página (grid 2 columnas) con subcomponentes
// reales y datos mockeados, cubriendo los estados visuales posibles.
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CommunityHeader } from '@/components/communities/CommunityHeader'
import { CommunityFeedHeader } from '@/components/communities/CommunityFeedHeader'
import { ProjectFeed } from '@/components/projects/ProjectFeed'
import type { ProjectListItem } from '@/lib/api/projects'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockCommunity = {
  id: 'comm-001',
  name: 'Startup Madrid',
  slug: 'startup-madrid',
  description: 'Espacio de validación de ideas para emprendedores de Madrid.',
  image_url: 'https://picsum.photos/seed/startup-madrid/200/200',
  created_by: 'user-001',
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-15T10:00:00Z',
  member_count: 12,
}

const mockProjects: ProjectListItem[] = [
  {
    id: 'proj-001',
    slug: 'app-productividad-freelancers',
    title: 'App de productividad para freelancers',
    imageUrls: ['https://picsum.photos/seed/proj1/400/300'],
    status: 'live',
    builderId: 'user-002',
    builderName: 'Ana García',
    createdAt: '2026-03-10T10:00:00Z',
    tagline: 'Gestiona tus proyectos y tiempo en un solo lugar',
    wouldUseCount: 18,
    feedbackCount: 5,
  },
  {
    id: 'proj-002',
    slug: 'marketplace-servicios-locales',
    title: 'Marketplace de servicios locales',
    imageUrls: [],
    status: 'live',
    builderId: 'user-003',
    builderName: 'Carlos Ruiz',
    createdAt: '2026-03-08T10:00:00Z',
    tagline: 'Conecta con profesionales de tu barrio',
    wouldUseCount: 7,
    feedbackCount: 2,
  },
  {
    id: 'proj-003',
    slug: 'plataforma-mentoring-p2p',
    title: 'Plataforma de mentoring P2P',
    imageUrls: ['https://picsum.photos/seed/proj3/400/300'],
    status: 'inactive',
    builderId: 'user-004',
    builderName: 'Laura Sanz',
    createdAt: '2025-11-01T10:00:00Z',
    tagline: null,
    wouldUseCount: 3,
    feedbackCount: 0,
  },
]

// ---------------------------------------------------------------------------
// Layout wrapper — replica el grid 2 columnas de CommunityPage
// ---------------------------------------------------------------------------

interface PageLayoutProps {
  projects: ProjectListItem[]
  isAdmin?: boolean
}

function CommunityFeedPageLayout({ projects, isAdmin = false }: PageLayoutProps) {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--space-8)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 280px',
            gap: 'var(--space-8)',
            alignItems: 'start',
          }}
        >
          {/* Columna principal */}
          <div>
            <CommunityFeedHeader
              communityName={mockCommunity.name}
              communitySlug={mockCommunity.slug}
            />
            <ProjectFeed
              projects={projects}
              communitySlug={mockCommunity.slug}
              currentUserId="user-001"
            />
          </div>

          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <CommunityHeader community={mockCommunity} isAdmin={isAdmin} />
          </aside>
        </div>
      </div>
    </main>
  )
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Pages/CommunityFeed',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Grid completo con proyectos live e inactive
export const ConProyectos: Story = {
  render: () => <CommunityFeedPageLayout projects={mockProjects} />,
}

// Admin — sidebar muestra enlace a Configuración
export const ConProyectosComoAdmin: Story = {
  render: () => <CommunityFeedPageLayout projects={mockProjects} isAdmin={true} />,
}

// EmptyState visible — sin proyectos
export const Vacia: Story = {
  render: () => <CommunityFeedPageLayout projects={[]} />,
}
