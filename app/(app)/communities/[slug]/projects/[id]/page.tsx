import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DraftBanner } from '@/components/projects/DraftBanner'
import type { ProjectRow } from '@/lib/types/projects'

interface Props {
  params: Promise<{ slug: string; id: string }>
}

export default async function ProjectPage({ params }: Props) {
  const { slug, id } = await params
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const typedProject = project as ProjectRow
  const isOwner = typedProject.builder_id === authData.user.id

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        padding: 'var(--space-8)',
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

        {/* AC-6: Banner draft — solo visible para el builder */}
        {typedProject.status === 'draft' && <DraftBanner />}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>
              <Link
                href={`/communities/${slug}`}
                style={{ color: 'var(--color-text-muted)', textDecoration: 'underline' }}
              >
                Comunidad
              </Link>
            </p>
            <h1
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
              }}
            >
              {typedProject.title}
            </h1>
          </div>
          {isOwner && typedProject.status === 'draft' && (
            <Link
              href={`/communities/${slug}/projects/${id}/edit`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: 'var(--space-2) var(--space-4)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)',
                textDecoration: 'none',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              Editar
            </Link>
          )}
        </div>

        {/* Problema */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <h2
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
            }}
          >
            Problema
          </h2>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-base)' }}>
            {typedProject.problem}
          </p>
        </section>

        {/* Solución */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <h2
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
            }}
          >
            Solución propuesta
          </h2>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-base)' }}>
            {typedProject.solution}
          </p>
        </section>

        {/* Hipótesis — patrón "en juego" del design system */}
        <section
          style={{
            backgroundColor: 'var(--color-hypothesis-bg)',
            border: '1px solid var(--color-hypothesis-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-4) var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
            }}
          >
            Hipótesis
          </h2>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-base)' }}>
            {typedProject.hypothesis}
          </p>
        </section>

        {/* Imágenes — lista simple (Story 3-2 añadirá ImageGallery completo) */}
        {typedProject.image_urls.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <h2
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
              }}
            >
              Imágenes
            </h2>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
              }}
            >
              {typedProject.image_urls.map((url, i) => (
                <li key={i}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Imagen ${i + 1} del proyecto`}
                    style={{
                      width: '100%',
                      maxHeight: '400px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                    }}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  )
}
