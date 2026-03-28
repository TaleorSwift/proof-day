import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OwnProfileView } from '@/components/profiles/OwnProfileView'
import type { ProfileWithStats } from '@/lib/types/profiles'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) redirect('/auth/login')

  const user = authData.user

  // Obtener perfil
  const { data: profileRow, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, bio, interests, avatar_url, created_at, updated_at')
    .eq('id', user.id)
    .single()

  if (profileError || !profileRow) {
    // Si no existe perfil (trigger no ejecutado), redirigir a comunidades
    redirect('/communities')
  }

  // Contar feedbacks dados
  const { count: feedbackCount } = await supabase
    .from('feedbacks')
    .select('id', { count: 'exact', head: true })
    .eq('reviewer_id', user.id)

  // Contar proyectos creados
  const { count: projectCount } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('builder_id', user.id)

  const profile: ProfileWithStats = {
    id: profileRow.id,
    name: profileRow.name,
    bio: profileRow.bio,
    interests: profileRow.interests ?? [],
    avatarUrl: profileRow.avatar_url,
    createdAt: profileRow.created_at,
    updatedAt: profileRow.updated_at,
    feedbackCount: feedbackCount ?? 0,
    projectCount: projectCount ?? 0,
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        padding: 'var(--space-8)',
      }}
    >
      <OwnProfileView profile={profile} />
    </main>
  )
}
