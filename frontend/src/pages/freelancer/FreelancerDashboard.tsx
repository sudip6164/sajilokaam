import { 
  Briefcase, 
  DollarSign, 
  Clock, 
  Star, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const stats = [
  { 
    label: "Active Projects", 
    value: "4", 
    icon: Briefcase, 
    change: "+2 this month",
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  { 
    label: "Total Earnings", 
    value: "NPR 125,000", 
    icon: DollarSign, 
    change: "+15% vs last month",
    color: "text-secondary",
    bgColor: "bg-secondary/10"
  },
  { 
    label: "Hours Logged", 
    value: "156", 
    icon: Clock, 
    change: "This month",
    color: "text-accent",
    bgColor: "bg-accent/10"
  },
  { 
    label: "Avg. Rating", 
    value: "4.9", 
    icon: Star, 
    change: "From 28 reviews",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10"
  },
];

const earningsData = [
  { month: "Jan", earnings: 45000 },
  { month: "Feb", earnings: 52000 },
  { month: "Mar", earnings: 48000 },
  { month: "Apr", earnings: 70000 },
  { month: "May", earnings: 85000 },
  { month: "Jun", earnings: 125000 },
];

const recentBids = [
  { id: 1, job: "E-commerce Website Development", amount: "NPR 50,000", status: "pending" },
  { id: 2, job: "Mobile App UI Design", amount: "NPR 25,000", status: "accepted" },
  { id: 3, job: "WordPress Plugin Development", amount: "NPR 15,000", status: "rejected" },
];

const activeProjects = [
  { id: 1, name: "TechStartup Website", client: "ABC Corp", progress: 75, deadline: "Dec 25, 2024" },
  { id: 2, name: "Mobile Banking App", client: "XYZ Bank", progress: 45, deadline: "Jan 15, 2025" },
  { id: 3, name: "CRM Dashboard", client: "Sales Pro", progress: 90, deadline: "Dec 20, 2024" },
];

const upcomingDeadlines = [
  { task: "Submit wireframes", project: "Mobile Banking App", date: "Dec 19", urgent: true },
  { task: "Client presentation", project: "CRM Dashboard", date: "Dec 20", urgent: true },
  { task: "Code review", project: "TechStartup Website", date: "Dec 22", urgent: false },
];

export default function FreelancerDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, Ram! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your freelance work today.
          </p>
        </div>
        <Button asChild>
          <Link to="/freelancer/jobs">
            Find New Jobs
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-secondary" />
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Earnings Overview</span>
              <Badge variant="outline">Last 6 months</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(value) => `${value/1000}k`} />
                  <Tooltip 
                    formatter={(value: number) => [`NPR ${value.toLocaleString()}`, "Earnings"]}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingDeadlines.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                {item.urgent ? (
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                ) : (
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.task}</p>
                  <p className="text-xs text-muted-foreground">{item.project}</p>
                </div>
                <Badge variant={item.urgent ? "destructive" : "outline"} className="text-xs">
                  {item.date}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Active Projects</span>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/freelancer/projects">View All</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeProjects.map((project) => (
              <div key={project.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-muted-foreground">{project.client}</p>
                  </div>
                  <Badge variant="outline">{project.deadline}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={project.progress} className="flex-1" />
                  <span className="text-sm font-medium">{project.progress}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent bids */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Bids</span>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/freelancer/bids">View All</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentBids.map((bid) => (
              <div key={bid.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{bid.job}</p>
                  <p className="text-sm text-muted-foreground">{bid.amount}</p>
                </div>
                <Badge 
                  variant={
                    bid.status === "accepted" ? "default" : 
                    bid.status === "rejected" ? "destructive" : "secondary"
                  }
                  className={bid.status === "accepted" ? "bg-secondary" : ""}
                >
                  {bid.status === "accepted" && <CheckCircle className="h-3 w-3 mr-1" />}
                  {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
