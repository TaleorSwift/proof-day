import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Proof Day — Valida tu idea antes de construirla',
  description:
    'Presenta tu idea a una comunidad real y recibe feedback estructurado en 24 horas. Toma decisiones con datos, no con intuición.',
  openGraph: {
    title: 'Proof Day — Valida tu idea antes de construirla',
    description:
      'Presenta tu idea a una comunidad real y recibe feedback estructurado en 24 horas.',
    images: ['/og-image.png'],
    type: 'website',
    locale: 'es_ES',
  },
}

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect('/communities')

  return (
    <main style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh' }}>
      {/* ── Nav mínima ─────────────────────────────────────────── */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--space-4) var(--space-8)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-primary)',
          }}
        >
          Proof Day
        </span>
        <Link
          href="/login"
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            textDecoration: 'none',
          }}
        >
          Iniciar sesión
        </Link>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section
        style={{
          padding: 'var(--space-16) var(--space-8)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--color-text-primary)',
              lineHeight: 1.15,
              marginBottom: 'var(--space-6)',
            }}
          >
            Valida tu idea antes de construirla
          </h1>
          <p
            style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-lg)',
              maxWidth: '560px',
              margin: '0 auto var(--space-10)',
            }}
          >
            Proof Day es la plataforma donde los builders presentan sus ideas a una
            comunidad real y reciben feedback estructurado en 24 horas.
          </p>
          <a
            href="mailto:hola@proofday.app"
            className="transition-opacity hover:opacity-80"
            style={{
              display: 'inline-block',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-surface)',
              padding: 'var(--space-4) var(--space-8)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-semibold)',
              textDecoration: 'none',
            }}
          >
            Solicitar acceso
          </a>
        </div>
      </section>

      {/* ── Cómo funciona ──────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: 'var(--color-surface)',
          padding: 'var(--space-16) var(--space-8)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              textAlign: 'center',
              marginBottom: 'var(--space-12)',
            }}
          >
            Cómo funciona
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Publica tu idea',
                description:
                  'Describe tu proyecto en 5 minutos. Sin decks, sin plantillas, sin burocracia.',
              },
              {
                step: '02',
                title: 'Recibe feedback real',
                description:
                  'Tu comunidad responde con 4 preguntas estructuradas. Sin ruido, sin likes, sin sesgos de amigo.',
              },
              {
                step: '03',
                title: 'Toma la decisión',
                description:
                  'El Proof Score agrega el feedback y te dice si seguir adelante o pivotar.',
              },
            ].map(({ step, title, description }) => (
              <div
                key={step}
                style={{
                  padding: 'var(--space-8)',
                  backgroundColor: 'var(--color-background)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-accent)',
                    marginBottom: 'var(--space-3)',
                    letterSpacing: '0.08em',
                  }}
                >
                  {step}
                </div>
                <h3
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-3)',
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 'var(--leading-base)',
                  }}
                >
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Por qué Proof Day ──────────────────────────────────── */}
      <section
        style={{
          padding: 'var(--space-16) var(--space-8)',
        }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              textAlign: 'center',
              marginBottom: 'var(--space-12)',
            }}
          >
            Por qué Proof Day
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                versus: 'vs. redes sociales',
                claim: 'Los likes no validan ideas.',
                detail:
                  'La validación real viene del feedback estructurado, no del aplauso fácil.',
              },
              {
                versus: 'vs. Slack y grupos',
                claim: 'Las opiniones de amigos tienen sesgo.',
                detail:
                  'Tu comunidad de Proof Day da feedback honesto porque no tiene por qué quedar bien contigo.',
              },
              {
                versus: 'vs. Product Hunt',
                claim: 'Product Hunt es para lanzar.',
                detail:
                  'Proof Day es para decidir antes de construir. Ahorra meses de trabajo en el producto equivocado.',
              },
            ].map(({ versus, claim, detail }) => (
              <div
                key={versus}
                style={{
                  padding: 'var(--space-8)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-hypothesis-bg)',
                  border: '1px solid var(--color-hypothesis-border)',
                }}
              >
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: 'var(--space-3)',
                  }}
                >
                  {versus}
                </div>
                <p
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  {claim}
                </p>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 'var(--leading-base)',
                  }}
                >
                  {detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ──────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          padding: 'var(--space-16) var(--space-8)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-4)',
            }}
          >
            ¿Listo para validar tu próxima idea?
          </h2>
          <p
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-8)',
            }}
          >
            Únete a los primeros builders que toman decisiones con datos.
          </p>
          <a
            href="mailto:hola@proofday.app"
            className="transition-opacity hover:opacity-80"
            style={{
              display: 'inline-block',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-surface)',
              padding: 'var(--space-4) var(--space-8)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-semibold)',
              textDecoration: 'none',
            }}
          >
            Solicitar acceso
          </a>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer
        role="contentinfo"
        style={{
          borderTop: '1px solid var(--color-border)',
          padding: 'var(--space-8)',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          © {new Date().getFullYear()} Proof Day ·{' '}
          <a
            href="mailto:hola@proofday.app"
            style={{
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
            }}
          >
            hola@proofday.app
          </a>
        </p>
      </footer>
    </main>
  )
}
