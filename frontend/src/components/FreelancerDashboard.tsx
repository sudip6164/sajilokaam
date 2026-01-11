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
import { bidsApi, projectsApi, invoicesApi } from '@/lib/api';
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
  ArrowUpRight,
  Plus
} from 'lucide-react';

const sidebarItems = [
  { title: "Dashboard", icon: Home, id: "overview" },
  { title: "Active Projects", icon: Briefcase, id: "projects" },
  { title: "Proposals", icon: FileText, id: "proposals" },
  { title: "Earnings", icon: DollarSign, id: "earnings" },
];

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
          <main className="flex-1 overflow-y-auto ml-64 pt-16 pr-6 pb-6">
            {renderContent()}
          </main>
        </SidebarProvider>
      </div>
    </div>
  );
}

function OverviewContent({ navigate }: { navigate: any }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    activeProjects: 0,
    completedJobs: 0,
    activeBids: 0,
    profileViews: 0,
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch projects
      const projectsData = await projectsApi.list({ freelancerId: user?.id });
      setProjects(projectsData || []);

      // Fetch bids
      const bidsData = await bidsApi.list({ freelancerId: user?.id });
      setBids(bidsData || []);

      // Calculate earnings from completed projects
      const completedProjects = projectsData?.filter((p: any) => p.status === 'COMPLETED') || [];
      const totalEarnings = completedProjects.reduce((sum: number, p: any) => sum + (p.budget || 0), 0);

      // Calculate monthly earnings (projects completed this month)
      const now = new Date();
      const thisMonth = projectsData?.filter((p: any) => {
        if (!p.completedAt) return false;
        const completedDate = new Date(p.completedAt);
        return completedDate.getMonth() === now.getMonth() && 
               completedDate.getFullYear() === now.getFullYear();
      }) || [];
      const monthlyEarnings = thisMonth.reduce((sum: number, p: any) => sum + (p.budget || 0), 0);

      const activeProjects = projectsData?.filter((p: any) => 
        p.status === 'IN_PROGRESS' || p.status === 'ACTIVE'
      ).length || 0;

      const activeBids = bidsData?.filter((b: any) => 
        b.status === 'PENDING' || b.status === 'UNDER_REVIEW'
      ).length || 0;

      setStats({
        totalEarnings,
        monthlyEarnings,
        activeProjects,
        completedJobs: completedProjects.length,
        activeBids,
        profileViews: 0, // TODO: Implement profile views tracking
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your freelancing overview.</p>
        </div>
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
            <div className="text-2xl font-bold text-primary">Rs. {stats.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">+Rs. {stats.monthlyEarnings.toLocaleString()}</span> this month
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
              {stats.completedJobs} completed total
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Proposals</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBids}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting response
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
            <div className="text-2xl font-bold">{stats.profileViews}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 30 days
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
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No active projects yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.slice(0, 3).map((project: any) => (
                <div key={project.id} className="flex items-start space-x-4 p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer" onClick={() => navigate('project-detail', { projectId: project.id })}>
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{project.clientName?.[0] || 'C'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold truncate">{project.title || 'Untitled Project'}</h4>
                      <Badge variant={project.status === "IN_PROGRESS" || project.status === "ACTIVE" ? "default" : "secondary"}>
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{project.clientName || 'Client'}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="font-medium">Rs. {(project.budget || 0).toLocaleString()}</span>
                      </div>
                      {project.deadline && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{new Date(project.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
          {bids.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No proposals submitted yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bids.slice(0, 5).map((bid: any) => (
                <div key={bid.id} className="flex items-center justify-between p-4 rounded-lg border hover:border-primary transition-colors">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate mb-1">{bid.jobTitle || 'Job'}</h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{bid.createdAt ? new Date(bid.createdAt).toLocaleDateString() : 'Recently'}</span>
                      <span>•</span>
                      <span>Rs. {(bid.amount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <Badge variant={
                    bid.status === "PENDING" || bid.status === "UNDER_REVIEW" ? "secondary" :
                    bid.status === "REJECTED" ? "destructive" :
                    bid.status === "ACCEPTED" ? "default" :
                    "secondary"
                  }>
                    {bid.status}
                  </Badge>
                </div>
              ))}
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
      const projectsData = await projectsApi.list({ freelancerId: user?.id });
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
          <p className="text-muted-foreground">Manage your ongoing projects</p>
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
        <p className="text-muted-foreground">Manage your ongoing projects</p>
      </div>
      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">Start bidding on jobs to get your first project</p>
              <Button onClick={() => navigate('find-work')}>
                <Plus className="h-4 w-4 mr-2" />
                Browse Jobs
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {projects.map((project: any) => {
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
                        <p className="text-sm text-muted-foreground">Project #{project.id}</p>
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

function ProposalsContent({ navigate }: { navigate: any }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchBids();
    }
  }, [user]);

  const fetchBids = async () => {
    try {
      setLoading(true);
      const bidsData = await bidsApi.list({ freelancerId: user?.id });
      setBids(bidsData || []);
    } catch (err) {
      console.error('Error fetching bids:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Proposals</h1>
          <p className="text-muted-foreground">Track your submitted proposals</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading proposals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Proposals</h1>
          <p className="text-muted-foreground">Track your submitted proposals</p>
        </div>
        <Button onClick={() => navigate('find-work')}>
          <Plus className="h-4 w-4 mr-2" />
          Submit New Proposal
        </Button>
      </div>
      {bids.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">No proposals yet</h3>
              <p className="text-muted-foreground mb-4">Start applying to jobs to submit your first proposal</p>
              <Button onClick={() => navigate('find-work')}>
                <Plus className="h-4 w-4 mr-2" />
                Browse Jobs
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bids.map((bid: any) => {
            const submittedAt = bid.createdAt ? new Date(bid.createdAt).toLocaleDateString() : 'Recently';
            return (
              <Card key={bid.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{bid.jobTitle || `Job #${bid.jobId}`}</h3>
                        <span className="text-xs text-muted-foreground">• Proposal #{bid.id}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Submitted {submittedAt}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Rs. {bid.amount?.toLocaleString() || '0'}
                        </span>
                      </div>
                      {(bid.proposal || bid.message) && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{bid.proposal || bid.message}</p>
                      )}
                    </div>
                    <Badge variant={
                      bid.status === "PENDING" || bid.status === "UNDER_REVIEW" ? "default" :
                      bid.status === "ACCEPTED" ? "secondary" :
                      "destructive"
                    }>
                      {bid.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="default" 
                      className="flex-1" 
                      onClick={() => navigate('view-proposal', { bidId: bid.id })}
                    >
                      View Proposal
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => navigate('job-detail', { jobId: bid.jobId })}
                    >
                      View Job
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState({
    total: 0,
    thisMonth: 0,
    pending: 0,
    completed: 0,
  });
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchEarnings();
    }
  }, [user]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const invoicesData = await invoicesApi.list({ freelancerId: user?.id });
      setInvoices(invoicesData || []);

      const paidInvoices = invoicesData?.filter((i: any) => i.status === 'PAID') || [];
      const pendingInvoices = invoicesData?.filter((i: any) => i.status === 'PENDING' || i.status === 'UNPAID') || [];
      
      const totalEarnings = paidInvoices.reduce((sum: number, i: any) => sum + (i.totalAmount || 0), 0);
      const pendingAmount = pendingInvoices.reduce((sum: number, i: any) => sum + (i.totalAmount || 0), 0);

      const now = new Date();
      const thisMonthInvoices = paidInvoices.filter((i: any) => {
        if (!i.paidAt) return false;
        const paidDate = new Date(i.paidAt);
        return paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear();
      });
      const monthlyEarnings = thisMonthInvoices.reduce((sum: number, i: any) => sum + (i.totalAmount || 0), 0);

      setEarnings({
        total: totalEarnings,
        thisMonth: monthlyEarnings,
        pending: pendingAmount,
        completed: paidInvoices.length,
      });
    } catch (err) {
      console.error('Error fetching earnings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Earnings</h1>
          <p className="text-muted-foreground">Track your income and payments</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading earnings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Earnings</h1>
        <p className="text-muted-foreground">Track your income and payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Rs. {earnings.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Rs. {earnings.thisMonth.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Current month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">Rs. {earnings.pending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Star className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnings.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">Paid invoices</p>
          </CardContent>
        </Card>
      </div>

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
              {invoices.slice(0, 10).map((invoice: any) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 rounded-lg border">
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