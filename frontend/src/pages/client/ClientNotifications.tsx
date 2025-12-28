import { useState } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const initialNotifications = [
  {
    id: 1,
    type: "bid",
    title: "New bid received",
    message: "Sita Sharma placed a bid of NPR 75,000 on 'E-commerce Website Development'",
    time: "5 minutes ago",
    read: false,
    icon: Briefcase,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: 2,
    type: "message",
    title: "New message",
    message: "Ram Karki sent you a message about the project requirements",
    time: "15 minutes ago",
    read: false,
    icon: MessageSquare,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    id: 3,
    type: "milestone",
    title: "Milestone completed",
    message: "Hari Thapa completed 'Final Delivery' milestone for Logo Design Package",
    time: "1 hour ago",
    read: false,
    icon: CheckCircle,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    id: 4,
    type: "payment",
    title: "Payment required",
    message: "Invoice INV-2024-001 for NPR 12,000 is due in 3 days",
    time: "2 hours ago",
    read: true,
    icon: DollarSign,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    id: 5,
    type: "bid",
    title: "New bid received",
    message: "Maya KC placed a bid of NPR 65,000 on 'E-commerce Website Development'",
    time: "3 hours ago",
    read: true,
    icon: Briefcase,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: 6,
    type: "freelancer",
    title: "Freelancer accepted",
    message: "Raj Gurung accepted your project invitation for Mobile App Design",
    time: "5 hours ago",
    read: true,
    icon: User,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: 7,
    type: "document",
    title: "Document uploaded",
    message: "Sita Sharma uploaded project deliverables for Company Portfolio Website",
    time: "1 day ago",
    read: true,
    icon: FileText,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    id: 8,
    type: "payment",
    title: "Payment successful",
    message: "Your payment of NPR 8,000 to Sita Sharma was successful",
    time: "2 days ago",
    read: true,
    icon: DollarSign,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
];

const ClientNotifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast({
      title: "All notifications marked as read",
    });
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    toast({
      title: "Notification deleted",
    });
  };

  const clearAll = () => {
    setNotifications([]);
    toast({
      title: "All notifications cleared",
    });
  };

  const filterNotifications = (type: string) => {
    if (type === "all") return notifications;
    if (type === "unread") return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === type);
  };

  const NotificationItem = ({ notification }: { notification: typeof notifications[0] }) => {
    const Icon = notification.icon;

    return (
      <div
        className={`flex items-start gap-4 p-4 rounded-lg transition-colors cursor-pointer ${
          notification.read ? "bg-background hover:bg-muted/50" : "bg-primary/5 hover:bg-primary/10"
        }`}
        onClick={() => markAsRead(notification.id)}
      >
        <div className={`p-2 rounded-lg ${notification.bgColor}`}>
          <Icon className={`h-5 w-5 ${notification.color}`} />
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
                {notification.time}
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
