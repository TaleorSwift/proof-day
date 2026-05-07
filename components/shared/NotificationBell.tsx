'use client'

// Story 12.5 — NotificationBell
// Componente de campana de notificaciones in-app.
// - Muestra badge con contador de no leídas
// - DropdownMenu con lista de notificaciones
// - Click en notificación: PATCH para marcar como leída + navegación si hay slugs
// - NO usa Tailwind — usa CSS custom properties del design-tokens

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Notification as AppNotification } from '@/lib/types/ai'

// ---------------------------------------------------------------------------
// Subcomponentes internos
// ---------------------------------------------------------------------------

function BellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function NotificationBell() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // ── Fetch inicial al montar ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function fetchNotifications() {
      try {
        const res = await fetch('/api/notifications')
        if (!res.ok) return
        const body = (await res.json()) as { data: AppNotification[] }
        if (!cancelled) {
          setNotifications(body.data ?? [])
        }
      } catch {
        // Silencioso — no bloquear la UI por un error de notificaciones
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void fetchNotifications()
    return () => { cancelled = true }
  }, [])

  // ── Handler de click en notificación ─────────────────────────────────────
  async function handleNotificationClick(notification: AppNotification) {
    // Marcar como leída
    try {
      await fetch(`/api/notifications/${notification.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      )
    } catch {
      // Silencioso
    }

    // Navegar si tiene los slugs necesarios
    const payload = notification.payload as Record<string, unknown>
    const communitySlug = payload.communitySlug as string | undefined
    const projectSlug = payload.projectSlug as string | undefined

    if (communitySlug && projectSlug) {
      router.push(`/communities/${communitySlug}/projects/${projectSlug}`)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const hasUnread = unreadCount > 0

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          data-testid="notification-bell"
          aria-label={`Notificaciones${hasUnread ? ` (${unreadCount} sin leer)` : ''}`}
          style={{
            position: 'relative',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            padding: 'var(--space-1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BellIcon />
          {hasUnread && !isLoading && (
            <span
              data-testid="notification-badge"
              aria-label={`${unreadCount} notificaciones sin leer`}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                backgroundColor: 'var(--color-accent)',
                color: '#ffffff',
                borderRadius: 9999,
                minWidth: 16,
                height: 16,
                fontSize: 10,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px',
                lineHeight: 1,
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          minWidth: 280,
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <DropdownMenuLabel
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-primary)',
            padding: 'var(--space-3) var(--space-4)',
          }}
        >
          Notificaciones
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div
            style={{
              padding: 'var(--space-4)',
              textAlign: 'center',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
            }}
          >
            No tienes notificaciones nuevas
          </div>
        ) : (
          notifications.map((notification) => {
            const payload = notification.payload as Record<string, unknown>
            const projectTitle = (payload.projectTitle as string | undefined) ?? 'Proyecto'

            return (
              <DropdownMenuItem
                key={notification.id}
                data-testid={`notification-item-${notification.id}`}
                onClick={() => { void handleNotificationClick(notification) }}
                style={{
                  cursor: 'pointer',
                  padding: 'var(--space-3) var(--space-4)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-primary)',
                  opacity: notification.read ? 0.6 : 1,
                }}
              >
                <div>
                  <div style={{ fontWeight: notification.read ? 'var(--font-regular)' : 'var(--font-medium)' }}>
                    {projectTitle}
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                      marginTop: 'var(--space-1)',
                    }}
                  >
                    Síntesis IA disponible
                  </div>
                </div>
              </DropdownMenuItem>
            )
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
