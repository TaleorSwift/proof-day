import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>
type AuthUser = NonNullable<
  Awaited<ReturnType<SupabaseServerClient['auth']['getUser']>>['data']['user']
>

type AuthSuccess = {
  user: AuthUser
  supabase: SupabaseServerClient
  error: null
}

type AuthFailure = {
  user: null
  supabase: null
  error: NextResponse
}

export async function requireAuth(): Promise<AuthSuccess | AuthFailure> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      user: null,
      supabase: null,
      error: NextResponse.json(
        { error: 'No autenticado', code: 'AUTH_REQUIRED' },
        { status: 401 }
      ),
    }
  }

  return { user, supabase, error: null }
}
