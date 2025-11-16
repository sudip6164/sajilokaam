import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import api from '../utils/api'

export function NotificationBell() {
  const { token, profile } = useAuth()
  const { success: showSuccess } = useToast()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (token) {
      loadUnreadCount()
      loadNotifications()
    }
  }, [token])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const loadUnreadCount = async () => {
    try {
      const count = await api.notifications.getUnreadCount(token)
      setUnreadCount(count)
    } catch (err) {
      console.error('Failed to load unread count', err)
    }
  }

  const loadNotifications = async () => {
    try {
      const data = await api.notifications.getAll(token)
      setNotifications(data.slice(0, 10)) // Show latest 10
    } catch (err) {
      console.error('Failed to load notifications', err)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.notifications.markAsRead(notificationId, token)
      setUnreadCount(prev => Math.max(0, prev - 1))
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      )
    } catch (err) {
      console.error('Failed to mark notification as read', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead(token)
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      showSuccess('All notifications marked as read')
    } catch (err) {
      console.error('Failed to mark all as read', err)
    }
  }

  if (!token || !profile) {
    return null
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setShowDropdown(!showDropdown)
          if (!showDropdown) {
            loadNotifications()
          }
        }}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        <svg
          className="w-6 h-6 text-white/70 hover:text-white transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-[#101820] border border-white/20 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-white/50 text-sm">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-violet-500/10' : ''
                    }`}
                    onClick={() => {
                      if (!notification.isRead) {
                        handleMarkAsRead(notification.id)
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        !notification.isRead ? 'bg-violet-500' : 'bg-transparent'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white mb-1">
                          {notification.title}
                        </p>
                        {notification.message && (
                          <p className="text-xs text-white/70 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-white/50 mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-3 border-t border-white/10 text-center">
              <a
                href="/notifications"
                className="text-sm text-violet-400 hover:text-violet-300 font-semibold"
              >
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

