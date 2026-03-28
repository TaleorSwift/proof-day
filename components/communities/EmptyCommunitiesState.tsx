import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function EmptyCommunitiesState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
      role="status"
      aria-label="Sin comunidades"
    >
      <p
        className="text-lg font-medium mb-2"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Aún no formas parte de ninguna comunidad
      </p>
      <p
        className="text-sm mb-8 max-w-sm"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Crea tu propio espacio privado de validación de ideas o únete a uno existente usando un link de invitación.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild>
          <Link href="/communities/new">Crear comunidad</Link>
        </Button>

        <Button variant="outline" disabled aria-label="Usar link de invitación (próximamente)">
          Usar link de invitación
        </Button>
      </div>
    </div>
  )
}
