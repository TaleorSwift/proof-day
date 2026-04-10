// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks — declarados ANTES de los imports del componente bajo test
// ---------------------------------------------------------------------------

// next/image no funciona en jsdom — mock que renderiza un <img> estándar
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    priority: _priority,
    sizes: _sizes,
    style,
  }: {
    src: string
    alt: string
    fill?: boolean
    priority?: boolean
    sizes?: string
    style?: React.CSSProperties
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} style={style} />
  ),
}))

// ---------------------------------------------------------------------------
// Imports de los componentes bajo test
// ---------------------------------------------------------------------------

import {
  ProjectDetailTargetUser,
  ProjectDetailDemo,
  ProjectDetailFeedbackTopics,
  ProjectDetailAuthor,
  ProjectDetailFeaturedImage,
} from '@/components/projects/ProjectDetailSections'

// ---------------------------------------------------------------------------
// Suite: ProjectDetailTargetUser (AC-5)
// ---------------------------------------------------------------------------

describe('ProjectDetailTargetUser', () => {
  it('no renderiza la sección cuando targetUser es null', () => {
    const { container } = render(<ProjectDetailTargetUser targetUser={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('no renderiza la sección cuando targetUser es cadena vacía', () => {
    const { container } = render(<ProjectDetailTargetUser targetUser="" />)
    expect(container.firstChild).toBeNull()
  })

  it('no renderiza la sección cuando targetUser es solo espacios en blanco', () => {
    const { container } = render(<ProjectDetailTargetUser targetUser="   " />)
    expect(container.firstChild).toBeNull()
  })

  it('no renderiza la sección cuando targetUser es undefined', () => {
    const { container } = render(<ProjectDetailTargetUser targetUser={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('renderiza la sección con el texto cuando targetUser tiene valor', () => {
    render(<ProjectDetailTargetUser targetUser="Developers indie que lanzan MVPs" />)

    const section = screen.getByTestId('project-detail-section-target-user')
    expect(section).toBeInTheDocument()
    expect(section).toHaveTextContent('Developers indie que lanzan MVPs')
    expect(section).toHaveTextContent('Usuario objetivo')
  })
})

// ---------------------------------------------------------------------------
// Suite: ProjectDetailDemo (AC-6)
// ---------------------------------------------------------------------------

describe('ProjectDetailDemo', () => {
  it('no renderiza la sección cuando demoUrl es null', () => {
    const { container } = render(<ProjectDetailDemo demoUrl={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('no renderiza la sección cuando demoUrl es cadena vacía', () => {
    const { container } = render(<ProjectDetailDemo demoUrl="" />)
    expect(container.firstChild).toBeNull()
  })

  it('no renderiza la sección cuando demoUrl es undefined', () => {
    const { container } = render(<ProjectDetailDemo demoUrl={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('renderiza la sección con enlace "Ver demo" cuando demoUrl tiene valor', () => {
    render(<ProjectDetailDemo demoUrl="https://demo.example.com" />)

    const section = screen.getByTestId('project-detail-section-demo')
    expect(section).toBeInTheDocument()

    const link = screen.getByRole('link', { name: 'Ver demo' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://demo.example.com')
  })

  it('el enlace "Ver demo" abre en nueva pestaña con rel correcto', () => {
    render(<ProjectDetailDemo demoUrl="https://demo.example.com" />)

    const link = screen.getByRole('link', { name: 'Ver demo' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('el texto del enlace es "Ver demo", no la URL cruda', () => {
    const url = 'https://demo.example.com/very/long/path'
    render(<ProjectDetailDemo demoUrl={url} />)

    const link = screen.getByRole('link', { name: 'Ver demo' })
    expect(link).toHaveTextContent('Ver demo')
    expect(link).not.toHaveTextContent(url)
  })
})

// ---------------------------------------------------------------------------
// Suite: ProjectDetailFeedbackTopics (AC-7)
// ---------------------------------------------------------------------------

describe('ProjectDetailFeedbackTopics', () => {
  it('no renderiza la sección cuando feedbackTopics es null', () => {
    const { container } = render(<ProjectDetailFeedbackTopics feedbackTopics={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('no renderiza la sección cuando feedbackTopics es undefined', () => {
    const { container } = render(<ProjectDetailFeedbackTopics feedbackTopics={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('no renderiza la sección cuando feedbackTopics es array vacío', () => {
    const { container } = render(<ProjectDetailFeedbackTopics feedbackTopics={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renderiza la sección con un ContentTag por cada topic', () => {
    const topics = ['UX', 'Pricing', 'Onboarding']
    render(<ProjectDetailFeedbackTopics feedbackTopics={topics} />)

    const section = screen.getByTestId('project-detail-section-feedback-topics')
    expect(section).toBeInTheDocument()

    // Un ContentTag (span) por cada topic
    expect(screen.getByText('UX')).toBeInTheDocument()
    expect(screen.getByText('Pricing')).toBeInTheDocument()
    expect(screen.getByText('Onboarding')).toBeInTheDocument()
  })

  it('renderiza correctamente con un único topic', () => {
    render(<ProjectDetailFeedbackTopics feedbackTopics={['Monetización']} />)

    const section = screen.getByTestId('project-detail-section-feedback-topics')
    expect(section).toBeInTheDocument()
    expect(screen.getByText('Monetización')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: ProjectDetailAuthor (AC-9)
// ---------------------------------------------------------------------------

describe('ProjectDetailAuthor', () => {
  it('renderiza el UserAvatar con el nombre del perfil', () => {
    render(<ProjectDetailAuthor authorName="Javi López" />)

    const container = screen.getByTestId('project-detail-author-avatar')
    expect(container).toBeInTheDocument()

    // UserAvatar muestra el nombre cuando showName=true
    expect(container).toHaveTextContent('Javi López')
  })

  it('usa "Autor" como fallback cuando el nombre del perfil no está disponible', () => {
    render(<ProjectDetailAuthor authorName="Autor" />)

    const container = screen.getByTestId('project-detail-author-avatar')
    expect(container).toBeInTheDocument()
    expect(container).toHaveTextContent('Autor')
  })

  it('renderiza con el avatar (inicial del nombre)', () => {
    render(<ProjectDetailAuthor authorName="María" />)

    // UserAvatar renderiza un div con role=img y aria-label
    const avatar = screen.getByRole('img', { name: 'Avatar de María' })
    expect(avatar).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: ProjectDetailFeaturedImage (AC-3, AC-10)
// ---------------------------------------------------------------------------

describe('ProjectDetailFeaturedImage', () => {
  it('no renderiza nada cuando imageUrls es array vacío', () => {
    const { container } = render(
      <ProjectDetailFeaturedImage imageUrls={[]} projectTitle="Mi Proyecto" />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renderiza la imagen destacada cuando hay al menos una URL', () => {
    render(
      <ProjectDetailFeaturedImage
        imageUrls={['https://storage.supabase.co/project-images/img1.jpg']}
        projectTitle="Mi Proyecto"
      />
    )

    const featuredContainer = screen.getByTestId('project-detail-featured-image')
    expect(featuredContainer).toBeInTheDocument()

    const img = featuredContainer.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://storage.supabase.co/project-images/img1.jpg')
    expect(img).toHaveAttribute('alt', 'Imagen destacada de Mi Proyecto')
  })

  it('no renderiza galería secundaria cuando solo hay una imagen', () => {
    render(
      <ProjectDetailFeaturedImage
        imageUrls={['https://storage.supabase.co/project-images/img1.jpg']}
        projectTitle="Mi Proyecto"
      />
    )

    // Solo una imagen — no hay galería secundaria
    const allImgs = screen.getAllByRole('img')
    expect(allImgs).toHaveLength(1)
  })

  it('renderiza galería secundaria con imágenes adicionales', () => {
    const imageUrls = [
      'https://storage.supabase.co/project-images/img1.jpg',
      'https://storage.supabase.co/project-images/img2.jpg',
      'https://storage.supabase.co/project-images/img3.jpg',
    ]
    render(
      <ProjectDetailFeaturedImage imageUrls={imageUrls} projectTitle="Mi Proyecto" />
    )

    // 3 imágenes en total: 1 destacada + 2 secundarias
    const allImgs = screen.getAllByRole('img')
    expect(allImgs).toHaveLength(3)

    // La primera imagen es la destacada
    expect(allImgs[0]).toHaveAttribute('alt', 'Imagen destacada de Mi Proyecto')

    // Las secundarias tienen alt descriptivo
    expect(allImgs[1]).toHaveAttribute('alt', 'Imagen 2 de Mi Proyecto')
    expect(allImgs[2]).toHaveAttribute('alt', 'Imagen 3 de Mi Proyecto')
  })
})
