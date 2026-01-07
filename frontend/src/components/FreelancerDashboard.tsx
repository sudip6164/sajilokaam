import { useState } from 'react';
import { Header } from './Header';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from './ui/sidebar';
import { useRouter } from './Router';
import { 
  Home,
  Briefcase, 
  FileText, 
  DollarSign, 
  Clock, 
  Star,
  TrendingUp,
  Calendar,
  Eye,
  ArrowUpRight
} from 'lucide-react';

const sidebarItems = [
  { title: "Dashboard", icon: Home, id: "overview" },
  { title: "Active Projects", icon: Briefcase, id: "projects" },
  { title: "Proposals", icon: FileText, id: "proposals" },
  { title: "Earnings", icon: DollarSign, id: "earnings" },
];

const mockData = {
  stats: {
    totalEarnings: 24580,
    monthlyEarnings: 3420,
    activeProjects: 4,
    completedJobs: 127,
    clientRating: 4.9,
    profileViews: 142,
    responseTime: "2 hours",
    successRate: "98%"
  },
  activeProjects: [
    {
      id: 1,
      title: "E-commerce Website Development",
      client: "TechCorp Solutions",
      budget: 5000,
      progress: 75,
      deadline: "2024-02-15",
      status: "In Progress",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 2,
      title: "Mobile App UI Design",
      client: "StartupX",
      budget: 3200,
      progress: 45,
      deadline: "2024-02-20",
      status: "In Progress",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 3,
      title: "Data Analysis Dashboard",
      client: "Analytics Pro",
      budget: 2800,
      progress: 20,
      deadline: "2024-02-28",
      status: "Starting Soon",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
    }
  ],
  recentProposals: [
    {
      id: 1,
      title: "React Development for SaaS Platform",
      submittedAt: "2 days ago",
      status: "Under Review",
      budget: 4500,
      competition: 12
    },
    {
      id: 2,
      title: "WordPress Website Redesign",
      submittedAt: "1 week ago",
      status: "Rejected",
      budget: 2000,
      competition: 23
    },
    {
      id: 3,
      title: "API Integration Project",
      submittedAt: "3 days ago",
      status: "Interview Scheduled",
      budget: 3500,
      competition: 8
    }
  ]
};

export function FreelancerDashboard() {
  const { navigate, user } = useRouter();
  const [activeSection, setActiveSection] = useState('overview');

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewContent navigate={navigate} />;
      case 'projects':
        return <ProjectsContent navigate={navigate} />;
      case 'proposals':
        return <ProposalsContent navigate={navigate} />;
      case 'earnings':
        return <EarningsContent navigate={navigate} />;
      default:
        return <OverviewContent navigate={navigate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      {/* Fixed Header */}
      <Header />
      
      {/* Dashboard Layout */}
      <div className="flex flex-1 overflow-hidden">
        <SidebarProvider>
          {/* Fixed Sidebar */}
          <Sidebar className="fixed left-0 top-16 border-r w-64 flex-shrink-0 h-[calc(100vh-64px)] z-40">
            <SidebarContent className="overflow-y-auto h-full flex flex-col">
              <SidebarGroup className="flex-1">
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {sidebarItems.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton 
                          onClick={() => setActiveSection(item.id)}
                          isActive={activeSection === item.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </div>
                          {item.badge && (
                            <Badge variant="default" className="ml-auto bg-primary">
                              {item.badge}
                            </Badge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

            </SidebarContent>
          </Sidebar>

          {/* Main Content - Scrollable */}
          <main className="flex-1 overflow-y-auto ml-64 pt-16">
            <div className="w-full px-4 md:px-8 lg:px-12 py-8">
              <div className="max-w-7xl mx-auto">
                {renderContent()}
              </div>
            </div>
          </main>
        </SidebarProvider>
      </div>
    </div>
  );
}

function OverviewContent({ navigate }: { navigate: any }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your freelancing overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Rs. {mockData.stats.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">+Rs. {mockData.stats.monthlyEarnings}</span> this month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {mockData.stats.completedJobs} completed total
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Rating</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Star className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.stats.clientRating}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {mockData.stats.successRate} success rate
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Eye className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.stats.profileViews}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg response: {mockData.stats.responseTime}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Projects</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('find-work')}>
            View All <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockData.activeProjects.map((project) => (
              <div key={project.id} className="flex items-start space-x-4 p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer" onClick={() => navigate('project-detail', { project })}>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={project.avatar} />
                  <AvatarFallback>{project.client[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold truncate">{project.title}</h4>
                    <Badge variant={project.status === "In Progress" ? "default" : "secondary"}>
                      {project.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{project.client}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="font-medium">Rs. {project.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{project.deadline}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Progress value={project.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{project.progress}% complete</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Proposals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Proposals</CardTitle>
          <Button variant="ghost" size="sm">
            View All <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockData.recentProposals.map((proposal) => (
              <div key={proposal.id} className="flex items-center justify-between p-4 rounded-lg border hover:border-primary transition-colors">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate mb-1">{proposal.title}</h4>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{proposal.submittedAt}</span>
                    <span>•</span>
                    <span>Rs. {proposal.budget}</span>
                    <span>•</span>
                    <span>{proposal.competition} applicants</span>
                  </div>
                </div>
                <Badge variant={
                  proposal.status === "Under Review" ? "secondary" :
                  proposal.status === "Rejected" ? "destructive" :
                  "default"
                }>
                  {proposal.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectsContent({ navigate }: { navigate: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Active Projects</h1>
        <p className="text-muted-foreground">Manage your ongoing projects</p>
      </div>
      <div className="grid gap-6">
        {mockData.activeProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('project-detail', { project })}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={project.avatar} />
                    <AvatarFallback>{project.client[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="mb-1">{project.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{project.client}</p>
                  </div>
                </div>
                <Badge>{project.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="font-semibold">${project.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Due: {project.deadline}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
                <Button className="w-full">
                  View Project Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProposalsContent({ navigate }: { navigate: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Proposals</h1>
        <p className="text-muted-foreground">Track your submitted proposals</p>
      </div>
      <div className="grid gap-4">
        {mockData.recentProposals.map((proposal) => (
          <Card key={proposal.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{proposal.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {proposal.submittedAt}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Rs. {proposal.budget}
                    </span>
                    <span>{proposal.competition} competing proposals</span>
                  </div>
                </div>
                <Badge variant={
                  proposal.status === "Under Review" ? "secondary" :
                  proposal.status === "Rejected" ? "destructive" :
                  "default"
                }>
                  {proposal.status}
                </Badge>
              </div>
              <Button variant="outline" className="w-full">
                View Proposal
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MessagesContent({ navigate }: { navigate: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground">Communication with clients</p>
      </div>
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Messages Feature</h3>
            <p className="text-muted-foreground mb-4">View full messaging interface</p>
            <Button onClick={() => navigate('messages')}>
              Go to Messages
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EarningsContent({ navigate }: { navigate: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Earnings</h1>
        <p className="text-muted-foreground">Financial overview and history</p>
      </div>
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Earnings Dashboard</h3>
            <p className="text-muted-foreground mb-4">View detailed earnings analytics</p>
            <Button onClick={() => navigate('earnings')}>
              View Earnings Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileContent({ navigate }: { navigate: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your freelancer profile</p>
      </div>
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Profile Management</h3>
            <p className="text-muted-foreground mb-4">View and edit your public profile</p>
            <Button onClick={() => navigate('freelancer-profile')}>
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}