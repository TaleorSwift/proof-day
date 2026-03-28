'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FeedbackDialog } from './FeedbackDialog'

interface FeedbackButtonProps {
  projectId: string
  communityId: string
  onSuccess?: () => void
}

export function FeedbackButton({ projectId, communityId, onSuccess }: FeedbackButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [feedbackCount, setFeedbackCount] = useState(0)

  const handleSuccess = () => {
    setFeedbackCount((prev) => prev + 1)
    router.refresh()
    onSuccess?.()
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        style={{
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-surface)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)',
          border: 'none',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        Dar feedback
        {feedbackCount > 0 && (
          <span
            style={{
              marginLeft: 'var(--space-2)',
              fontSize: 'var(--text-xs)',
              opacity: 0.8,
            }}
          >
            (+{feedbackCount})
          </span>
        )}
      </Button>

      <FeedbackDialog
        projectId={projectId}
        communityId={communityId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  )
}
