'use server'

import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/validations/auth'

export async function sendMagicLink(formData: FormData) {
  const result = loginSchema.safeParse({ email: formData.get('email') })
  if (!result.success) return { error: result.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email: result.data.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error('[sendMagicLink] Supabase error:', error.message, error.status)
    return { error: 'No pudimos enviar el email. Inténtalo de nuevo.' }
  }
  return { success: true }
}
