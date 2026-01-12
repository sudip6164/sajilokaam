import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from './ui/sidebar';
import { useRouter } from './Router';
import { useAuth } from '@/contexts/AuthContext';
import { jobsApi, projectsApi, bidsApi, invoicesApi, paymentsApi } from '@/lib/api';
import { 
  Home,
  Briefcase, 
  Users, 
  DollarSign, 
  FileText, 
  Plus,
  Star,
  Clock,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Eye
} from 'lucide-react';

const sidebarItems = [
  { title: "Dashboard", icon: Home, id: "overview" },
  { title: "Active Projects", icon: Briefcase, id: "projects" },
  { title: "Posted Jobs", icon: FileText, id: "jobs" },
  { title: "Freelancers", icon: Users, id: "freelancers" },
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
      budget: "Rs. 3000-5000",
      proposals: 15,
      status: "Active",
      deadline: "2024-02-15"
    },
    {
      id: 2,
      title: "Logo Design for Startup",
      posted: "1 week ago",
      budget: "Rs. 500-1000",
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
  const { navigate } = useRouter();
  const [activeSection, setActiveSection] = useState('overview');

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewContent navigate={navigate} setActiveSection={setActiveSection} />;
      case 'projects':
        return <ProjectsContent navigate={navigate} />;
      case 'jobs':
        return <JobsContent navigate={navigate} />;
      case 'freelancers':
        return <FreelancersContent navigate={navigate} />;
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
              </div>
            </SidebarContent>
          </Sidebar>

          {/* Main Content - Scrollable */}
          <main className="flex-1 overflow-y-auto ml-32 pt-16 pr-6 pb-6 pl-3">
            {renderContent()}
          </main>
        </SidebarProvider>
      </div>
    </div>
  );
}

function OverviewContent({ navigate, setActiveSection }: { navigate: any; setActiveSection: (section: string) => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [pendingBids, setPendingBids] = useState(0);
  const [proposalCounts, setProposalCounts] = useState<Record<number, number>>({});
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalSpent: 0,
    openJobs: 0,
  });

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userId = user?.id;

      // Fetch jobs
      const jobsData = await jobsApi.list({ clientId: userId });
      setJobs(jobsData || []);

      // Fetch projects
      const projectsData = await projectsApi.list({ clientId: userId });
      setProjects(projectsData || []);

      // Calculate stats
      const openJobs = jobsData?.filter(j => j.status === 'OPEN') || [];
      const activeProjs = projectsData?.filter(p => p.status === 'IN_PROGRESS' || p.status === 'ACTIVE') || [];
      const completedProjs = projectsData?.filter(p => p.status === 'COMPLETED') || [];
      const totalSpent = completedProjs.reduce((sum, p) => sum + (p.budget || 0), 0);

      // Count pending bids and fetch proposal counts for all jobs
      let pendingCount = 0;
      const counts: Record<number, number> = {};
      
      for (const job of openJobs) {
        try {
          const bids = await bidsApi.listByJob(job.id);
          const bidCount = bids?.length || 0;
          counts[job.id] = bidCount;
          
          const pendingBids = bids?.filter(b => b.status === 'PENDING') || [];
          pendingCount += pendingBids.length;
        } catch (err) {
          console.error(`Error fetching bids for job ${job.id}:`, err);
        }
      }
      
      setPendingBids(pendingCount);
      setProposalCounts(counts);

      setStats({
        totalJobs: jobsData?.length || 0,
        activeProjects: activeProjs.length,
        completedProjects: completedProjs.length,
        totalSpent,
        openJobs: openJobs.length,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const recentJobs = jobs.slice(0, 5);
  const recentProjects = projects.slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage your projects and freelancers</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-secondary" onClick={() => navigate('post-job')}>
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.openJobs} currently open
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
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedProjects} completed
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bids</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBids}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting your review
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Rs. {stats.totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {stats.completedProjects} completed projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Projects</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setActiveSection('projects')}>
            View All <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {recentProjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No active projects yet</p>
              <Button variant="link" onClick={() => navigate('post-job')}>Post a job</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentProjects.map((project: any) => {
                const deadline = project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline';
                return (
                  <div key={project.id} className="flex items-start space-x-4 p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer" onClick={() => navigate('project-detail', { projectId: project.id })}>
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{project.title?.[0] || 'P'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold truncate">{project.title}</h4>
                        <Badge variant={project.status === "IN_PROGRESS" || project.status === "ACTIVE" ? "default" : "secondary"}>
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Project #{project.id}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span className="font-medium">Rs. {project.budget?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{deadline}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Posted Jobs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Job Postings</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setActiveSection('jobs')}>
            View All <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {recentJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No jobs posted yet</p>
              <Button variant="link" onClick={() => navigate('post-job')}>Post your first job</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => {
                const posted = job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently';
                const budget = job.jobType === 'HOURLY' 
                  ? `Rs. ${job.budgetMin || '0'} - Rs. ${job.budgetMax || '0'}/hr`
                  : `Rs. ${job.budgetMax?.toLocaleString() || '0'} fixed`;
                
                // Get proposal count from state (fetched in fetchDashboardData)
                const proposalCount = proposalCounts[job.id] || 0;
                
                return (
                  <div key={job.id} className="flex items-center justify-between p-4 rounded-lg border hover:border-primary transition-colors">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate('job-detail', { jobId: job.id })}>
                      <h4 className="font-medium truncate mb-1">{job.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{posted}</span>
                        <span>•</span>
                        <span>{budget}</span>
                        <span>•</span>
                        <span className="font-medium text-primary">{job.category?.name || 'Uncategorized'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {job.status === 'OPEN' && proposalCount > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate('proposals-list', { jobId: job.id })}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {proposalCount} Proposal{proposalCount !== 1 ? 's' : ''}
                        </Button>
                      )}
                      <Badge variant={job.status === "OPEN" ? "default" : "secondary"}>
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectsContent({ navigate }: { navigate: any }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await projectsApi.list({ clientId: user?.id });
      setProjects(projectsData || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Active Projects</h1>
          <p className="text-muted-foreground">Monitor and manage your ongoing projects</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Active Projects</h1>
        <p className="text-muted-foreground">Monitor and manage your ongoing projects</p>
      </div>
      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">Projects will appear here once you accept a bid</p>
              <Button onClick={() => navigate('post-job')}>
                <Plus className="h-4 w-4 mr-2" />
                Post a Job
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {projects.map((project) => {
            const deadline = project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline';
            return (
              <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('project-detail', { projectId: project.id })}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>{project.title[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="mb-1">{project.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">Project ID: {project.id}</p>
                      </div>
                    </div>
                    <Badge variant={project.status === "IN_PROGRESS" || project.status === "ACTIVE" ? "default" : "secondary"}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="font-semibold">Rs. {project.budget?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Due: {deadline}</span>
                      </div>
                    </div>
                    <Button className="w-full" onClick={(e) => {
                      e.stopPropagation();
                      navigate('project-detail', { projectId: project.id });
                    }}>
                      View Project Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function JobsContent({ navigate }: { navigate: any }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const jobsData = await jobsApi.list({ clientId: user?.id });
      setJobs(jobsData || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProposalCount = async (jobId: number) => {
    try {
      const bids = await bidsApi.list({ jobId, status: 'PENDING' });
      return bids?.length || 0;
    } catch (err) {
      return 0;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Posted Jobs</h1>
            <p className="text-muted-foreground">Manage your job listings and proposals</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading jobs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Posted Jobs</h1>
          <p className="text-muted-foreground">Manage your job listings and proposals</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-secondary" onClick={() => navigate('post-job')}>
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>
      {jobs.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">No jobs posted yet</h3>
              <p className="text-muted-foreground mb-4">Start by posting your first job</p>
              <Button onClick={() => navigate('post-job')}>
                <Plus className="h-4 w-4 mr-2" />
                Post Your First Job
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => {
            const posted = job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently';
            const budget = job.jobType === 'HOURLY' 
              ? `Rs. ${job.budgetMin || '0'} - Rs. ${job.budgetMax || '0'}/hr`
              : `Rs. ${job.budgetMax?.toLocaleString() || '0'} fixed`;
            return (
              <Card key={job.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('job-detail', { jobId: job.id })}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{job.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Posted {posted}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {budget}
                        </span>
                        <span className="font-medium text-primary">{job.category?.name || 'Uncategorized'}</span>
                      </div>
                    </div>
                    <Badge variant={job.status === "OPEN" ? "default" : "secondary"}>
                      {job.status}
                    </Badge>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="default" className="flex-1" onClick={(e) => {
                      e.stopPropagation();
                      navigate('job-detail', { jobId: job.id });
                    }}>
                      View Details
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement edit job functionality
                      navigate('job-detail', { jobId: job.id });
                    }}>
                      View Proposals
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FreelancersContent({ navigate }: { navigate: any }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [freelancers, setFreelancers] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchFreelancers();
    }
  }, [user]);

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      // Get all projects for this client
      const projects = await projectsApi.list({ clientId: user?.id });
      
      // Extract unique freelancer IDs from projects
      const freelancerIds = new Set<number>();
      const freelancerProjects: Record<number, any[]> = {};
      
      projects?.forEach((project: any) => {
        if (project.freelancerId) {
          freelancerIds.add(project.freelancerId);
          if (!freelancerProjects[project.freelancerId]) {
            freelancerProjects[project.freelancerId] = [];
          }
          freelancerProjects[project.freelancerId].push(project);
        }
      });

      // For now, we'll create a simple list from project data
      // In a full implementation, we'd fetch freelancer profiles
      const freelancerList = Array.from(freelancerIds).map((freelancerId) => {
        const projectsForFreelancer = freelancerProjects[freelancerId];
        const activeProject = projectsForFreelancer.find((p: any) => 
          p.status === 'IN_PROGRESS' || p.status === 'ACTIVE'
        ) || projectsForFreelancer[0];
        
        return {
          id: freelancerId,
          name: `Freelancer ${freelancerId}`, // Placeholder - would need user API
          role: 'Freelancer',
          rating: 4.5, // Placeholder
          projectsCompleted: projectsForFreelancer.filter((p: any) => p.status === 'COMPLETED').length,
          currentProject: activeProject?.title || 'No active project',
          projectId: activeProject?.id,
        };
      });
      
      setFreelancers(freelancerList);
    } catch (err) {
      console.error('Error fetching freelancers:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Hired Freelancers</h1>
          <p className="text-muted-foreground">Your network of talented professionals</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading freelancers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Hired Freelancers</h1>
        <p className="text-muted-foreground">Your network of talented professionals</p>
      </div>
      {freelancers.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">No freelancers hired yet</h3>
              <p className="text-muted-foreground mb-4">Freelancers will appear here once you accept a bid</p>
              <Button onClick={() => navigate('post-job')}>
                <Plus className="h-4 w-4 mr-2" />
                Post a Job
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {freelancers.map((freelancer) => (
            <Card key={freelancer.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('freelancer-profile', { userId: freelancer.id })}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16">
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
                  <Button variant="default" className="flex-1" onClick={(e) => {
                    e.stopPropagation();
                    navigate('freelancer-profile', { userId: freelancer.id });
                  }}>
                    View Profile
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={(e) => {
                    e.stopPropagation();
                    navigate('messages');
                  }}>
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPaid: 0,
    pendingInvoices: 0,
    completedPayments: 0,
  });

  useEffect(() => {
    if (user?.id) {
      fetchPaymentData();
    }
  }, [user]);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      // Fetch invoices for this client
      const invoicesData = await invoicesApi.list({ clientId: user?.id });
      setInvoices(invoicesData || []);

      // Fetch payments - get payments for each invoice
      const allPayments: any[] = [];
      for (const invoice of invoicesData || []) {
        try {
          const invoicePayments = await paymentsApi.getByInvoice(invoice.id);
          if (invoicePayments) {
            allPayments.push(...invoicePayments);
          }
        } catch (err) {
          // Ignore errors for individual invoice payments
        }
      }
      setPayments(allPayments);

      // Calculate stats
      const totalPaid = allPayments.filter((p: any) => p.status === 'COMPLETED')
        .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      const pendingInvoices = invoicesData?.filter((i: any) => i.status === 'PENDING' || i.status === 'UNPAID').length || 0;
      const completedPayments = allPayments.filter((p: any) => p.status === 'COMPLETED').length;

      setStats({
        totalPaid,
        pendingInvoices,
        completedPayments,
      });
    } catch (err) {
      console.error('Error fetching payment data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Payments</h1>
          <p className="text-muted-foreground">Transaction history and invoices</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading payment data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Payments</h1>
        <p className="text-muted-foreground">Transaction history and invoices</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {stats.totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedPayments} completed payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Payments</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.completedPayments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successful transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No invoices yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.slice(0, 5).map((invoice: any) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer" onClick={() => navigate('project-detail', { projectId: invoice.projectId })}>
                  <div className="flex-1">
                    <h4 className="font-medium">Invoice #{invoice.invoiceNumber || invoice.id}</h4>
                    <p className="text-sm text-muted-foreground">
                      {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'Recently'}
                      {invoice.dueDate && ` • Due: ${new Date(invoice.dueDate).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Rs. {invoice.totalAmount?.toLocaleString() || '0'}</p>
                    <Badge variant={invoice.status === 'PAID' ? 'default' : 'secondary'}>
                      {invoice.status || 'PENDING'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No payments yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.slice(0, 5).map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-medium">Payment #{payment.id}</h4>
                    <p className="text-sm text-muted-foreground">
                      {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'Recently'}
                      {payment.method && ` • ${payment.method}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Rs. {payment.amount?.toLocaleString() || '0'}</p>
                    <Badge variant={payment.status === 'COMPLETED' ? 'default' : payment.status === 'FAILED' ? 'destructive' : 'secondary'}>
                      {payment.status || 'PENDING'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}