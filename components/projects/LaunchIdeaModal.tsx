'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { launchProject } from '@/actions/projects/launchProject'
import { launchIdeaSchema, type LaunchIdeaFormValues } from '@/lib/validations/projects'
import { LaunchIdeaForm } from './LaunchIdeaForm'
import type { UploaderImage } from './ImageUploader'

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

  function handleClose() {
    reset()
    setFeedbackTopics([])
    setImages([])
    setServerError(null)
    onOpenChange(false)
  }

  async function onSubmit(data: LaunchIdeaFormValues) {
    setServerError(null)

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
    })

    if (!result.success) {
      setServerError(result.error)
      return
    }

    onSuccess?.()
    router.refresh()
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[540px]"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <DialogHeader>
          <DialogTitle style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-semibold)' }}>
            Lanzar una nueva idea
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
          >
            <LaunchIdeaForm
              feedbackTopics={feedbackTopics}
              onFeedbackTopicsChange={setFeedbackTopics}
              images={images}
              onImagesChange={setImages}
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
