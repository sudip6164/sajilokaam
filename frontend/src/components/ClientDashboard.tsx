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
  Users, 
  MessageSquare, 
  DollarSign, 
  FileText, 
  Plus,
  Star,
  Clock,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  LogOut
} from 'lucide-react';

const sidebarItems = [
  { title: "Dashboard", icon: Home, id: "overview" },
  { title: "Active Projects", icon: Briefcase, id: "projects" },
  { title: "Posted Jobs", icon: FileText, id: "jobs" },
  { title: "Freelancers", icon: Users, id: "freelancers" },
  { title: "Messages", icon: MessageSquare, id: "messages", badge: "3" },
  { title: "Payments", icon: DollarSign, id: "payments" },
];

const mockData = {
  stats: {
    totalSpent: 45780,
    activeProjects: 6,
    hiredFreelancers: 23,
    avgProjectRating: 4.7,
    completedProjects: 42,
    ongoingJobs: 8
  },
  activeProjects: [
    {
      id: 1,
      title: "Mobile App Development",
      freelancer: "Sarah Chen",
      budget: 8000,
      spent: 6000,
      progress: 75,
      deadline: "2024-02-20",
      status: "In Progress",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      rating: 4.9
    },
    {
      id: 2,
      title: "Website Redesign",
      freelancer: "Marcus Rodriguez",
      budget: 5000,
      spent: 2500,
      progress: 50,
      deadline: "2024-02-25",
      status: "In Progress",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      rating: 4.8
    },
    {
      id: 3,
      title: "Content Writing",
      freelancer: "Emily Watson",
      budget: 1500,
      spent: 300,
      progress: 20,
      deadline: "2024-03-01",
      status: "Starting",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      rating: 5.0
    }
  ],
  postedJobs: [
    {
      id: 1,
      title: "React Developer for Dashboard",
      posted: "3 days ago",
      budget: "$3000-$5000",
      proposals: 15,
      status: "Active",
      deadline: "2024-02-15"
    },
    {
      id: 2,
      title: "Logo Design for Startup",
      posted: "1 week ago",
      budget: "$500-$1000",
      proposals: 28,
      status: "Interviewing",
      deadline: "2024-02-10"
    }
  ],
  hiredFreelancers: [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Full-stack Developer",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      rating: 4.9,
      projectsCompleted: 3,
      currentProject: "Mobile App Development"
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      role: "UI/UX Designer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      rating: 4.8,
      projectsCompleted: 2,
      currentProject: "Website Redesign"
    }
  ]
};

export function ClientDashboard() {
  const { navigate, user, logout } = useRouter();
  const [activeSection, setActiveSection] = useState('overview');

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewContent navigate={navigate} />;
      case 'projects':
        return <ProjectsContent navigate={navigate} />;
      case 'jobs':
        return <JobsContent navigate={navigate} />;
      case 'freelancers':
        return <FreelancersContent navigate={navigate} />;
      case 'messages':
        return <MessagesContent navigate={navigate} />;
      case 'payments':
        return <PaymentsContent navigate={navigate} />;
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

              {/* Bottom Actions */}
              <div className="border-t p-4 space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('post-job')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post a Job
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('home')}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Homepage
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => logout()}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage your projects and freelancers</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-secondary" onClick={() => navigate('find-freelancers')}>
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${mockData.stats.totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {mockData.stats.completedProjects} completed projects
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
              {mockData.stats.ongoingJobs} jobs currently hiring
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hired Freelancers</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.stats.hiredFreelancers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg rating: {mockData.stats.avgProjectRating} ⭐
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Projects completed on time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Projects</CardTitle>
          <Button variant="ghost" size="sm">
            View All <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockData.activeProjects.map((project) => (
              <div key={project.id} className="flex items-start space-x-4 p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer" onClick={() => navigate('project-detail', { project })}>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={project.avatar} />
                  <AvatarFallback>{project.freelancer[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold truncate">{project.title}</h4>
                    <Badge variant={project.status === "In Progress" ? "default" : "secondary"}>
                      {project.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Freelancer: {project.freelancer} • ⭐ {project.rating}
                  </p>
                  <div className="flex items-center gap-4 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="font-medium">${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{project.deadline}</span>
                    </div>
                  </div>
                  <div>
                    <Progress value={project.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{project.progress}% complete</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Posted Jobs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Job Postings</CardTitle>
          <Button variant="ghost" size="sm">
            View All <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockData.postedJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer" onClick={() => navigate('job-detail')}>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate mb-1">{job.title}</h4>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{job.posted}</span>
                    <span>•</span>
                    <span>{job.budget}</span>
                    <span>•</span>
                    <span className="font-medium text-primary">{job.proposals} proposals</span>
                  </div>
                </div>
                <Badge variant={job.status === "Active" ? "default" : "secondary"}>
                  {job.status}
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
        <p className="text-muted-foreground">Monitor and manage your ongoing projects</p>
      </div>
      <div className="grid gap-6">
        {mockData.activeProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('project-detail', { project })}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={project.avatar} />
                    <AvatarFallback>{project.freelancer[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="mb-1">{project.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{project.freelancer} • ⭐ {project.rating}</p>
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
                    <span className="font-semibold">${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}</span>
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

function JobsContent({ navigate }: { navigate: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Posted Jobs</h1>
          <p className="text-muted-foreground">Manage your job listings and proposals</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-secondary">
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>
      <div className="grid gap-4">
        {mockData.postedJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('job-detail')}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{job.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Posted {job.posted}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {job.budget}
                    </span>
                    <span className="font-medium text-primary">{job.proposals} proposals received</span>
                  </div>
                </div>
                <Badge variant={job.status === "Active" ? "default" : "secondary"}>
                  {job.status}
                </Badge>
              </div>
              <div className="flex gap-3">
                <Button variant="default" className="flex-1">
                  View Proposals
                </Button>
                <Button variant="outline" className="flex-1">
                  Edit Job
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FreelancersContent({ navigate }: { navigate: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Hired Freelancers</h1>
        <p className="text-muted-foreground">Your network of talented professionals</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {mockData.hiredFreelancers.map((freelancer) => (
          <Card key={freelancer.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('freelancer-profile')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={freelancer.avatar} />
                  <AvatarFallback>{freelancer.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{freelancer.name}</h3>
                  <p className="text-sm text-muted-foreground">{freelancer.role}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-medium">{freelancer.rating}</span>
                    <span className="text-sm text-muted-foreground">• {freelancer.projectsCompleted} projects</span>
                  </div>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 mb-4">
                <p className="text-sm text-muted-foreground mb-1">Current Project:</p>
                <p className="font-medium">{freelancer.currentProject}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="default" className="flex-1">
                  View Profile
                </Button>
                <Button variant="outline" className="flex-1">
                  Message
                </Button>
              </div>
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
        <p className="text-muted-foreground">Communication with freelancers</p>
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

function PaymentsContent({ navigate }: { navigate: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Payments</h1>
        <p className="text-muted-foreground">Transaction history and invoices</p>
      </div>
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Payment Management</h3>
            <p className="text-muted-foreground mb-4">View payment history and manage invoices</p>
            <Button>
              View Payment Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}