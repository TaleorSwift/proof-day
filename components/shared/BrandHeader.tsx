import Image from 'next/image'

interface BrandHeaderProps {
  subtitle?: string
}

export function BrandHeader({
  subtitle = 'Valida ideas. Aprende más rápido. Construye lo que importa.',
}: BrandHeaderProps) {
  return (
    <>
      <Image src="/logo.png" alt="Proof Day" width={192} height={192} priority />
      <h1
        style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--color-text-primary)',
        }}
      >
        Bienvenido a Proof Day
      </h1>
      <p
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
        }}
      >
        {subtitle}
      </p>
    </>
  )
}
