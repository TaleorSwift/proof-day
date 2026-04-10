'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Navbar } from './Navbar'

interface NavbarClientProps {
  isAuthenticated: boolean
}

export function NavbarClient({ isAuthenticated }: NavbarClientProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
}
