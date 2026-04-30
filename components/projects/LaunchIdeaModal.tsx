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
    onOpenChange(false)
  }

  async function handleWizardSubmit(data: WizardFormData) {
    setServerError(null)
    setIsSubmitting(true)

    // Story 10.3 — T5.2: submit temporal desde paso 3
    // TODO Story 10.4: eliminar submit temporal — reemplazar por avance al paso 'preview'
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
    })

    setIsSubmitting(false)

    if (!result.success) {
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
        />
      </DialogContent>
    </Dialog>
  )
}
