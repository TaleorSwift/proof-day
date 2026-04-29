import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  ProjectDetailAuthor,
  ProjectDetailFeaturedImage,
  ProjectDetailTargetUser,
  ProjectDetailDemo,
  ProjectDetailFeedbackTopics,
} from '@/components/projects/ProjectDetailSections'

// ── Nota: este fichero documenta cada sección exportada por separado ──────────
// como componentes individuales dentro del mismo módulo.

// ── ProjectDetailAuthor ───────────────────────────────────────────────────────

const authorMeta = {
  title: 'Projects/ProjectDetailSections/Author',
  component: ProjectDetailAuthor,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ProjectDetailAuthor>

export default authorMeta
type AuthorStory = StoryObj<typeof authorMeta>

export const Autor: AuthorStory = {
  args: {
    authorName: 'Alex Kim',
  },
}

// ── ProjectDetailFeaturedImage ────────────────────────────────────────────────

export const ImagenDestacada: StoryObj<typeof ProjectDetailFeaturedImage> = {
  render: () => (
    <ProjectDetailFeaturedImage
      imageUrls={[
        'https://picsum.photos/seed/proj-featured/960/480',
        'https://picsum.photos/seed/proj-secondary-1/800/600',
        'https://picsum.photos/seed/proj-secondary-2/800/600',
      ]}
      projectTitle="Pulse Check"
    />
  ),
}

export const ImagenDestacadaSola: StoryObj<typeof ProjectDetailFeaturedImage> = {
  name: 'Imagen destacada (sin galería secundaria)',
  render: () => (
    <ProjectDetailFeaturedImage
      imageUrls={['https://picsum.photos/seed/proj-single/960/480']}
      projectTitle="DocBridge"
    />
  ),
}

export const SinImagenes: StoryObj<typeof ProjectDetailFeaturedImage> = {
  name: 'Sin imágenes (no renderiza)',
  render: () => (
    <div>
      <p style={{ fontSize: '14px', color: '#6B6B63', marginBottom: '8px' }}>
        El componente no renderiza nada cuando imageUrls está vacío.
      </p>
      <ProjectDetailFeaturedImage imageUrls={[]} projectTitle="Carbon Ledger" />
    </div>
  ),
}

// ── ProjectDetailTargetUser ───────────────────────────────────────────────────

export const UsuarioObjetivo: StoryObj<typeof ProjectDetailTargetUser> = {
  render: () => (
    <ProjectDetailTargetUser targetUser="Engineering managers with 5+ remote reports" />
  ),
}

export const UsuarioObjetivoVacio: StoryObj<typeof ProjectDetailTargetUser> = {
  name: 'Usuario objetivo vacío (no renderiza)',
  render: () => (
    <div>
      <p style={{ fontSize: '14px', color: '#6B6B63', marginBottom: '8px' }}>
        El componente no renderiza nada cuando targetUser es null o vacío.
      </p>
      <ProjectDetailTargetUser targetUser={null} />
    </div>
  ),
}

// ── ProjectDetailDemo ─────────────────────────────────────────────────────────

export const LinkDemo: StoryObj<typeof ProjectDetailDemo> = {
  render: () => <ProjectDetailDemo demoUrl="https://example.com/pulse-demo" />,
}

export const LinkDemoVacio: StoryObj<typeof ProjectDetailDemo> = {
  name: 'Demo vacío (no renderiza)',
  render: () => (
    <div>
      <p style={{ fontSize: '14px', color: '#6B6B63', marginBottom: '8px' }}>
        El componente no renderiza nada cuando demoUrl es null o vacío.
      </p>
      <ProjectDetailDemo demoUrl={null} />
    </div>
  ),
}

// ── ProjectDetailFeedbackTopics ───────────────────────────────────────────────

export const TemasDeFeeback: StoryObj<typeof ProjectDetailFeedbackTopics> = {
  render: () => (
    <ProjectDetailFeedbackTopics
      feedbackTopics={['Problem clarity', 'Willingness to use', 'Missing features']}
    />
  ),
}

export const TemasVacios: StoryObj<typeof ProjectDetailFeedbackTopics> = {
  name: 'Temas vacíos (no renderiza)',
  render: () => (
    <div>
      <p style={{ fontSize: '14px', color: '#6B6B63', marginBottom: '8px' }}>
        El componente no renderiza nada cuando feedbackTopics está vacío o es null.
      </p>
      <ProjectDetailFeedbackTopics feedbackTopics={[]} />
    </div>
  ),
}
