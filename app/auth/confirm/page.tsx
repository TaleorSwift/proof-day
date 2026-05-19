import { redirect } from 'next/navigation'
import { validateConfirmSearchParams } from '@/lib/auth/confirm'
import { ConfirmButton } from '@/components/auth/ConfirmButton'
import { BrandHeader } from '@/components/shared/BrandHeader'

interface ConfirmPageProps {
  searchParams: Promise<{ token?: string; type?: string; redirect_to?: string }>
}

export default async function ConfirmPage({ searchParams }: ConfirmPageProps) {
  const params = await searchParams
  const result = validateConfirmSearchParams({
    token: params.token,
    type: params.type,
    redirect_to: params.redirect_to,
  })

  if (!result.valid) {
    redirect('/login?error=link-invalid')
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <BrandHeader subtitle="Un último paso para acceder." />
      <ConfirmButton
        token={result.token}
        type={result.type}
        redirectTo={result.redirectTo}
      />
    </div>
  )
}
