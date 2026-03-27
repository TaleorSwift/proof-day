import { CommunityForm } from '@/components/communities/CommunityForm'

export default function NewCommunityPage() {
  return (
    <main className="container max-w-lg py-8">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Crear comunidad
      </h1>
      <CommunityForm />
    </main>
  )
}
