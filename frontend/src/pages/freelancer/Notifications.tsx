import { useState } from "react";
import { 
  Bell,
  Briefcase,
  MessageSquare,
  DollarSign,
  CheckCircle,
  Star,
  Clock,
  Trash2,
  Check,
  MoreHorizontal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Notification {
  id: number;
  type: "bid" | "message" | "payment" | "project" | "review";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    type: "bid",
    title: "Bid Accepted!",
    description: "Your bid for 'Mobile App UI Design' has been accepted by FinPay Solutions.",
    time: "5 minutes ago",
    read: false,
  },
  {
    id: 2,
    type: "message",
    title: "New Message",
    description: "ABC Corp sent you a message regarding TechStartup Website project.",
    time: "30 minutes ago",
    read: false,
  },
  {
    id: 3,
    type: "payment",
    title: "Payment Received",
    description: "You received NPR 25,000 for Design Phase milestone.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 4,
    type: "project",
    title: "Milestone Due Tomorrow",
    description: "Development Phase milestone for TechStartup Website is due tomorrow.",
    time: "4 hours ago",
    read: true,
  },
  {
    id: 5,
    type: "review",
    title: "New Review",
    description: "ShopNepal left you a 5-star review for E-commerce Platform project.",
    time: "1 day ago",
    read: true,
  },
  {
    id: 6,
    type: "bid",
    title: "Bid Shortlisted",
    description: "Your bid for 'API Integration Project' has been shortlisted.",
    time: "2 days ago",
    read: true,
  },
  {
    id: 7,
    type: "message",
    title: "New Message",
    description: "Sales Pro is requesting a project update for CRM Dashboard.",
    time: "3 days ago",
    read: true,
  },
];

const typeConfig = {
  bid: { icon: Briefcase, color: "text-primary", bgColor: "bg-primary/10" },
  message: { icon: MessageSquare, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  payment: { icon: DollarSign, color: "text-secondary", bgColor: "bg-secondary/10" },
  project: { icon: Clock, color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  review: { icon: Star, color: "text-accent-foreground", bgColor: "bg-accent/10" },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState("all");

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.read;
    return n.type === activeTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <Check className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-2">
          <TabsTrigger value="all">
            All
            <Badge variant="secondary" className="ml-2">{notifications.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            <Badge variant="secondary" className="ml-2">{unreadCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="bid">Bids</TabsTrigger>
          <TabsTrigger value="message">Messages</TabsTrigger>
          <TabsTrigger value="payment">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0 divide-y">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No notifications to show</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => {
                  const config = typeConfig[notification.type];
                  const Icon = config.icon;
                  return (
                    <div 
                      key={notification.id}
                      className={`flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className={`p-3 rounded-xl ${config.bgColor}`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.description}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="flex-shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!notification.read && (
                            <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                              <Check className="h-4 w-4 mr-2" />
                              Mark as Read
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
