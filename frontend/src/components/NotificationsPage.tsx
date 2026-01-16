import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { 
  Bell, Check, Trash2, MessageSquare, Briefcase, 
  DollarSign, Star, AlertCircle, CheckCircle, Loader2 
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { notificationsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Notification {
  id: number;
  type: 'message' | 'project' | 'payment' | 'review' | 'system';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
}

export function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params: any = { page: 0, size: 100 };
      if (filter === 'unread') {
        params.read = false;
      }
      const data = await notificationsApi.list(params);
      const notificationsList = Array.isArray(data) ? data : (data.content || []);
      const mapped = notificationsList.map((n: any) => ({
        id: n.id,
        type: mapNotificationType(n.type),
        title: n.title,
        description: n.message || n.title,
        timestamp: n.createdAt,
        isRead: n.read || n.isRead || false,
      }));
      setNotifications(mapped);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const mapNotificationType = (type: string): Notification['type'] => {
    const upper = type.toUpperCase();
    if (upper.includes('MESSAGE')) return 'message';
    if (upper.includes('PAYMENT') || upper.includes('INVOICE')) return 'payment';
    if (upper.includes('REVIEW')) return 'review';
    if (upper.includes('PROJECT') || upper.includes('TASK') || upper.includes('MILESTONE')) return 'project';
    return 'system';
  };

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
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead) 
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 pb-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Notifications</h1>
                <p className="text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
              {unreadCount > 0 && (
                <Button onClick={markAllAsRead} variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark all as read
                </Button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-border">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  filter === 'all'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  filter === 'unread'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-semibold mb-1 text-lg">No notifications</p>
              <p className="text-sm text-muted-foreground">
                {filter === 'unread' 
                  ? "You're all caught up!" 
                  : "When you get notifications, they'll show up here"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group relative flex gap-4 p-4 rounded-lg border transition-colors ${
                    !notification.isRead 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'bg-card border-border hover:bg-muted/50'
                  }`}
                >
                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                  )}

                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center ml-2">
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm leading-tight">
                        {notification.title}
                      </p>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 hover:bg-background rounded transition-colors"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
