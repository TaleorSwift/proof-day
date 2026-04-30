'use client'

// Story 10.2 — T2: LaunchIdeaModal con ProjectTemplateSelector integrado

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { launchProject } from '@/actions/projects/launchProject'
import { launchIdeaSchema, type LaunchIdeaFormValues } from '@/lib/validations/projects'
import { LaunchIdeaForm } from './LaunchIdeaForm'
import { ProjectTemplateSelector } from './ProjectTemplateSelector'
import type { UploaderImage } from './ImageUploader'
import type { ProjectTemplate } from '@/lib/types/templates'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  communitySlug: string
  onSuccess?: () => void
}

export function LaunchIdeaModal({ open, onOpenChange, communitySlug, onSuccess }: Props) {
  const router = useRouter()
  const [feedbackTopics, setFeedbackTopics] = useState<string[]>([])
  const [images, setImages] = useState<UploaderImage[]>([])
  const [serverError, setServerError] = useState<string | null>(null)

  // Story 10.2 — T2.1: estado para templates y template seleccionado
  const [templates, setTemplates] = useState<ProjectTemplate[]>([])
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null)

  const methods = useForm<LaunchIdeaFormValues>({
    resolver: zodResolver(launchIdeaSchema),
    defaultValues: {
      title: '',
      tagline: '',
      problem: '',
      solution: '',
      targetUser: '',
      hypothesis: '',
      demoLink: '',
    },
  })

  const { handleSubmit, formState: { isSubmitting }, reset } = methods

  // Story 10.2 — T2.2: fetch templates al montar
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
        // Fetch silencioso — el formulario sigue operativo sin templates
      })

    return () => {
      cancelled = true
    }
  }, [open])

  // Sincronizar selectedTemplate al cambiar templateId
  function handleSelectTemplate(id: string | null) {
    setTemplateId(id)
    setSelectedTemplate(id ? (templates.find((t) => t.id === id) ?? null) : null)
  }

  function handleClose() {
    reset()
    setFeedbackTopics([])
    setImages([])
    setServerError(null)
    setTemplateId(null)
    setSelectedTemplate(null)
    onOpenChange(false)
  }

  async function onSubmit(data: LaunchIdeaFormValues) {
    setServerError(null)

    // Story 10.2 — T2.5: incluir templateId en los datos pasados a launchProject
    const result = await launchProject({
      communitySlug,
      title: data.title,
      tagline: data.tagline,
      problem: data.problem,
      solution: data.solution,
      targetUser: data.targetUser?.trim() || undefined,
      hypothesis: data.hypothesis,
      demoLink: data.demoLink?.trim() || undefined,
      imageUrls: images.map((img) => img.path),
      feedbackTopics,
      templateId,
    })

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
          {/* MEDIUM-6: aria-describedby para eliminar warning de accesibilidad shadcn/ui (Story 10.2 CR fix) */}
          <DialogDescription className="sr-only">
            Formulario para lanzar una nueva idea de proyecto
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
          >
            {/* Story 10.2 — T2.3: selector de tipo encima del formulario */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                }}
              >
                Tipo de proyecto (opcional)
              </p>
              {templates.length === 0 ? (
                /* MEDIUM-5: estado vacío cuando fetch devuelve 0 templates (Story 10.2 CR fix) */
                <p
                  data-testid="templates-empty-state"
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                    margin: 0,
                  }}
                >
                  No hay tipos disponibles
                </p>
              ) : (
                <ProjectTemplateSelector
                  templates={templates}
                  selectedId={templateId}
                  onSelect={handleSelectTemplate}
                />
              )}
            </div>

            {/* Story 10.2 — T2.4: pasar descriptionStructure al formulario */}
            <LaunchIdeaForm
              feedbackTopics={feedbackTopics}
              onFeedbackTopicsChange={setFeedbackTopics}
              images={images}
              onImagesChange={setImages}
              descriptionStructure={selectedTemplate?.descriptionStructure}
            />

            {serverError && (
              <p
                role="alert"
                style={{ fontSize: 'var(--text-sm)', color: 'var(--color-weak-text)', margin: 0 }}
              >
                {serverError}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: 'var(--color-accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  height: '40px',
                }}
              >
                {isSubmitting ? 'Lanzando...' : '+ Lanzar proyecto'}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
