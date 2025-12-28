import { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle,
  Briefcase,
  MessageSquare,
  DollarSign,
  User,
  FileText,
  Trash2,
  Check,
  Filter,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { notificationsApi } from "@/lib/api";
import { toast } from "sonner";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  icon?: any;
  color?: string;
  bgColor?: string;
}

const ClientNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await notificationsApi.list();
      setNotifications(response.content.map((n: any) => ({
        id: n.id,
        type: n.type.toLowerCase(),
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt,
      })));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getIconConfig = (type: string) => {
    const iconMap: { [key: string]: { icon: any; color: string; bgColor: string } } = {
      bid: { icon: Briefcase, color: "text-primary", bgColor: "bg-primary/10" },
      message: { icon: MessageSquare, color: "text-secondary", bgColor: "bg-secondary/10" },
      payment: { icon: DollarSign, color: "text-orange-500", bgColor: "bg-orange-500/10" },
      milestone: { icon: CheckCircle, color: "text-accent", bgColor: "bg-accent/10" },
      freelancer: { icon: User, color: "text-purple-500", bgColor: "bg-purple-500/10" },
      document: { icon: FileText, color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
    };
    return iconMap[type] || { icon: Bell, color: "text-muted-foreground", bgColor: "bg-muted" };
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error: any) {
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch (error: any) {
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success("All notifications cleared");
  };

  const filterNotifications = (type: string) => {
    if (type === "all") return notifications;
    if (type === "unread") return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === type);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const config = getIconConfig(notification.type);
    const Icon = config.icon;

    return (
      <div
        className={`flex items-start gap-4 p-4 rounded-lg transition-colors cursor-pointer ${
          notification.read ? "bg-background hover:bg-muted/50" : "bg-primary/5 hover:bg-primary/10"
        }`}
        onClick={() => markAsRead(notification.id)}
      >
        <div className={`p-2 rounded-lg ${config.bgColor}`}>
          <Icon className={`h-5 w-5 ${config.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={`font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                {notification.title}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatTime(notification.createdAt)}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with your projects and freelancers
          </p>
        </div>

        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead} className="gap-2">
              <Check className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" onClick={clearAll} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      <Card>
        <Tabs defaultValue="all">
          <CardHeader className="pb-0">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="all">
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="bid">Bids</TabsTrigger>
              <TabsTrigger value="message">Messages</TabsTrigger>
              <TabsTrigger value="payment">Payments</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="pt-4">
            {["all", "unread", "bid", "message", "payment", "milestone"].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-0">
                <div className="space-y-2 group">
                  {filterNotifications(tab).length > 0 ? (
                    filterNotifications(tab).map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="font-medium text-lg mb-1">No notifications</h3>
                      <p className="text-muted-foreground">
                        {tab === "unread"
                          ? "You're all caught up!"
                          : "No notifications in this category."}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ClientNotifications;
