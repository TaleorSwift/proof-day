import { FeedbackButton } from '@/components/feedback/FeedbackButton'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FeedbackCTAVariant = 'unauthenticated' | 'authenticated-member' | 'owner'

interface FeedbackCTAProps {
  variant: FeedbackCTAVariant
  projectId: string
  communityId: string
}

// ---------------------------------------------------------------------------
// Styles (design tokens — sin valores hardcodeados)
// ---------------------------------------------------------------------------

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-6)',
  boxShadow: 'var(--shadow-sm)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4)',
}

const headingStyle: React.CSSProperties = {
  fontSize: 'var(--text-base)',
  fontWeight: 'var(--font-semibold)',
  color: 'var(--color-text-primary)',
  margin: 0,
}

const bodyStyle: React.CSSProperties = {
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-secondary)',
  lineHeight: 'var(--leading-base)',
  margin: 0,
}

const signinLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--space-2) var(--space-4)',
  backgroundColor: 'var(--color-accent)',
  color: 'var(--color-surface)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
  textDecoration: 'none',
  border: 'none',
  cursor: 'pointer',
  alignSelf: 'flex-start',
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TITLE = 'Ayuda a mejorar esta idea'
const MOTIVATIONAL_TEXT =
  'Tu perspectiva como miembro de la comunidad es valiosa. Da feedback y ayuda a validar si esta propuesta tiene potencial.'
const SIGNIN_CTA = 'Inicia sesión para dar feedback'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FeedbackCTA({ variant, projectId, communityId }: FeedbackCTAProps) {
  if (variant === 'owner') {
    return null
  }

  return (
    <div data-testid="feedback-cta" style={cardStyle}>
      <h2 style={headingStyle}>{TITLE}</h2>
      <p style={bodyStyle}>{MOTIVATIONAL_TEXT}</p>

      {variant === 'authenticated-member' && (
        <div data-testid="feedback-cta-button-wrapper">
          <FeedbackButton projectId={projectId} communityId={communityId} />
        </div>
      )}

      {variant === 'unauthenticated' && (
        <a
          href="/login"
          data-testid="feedback-cta-signin-link"
          style={signinLinkStyle}
        >
          {SIGNIN_CTA}
        </a>
      )}
    </div>
  )
}
