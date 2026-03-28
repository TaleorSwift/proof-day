'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ProfileForm } from './ProfileForm'
import type { Profile, ProfileWithStats } from '@/lib/types/profiles'

interface OwnProfileViewProps {
  profile: ProfileWithStats
}

export function OwnProfileView({ profile: initialProfile }: OwnProfileViewProps) {
  const [profile, setProfile] = useState<ProfileWithStats>(initialProfile)
  const [isEditing, setIsEditing] = useState(false)

  function handleSave(updated: Profile) {
    setProfile({ ...profile, ...updated })
    setIsEditing(false)
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: 'var(--space-8)',
        maxWidth: '720px',
        margin: '0 auto',
      }}
    >
      {!isEditing ? (
        <>
          {/* Cabecera con nombre y botón editar */}
          <div className="flex items-start justify-between gap-[var(--space-4)]">
            <div>
              <h1
                style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--leading-2xl)',
                }}
              >
                {profile.name ?? 'Sin nombre'}
              </h1>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Editar perfil
            </Button>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p
              style={{
                marginTop: 'var(--space-4)',
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-base)',
              }}
            >
              {profile.bio}
            </p>
          )}

          {/* Intereses */}
          {profile.interests && profile.interests.length > 0 && (
            <div
              className="flex flex-wrap gap-[var(--space-2)]"
              style={{ marginTop: 'var(--space-4)' }}
            >
              {profile.interests.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: 'var(--space-1) var(--space-3)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-sm)',
                    backgroundColor: 'var(--color-background)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <Separator style={{ margin: 'var(--space-6) 0' }} />

          {/* Métricas */}
          <div className="flex gap-[var(--space-8)]">
            <div>
              <p
                style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 'var(--font-bold)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {profile.feedbackCount}
              </p>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                feedbacks dados
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 'var(--font-bold)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {profile.projectCount}
              </p>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                proyectos creados
              </p>
            </div>
          </div>

          <Separator style={{ margin: 'var(--space-6) 0' }} />

          {/* Tabs */}
          <Tabs defaultValue="projects">
            <TabsList>
              <TabsTrigger value="projects">Proyectos creados</TabsTrigger>
              <TabsTrigger value="feedbacks">Feedbacks dados</TabsTrigger>
            </TabsList>
            <TabsContent value="projects">
              <p
                style={{
                  marginTop: 'var(--space-4)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                }}
              >
                Los proyectos creados aparecerán aquí.
              </p>
            </TabsContent>
            <TabsContent value="feedbacks">
              <p
                style={{
                  marginTop: 'var(--space-4)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                }}
              >
                Los feedbacks dados aparecerán aquí.
              </p>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <>
          <h1
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-6)',
            }}
          >
            Editar perfil
          </h1>
          <ProfileForm
            profile={profile}
            onSuccess={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        </>
      )}
    </div>
  )
}
