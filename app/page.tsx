import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WelcomeScreen } from '@/components/landing/WelcomeScreen'

export const metadata: Metadata = {
  title: 'Proof Day — Bienvenido',
  description: 'Valida ideas. Aprende más rápido. Construye lo que importa.',
  openGraph: {
    title: 'Proof Day — Bienvenido',
    description: 'Valida ideas. Aprende más rápido. Construye lo que importa.',
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

  return <WelcomeScreen />
}
