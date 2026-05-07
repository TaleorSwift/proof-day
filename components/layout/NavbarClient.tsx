'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Navbar } from './Navbar'
import { NotificationBell } from '@/components/shared/NotificationBell'

interface NavbarClientProps {
  isAuthenticated: boolean
  userName?: string
}

export function NavbarClient({ isAuthenticated, userName }: NavbarClientProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <Navbar
      isAuthenticated={isAuthenticated}
      userName={userName}
      onLogout={handleLogout}
      notificationBell={<NotificationBell />}
    />
  )
}
