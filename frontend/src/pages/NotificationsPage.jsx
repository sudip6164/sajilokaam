import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import api from '../utils/api'

export function NotificationsPage() {
  const { token } = useAuth()
  const { success: showSuccess, error: showError } = useToast()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      loadNotifications()
    }
  }, [token])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const data = await api.notifications.getAll(token)
      setNotifications(data)
    } catch (err) {
      showError(err.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.notifications.markAsRead(notificationId, token)
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      )
    } catch (err) {
      showError(err.message || 'Failed to mark notification as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead(token)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      showSuccess('All notifications marked as read')
    } catch (err) {
      showError(err.message || 'Failed to mark all as read')
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading) {
    return (
      <div className="min-h-screen py-12 bg-pattern">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="loading-skeleton h-10 w-48 mb-8"></div>
            <div className="card">
              <div className="loading-skeleton h-8 w-3/4 mb-4"></div>
              <div className="loading-skeleton h-40 w-full"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 bg-pattern">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="page-title">Notifications</h1>
              <p className="page-subtitle">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className="btn btn-secondary">
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No notifications</h3>
              <p className="text-white/70">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`card p-6 cursor-pointer hover:bg-white/10 transition-colors ${
                    !notification.isRead ? 'bg-violet-500/10 border-l-4 border-violet-500' : ''
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      handleMarkAsRead(notification.id)
                    }
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                      !notification.isRead ? 'bg-violet-500' : 'bg-transparent'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-white">{notification.title}</h3>
                        <span className="text-xs text-white/50">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {notification.message && (
                        <p className="text-white/70 mb-3">{notification.message}</p>
                      )}
                      {notification.entityType && notification.entityId && (
                        <div className="flex items-center gap-2">
                          <span className="badge badge-ghost text-xs">
                            {notification.entityType} #{notification.entityId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

