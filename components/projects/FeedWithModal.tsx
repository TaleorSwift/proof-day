'use client'

import { useState } from 'react'
import { LaunchIdeaModal } from './LaunchIdeaModal'

interface Props {
  communitySlug: string
  children: React.ReactNode
}

export function FeedWithModal({ communitySlug, children }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  function openModal() {
    setIsOpen(true)
  }

  return (
    <>
      <div data-launch-idea-open={openModal.toString()}>
        {children}
      </div>
      <LaunchIdeaModal
        open={isOpen}
        onOpenChange={setIsOpen}
        communitySlug={communitySlug}
      />
    </>
  )
}
