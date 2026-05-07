'use client'

// Story 10.3 — LaunchIdeaModal refactorizado para usar ProjectWizard

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { launchProject } from '@/actions/projects/launchProject'
import { ProjectWizard } from './ProjectWizard'
import type { WizardFormData } from './ProjectWizard'
import type { ProjectTemplate } from '@/lib/types/templates'
import type { ReciprocityGate } from '@/lib/utils/reciprocity'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  communitySlug: string
  onSuccess?: () => void
}

export function LaunchIdeaModal({ open, onOpenChange, communitySlug, onSuccess }: Props) {
  const router = useRouter()
  const [templates, setTemplates] = useState<ProjectTemplate[]>([])
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Story 11.5 — gate de reciprocidad: se activa cuando launchProject devuelve RECIPROCITY_GATE_BLOCKED
  const [reciprocityGate, setReciprocityGate] = useState<ReciprocityGate | undefined>(undefined)

  // Story 10.2 — fetch templates al montar (conservado desde Story 10.2)
  useEffect(() => {
    if (!open) return

    let cancelled = false

    fetch('/api/templates')
      .then((res) => res.json())
      .then((json: { data: ProjectTemplate[] }) => {
        if (!cancelled) {
          setTemplates(json.data ?? [])
        }
      })
      .catch(() => {
        // Fetch silencioso — el wizard sigue operativo sin templates
      })

    return () => {
      cancelled = true
    }
  }, [open])

  function handleClose() {
    setServerError(null)
    setReciprocityGate(undefined)
    onOpenChange(false)
  }

  async function handleWizardSubmit(data: WizardFormData) {
    setServerError(null)
    setReciprocityGate(undefined)
    setIsSubmitting(true)

    // Story 10.4 — submit desde paso 5 (ProjectPreview) vía onSubmit del wizard
    const result = await launchProject({
      communitySlug,
      title: data.title,
      tagline: data.tagline,
      problem: data.problem,
      solution: data.solution,
      targetUser: data.targetUser?.trim() || undefined,
      hypothesis: data.hypothesis || '',
      demoLink: data.demoLink?.trim() || undefined,
      imageUrls: data.images.map((img) => img.path),
      feedbackTopics: data.feedbackTopics,
      templateId: data.templateId,
      // Story 11.2 — pregunta custom del Builder
      customQuestion: data.customQuestion?.trim() || undefined,
    })

    setIsSubmitting(false)

    if (!result.success) {
      // Story 11.5 — si el gate de reciprocidad bloquea, actualizar el estado del gate
      if (!result.success && result.code === 'RECIPROCITY_GATE_BLOCKED') {
        // Extraer given/required del mensaje de error para pasar a ProjectPreview
        // El formato es: "Necesitas dar N feedbacks más... Has dado X de Y requeridos."
        const match = result.error.match(/Has dado (\d+) de (\d+) requeridos/)
        if (match) {
          const given = parseInt(match[1], 10)
          const required = parseInt(match[2], 10)
          setReciprocityGate({ blocked: true, given, required })
        }
      }
      setServerError(result.error)
      return
    }

    toast.success('¡Idea lanzada! Ya está recibiendo feedback.')
    onSuccess?.()
    router.refresh()
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-2xl"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <DialogHeader>
          <DialogTitle style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-semibold)' }}>
            Lanzar una nueva idea
          </DialogTitle>
          {/* aria-describedby para eliminar warning de accesibilidad shadcn/ui */}
          <DialogDescription className="sr-only">
            Formulario para lanzar una nueva idea de proyecto
          </DialogDescription>
        </DialogHeader>

        {/* key fuerza desmontaje/remontaje al abrir/cerrar — garantiza reset de estado (T5.3) */}
        <ProjectWizard
          key={open ? 'open' : 'closed'}
          templates={templates}
          onSubmit={handleWizardSubmit}
          onCancel={handleClose}
          isSubmitting={isSubmitting}
          serverError={serverError}
          reciprocityGate={reciprocityGate}
        />
      </DialogContent>
    </Dialog>
  )
}
