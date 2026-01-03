import { useState } from 'react';
import { 
  Calendar, Clock, DollarSign, FileText, MessageSquare, Upload, 
  CheckCircle, Circle, AlertCircle, Download, Eye, Trash2,
  Play, Pause, Plus
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface Milestone {
  id: number;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'submitted' | 'approved' | 'paid';
  submittedDate?: string;
  approvedDate?: string;
}

interface ProjectFile {
  id: number;
  name: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  type: 'document' | 'image' | 'archive';
}

interface TimeEntry {
  id: number;
  date: string;
  hours: number;
  description: string;
  status: 'pending' | 'approved';
}

interface ProjectWorkspaceProps {
  project: {
    id: number;
    title: string;
    client: string;
    freelancer: string;
    status: 'active' | 'completed' | 'paused';
    budget: number;
    budgetType: 'fixed' | 'hourly';
    startDate: string;
    endDate?: string;
  };
}

export function ProjectWorkspace({ project }: ProjectWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'files' | 'time' | 'activity'>('overview');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const [milestones] = useState<Milestone[]>([
    {
      id: 1,
      title: 'Initial Design & Wireframes',
      description: 'Create wireframes and initial design mockups for the main pages',
      amount: 1500,
      dueDate: '2024-02-15',
      status: 'approved',
      submittedDate: '2024-02-13',
      approvedDate: '2024-02-14',
    },
    {
      id: 2,
      title: 'Frontend Development',
      description: 'Implement the React frontend with all core features',
      amount: 3000,
      dueDate: '2024-03-01',
      status: 'in-progress',
    },
    {
      id: 3,
      title: 'Backend API Integration',
      description: 'Connect frontend to backend APIs and implement authentication',
      amount: 2500,
      dueDate: '2024-03-15',
      status: 'pending',
    },
    {
      id: 4,
      title: 'Testing & Deployment',
      description: 'Complete testing, bug fixes, and deploy to production',
      amount: 1500,
      dueDate: '2024-03-30',
      status: 'pending',
    },
  ]);

  const [files] = useState<ProjectFile[]>([
    {
      id: 1,
      name: 'Design-Mockups-v2.fig',
      size: '12.4 MB',
      uploadedBy: 'Sarah Johnson',
      uploadedAt: '2 hours ago',
      type: 'document',
    },
    {
      id: 2,
      name: 'Project-Requirements.pdf',
      size: '2.1 MB',
      uploadedBy: 'Client',
      uploadedAt: '1 day ago',
      type: 'document',
    },
    {
      id: 3,
      name: 'Logo-Assets.zip',
      size: '8.7 MB',
      uploadedBy: 'Client',
      uploadedAt: '3 days ago',
      type: 'archive',
    },
  ]);

  const [timeEntries] = useState<TimeEntry[]>([
    {
      id: 1,
      date: '2024-01-15',
      hours: 6.5,
      description: 'Working on frontend components and routing',
      status: 'approved',
    },
    {
      id: 2,
      date: '2024-01-16',
      hours: 8,
      description: 'Implementing authentication and user management',
      status: 'approved',
    },
    {
      id: 3,
      date: '2024-01-17',
      hours: 5,
      description: 'Bug fixes and code review',
      status: 'pending',
    },
  ]);

  const totalPaid = milestones.filter(m => m.status === 'paid').reduce((sum, m) => sum + m.amount, 0);
  const totalPending = milestones.filter(m => m.status === 'submitted').reduce((sum, m) => sum + m.amount, 0);
  const totalApproved = milestones.filter(m => m.status === 'approved').reduce((sum, m) => sum + m.amount, 0);

  const getMilestoneIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'paid':
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'submitted':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'in-progress':
        return <Circle className="h-5 w-5 text-primary fill-primary/20" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getMilestoneBadge = (status: Milestone['status']) => {
    const badges = {
      paid: <Badge className="bg-success">Paid</Badge>,
      approved: <Badge className="bg-success">Approved</Badge>,
      submitted: <Badge className="bg-yellow-500">Under Review</Badge>,
      'in-progress': <Badge className="bg-primary">In Progress</Badge>,
      pending: <Badge variant="outline">Pending</Badge>,
    };
    return badges[status];
  };

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{project.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Client: {project.client}</span>
              <span>•</span>
              <span>Freelancer: {project.freelancer}</span>
            </div>
          </div>
          <Badge className={
            project.status === 'active' ? 'bg-success' :
            project.status === 'completed' ? 'bg-primary' : 'bg-yellow-500'
          }>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-background">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Total Budget</span>
            </div>
            <p className="text-2xl font-bold">${project.budget.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-background">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Paid</span>
            </div>
            <p className="text-2xl font-bold text-success">${totalPaid.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-background">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-500">${totalPending.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-background">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Due Date</span>
            </div>
            <p className="text-lg font-bold">{project.endDate || 'Ongoing'}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-6">
          {[
            { id: 'overview', label: 'Overview', icon: FileText },
            { id: 'milestones', label: 'Milestones', icon: CheckCircle },
            { id: 'files', label: 'Files', icon: Upload },
            { id: 'time', label: 'Time Tracking', icon: Clock },
            { id: 'activity', label: 'Activity', icon: MessageSquare },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-card rounded-xl border border-border p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Project Description</h3>
              <p className="text-muted-foreground">
                Build a modern, responsive e-commerce platform with React and Node.js. The platform should include 
                product listings, shopping cart, checkout process, user authentication, and an admin dashboard for 
                managing products and orders.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Deliverables</h3>
              <ul className="space-y-2">
                {[
                  'Fully responsive React frontend',
                  'RESTful API with Node.js and Express',
                  'PostgreSQL database design and implementation',
                  'Payment gateway integration (Stripe)',
                  'Admin dashboard for product and order management',
                  'Comprehensive documentation',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Stripe', 'AWS', 'Docker'].map(tech => (
                  <Badge key={tech} variant="outline">{tech}</Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Project Milestones</h3>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </div>

            <div className="space-y-3">
              {milestones.map(milestone => (
                <div key={milestone.id} className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      {getMilestoneIcon(milestone.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{milestone.title}</h4>
                          {getMilestoneBadge(milestone.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${milestone.amount.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due: {new Date(milestone.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {milestone.status === 'in-progress' && (
                      <Button size="sm">Submit for Review</Button>
                    )}
                    {milestone.status === 'approved' && (
                      <Button size="sm" variant="outline">Request Payment</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Project Files</h3>
              <Button size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </div>

            <div className="space-y-2">
              {files.map(file => (
                <div key={file.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {file.size} • Uploaded by {file.uploadedBy} • {file.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Time Tracking Tab */}
        {activeTab === 'time' && (
          <div className="space-y-6">
            {/* Timer */}
            <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Time Tracker</h3>
                  <p className="text-sm text-muted-foreground">Track your working hours</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold mb-2">
                    {Math.floor(currentTime / 3600)}:{String(Math.floor((currentTime % 3600) / 60)).padStart(2, '0')}:{String(currentTime % 60).padStart(2, '0')}
                  </p>
                  <Button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={isTimerRunning ? 'bg-destructive' : ''}
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Time Entries */}
            <div>
              <h3 className="font-semibold mb-3">Time Entries</h3>
              <div className="space-y-2">
                {timeEntries.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium">{entry.hours}h</span>
                        <span className="text-sm text-muted-foreground">{entry.date}</span>
                        <Badge variant={entry.status === 'approved' ? 'default' : 'outline'}>
                          {entry.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-background text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Hours</p>
                <p className="text-2xl font-bold">{timeEntries.reduce((sum, e) => sum + e.hours, 0)}h</p>
              </div>
              <div className="p-4 rounded-lg bg-background text-center">
                <p className="text-sm text-muted-foreground mb-1">Approved</p>
                <p className="text-2xl font-bold text-success">
                  {timeEntries.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.hours, 0)}h
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background text-center">
                <p className="text-sm text-muted-foreground mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {timeEntries.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.hours, 0)}h
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <h3 className="font-semibold">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { action: 'Milestone approved', user: 'Client', time: '2 hours ago', type: 'success' },
                { action: 'File uploaded: Design-Mockups-v2.fig', user: 'Sarah Johnson', time: '5 hours ago', type: 'info' },
                { action: 'Time entry submitted', user: 'Sarah Johnson', time: '1 day ago', type: 'info' },
                { action: 'Message sent', user: 'Client', time: '2 days ago', type: 'info' },
                { action: 'Project started', user: 'System', time: '1 week ago', type: 'success' },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'success' ? 'bg-success' : 'bg-primary'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
