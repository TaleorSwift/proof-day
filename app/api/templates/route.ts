// Story 10.1 — GET /api/templates
// Retorna los 5 tipos de project_templates ordenados por name
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/middleware/require-auth'
import { templateFromRow } from '@/lib/types/templates'
import type { ProjectTemplateRow } from '@/lib/types/templates'

export async function GET() {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { supabase } = auth

  const { data, error } = await supabase
    .from('project_templates')
    .select('*')
    .order('name')

  if (error)
    return NextResponse.json({ error: 'Error al obtener templates' }, { status: 500 })

  return NextResponse.json({ data: ((data ?? []) as ProjectTemplateRow[]).map(templateFromRow) })
}
