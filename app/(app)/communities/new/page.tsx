import { CommunityForm } from '@/components/communities/CommunityForm'

export default function NewCommunityPage() {
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
