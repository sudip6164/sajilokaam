import { useState } from 'react';
import { 
  Bell, Check, Trash2, Settings, Filter, MessageSquare, 
  Briefcase, DollarSign, Star, AlertCircle, CheckCircle, X 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export interface Notification {
  id: number;
  type: 'message' | 'project' | 'payment' | 'review' | 'system';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsDropdown({ isOpen, onClose }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'message',
      title: 'New message from Sarah Johnson',
      description: 'Great! I can start working on the project next week.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      isRead: false,
      priority: 'high',
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment received',
      description: 'You received $1,500 for milestone completion',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      isRead: false,
      priority: 'high',
    },
    {
      id: 3,
      type: 'project',
      title: 'Milestone approved',
      description: 'Your milestone "Initial Design & Wireframes" has been approved',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      isRead: false,
      priority: 'medium',
    },
    {
      id: 4,
      type: 'review',
      title: 'New review received',
      description: 'Client left you a 5-star review',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      isRead: true,
      priority: 'medium',
    },
    {
      id: 5,
      type: 'project',
      title: 'New job match',
      description: 'A job matching your skills was just posted',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      isRead: true,
      priority: 'low',
    },
    {
      id: 6,
      type: 'system',
      title: 'Profile verification complete',
      description: 'Your profile has been successfully verified',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      isRead: true,
      priority: 'low',
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead) 
    : notifications;

  const getIcon = (type: Notification['type']) => {
    const icons = {
      message: <MessageSquare className="h-5 w-5 text-primary" />,
      project: <Briefcase className="h-5 w-5 text-secondary" />,
      payment: <DollarSign className="h-5 w-5 text-success" />,
      review: <Star className="h-5 w-5 text-yellow-500" />,
      system: <AlertCircle className="h-5 w-5 text-muted-foreground" />,
    };
    return icons[type];
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else if (diffInMinutes < 10080) {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />

      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-2 w-96 bg-card rounded-xl border border-border shadow-2xl z-50 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border bg-background">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-bold">Notifications</h3>
              {unreadCount > 0 && (
                <Badge className="bg-primary text-white">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Mark all as read"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
              )}
              <button
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === 'unread'
                  ? 'bg-primary text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[480px] overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-semibold mb-1">No notifications</p>
              <p className="text-sm text-muted-foreground">
                {filter === 'unread' 
                  ? "You're all caught up!" 
                  : "When you get notifications, they'll show up here"}
              </p>
            </div>
          ) : (
            <div>
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group relative flex gap-3 p-4 border-b border-border hover:bg-muted/50 transition-colors ${
                    !notification.isRead ? 'bg-primary/5' : ''
                  }`}
                >
                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                  )}

                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center ml-2">
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm leading-tight">
                        {notification.title}
                      </p>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {notification.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1.5 hover:bg-background rounded transition-colors"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1.5 hover:bg-background rounded transition-colors text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredNotifications.length > 0 && (
          <div className="p-3 border-t border-border bg-background">
            <button className="w-full text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              View all notifications
            </button>
          </div>
        )}
      </div>
    </>
  );
}
