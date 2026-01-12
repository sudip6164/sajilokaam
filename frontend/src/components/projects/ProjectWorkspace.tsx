import { useState, useEffect } from 'react';
import { 
  Calendar, Clock, DollarSign, FileText, MessageSquare, Upload, 
  CheckCircle, Circle, AlertCircle, Download, Eye, Trash2,
  Play, Pause, Plus
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { milestonesApi, timeTrackingApi, filesApi } from '@/lib/api';
import { toast } from 'sonner';

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
    title?: string;
    client?: string;
    freelancer?: string;
    clientId?: number;
    freelancerId?: number;
    status?: string;
    budget?: number;
    budgetType?: 'fixed' | 'hourly';
    startDate?: string;
    endDate?: string;
    deadline?: string;
    description?: string;
  };
}

export function ProjectWorkspace({ project }: ProjectWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'files' | 'time' | 'activity'>('overview');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (project.id) {
      fetchProjectData();
    }
  }, [project.id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [milestonesData, filesData] = await Promise.all([
        milestonesApi.list(project.id).catch(() => []),
        filesApi.list(project.id).catch(() => []),
      ]);

      // Transform API data to match component interface
      setMilestones(milestonesData.map((m: any) => ({
        id: m.id,
        title: m.title || 'Untitled Milestone',
        description: m.description || '',
        amount: m.amount || 0,
        dueDate: m.dueDate || '',
        status: m.status?.toLowerCase() || 'pending',
        submittedDate: m.submittedDate,
        approvedDate: m.approvedDate,
      })));

      setFiles(filesData.map((f: any) => ({
        id: f.id,
        name: f.fileName || 'Unknown File',
        size: f.fileSize || 'N/A',
        uploadedBy: f.uploadedBy || 'Unknown',
        uploadedAt: f.uploadedAt ? new Date(f.uploadedAt).toLocaleDateString() : 'Recently',
        type: f.fileType || 'document',
      })));

      // Note: Time tracking might not be implemented yet in backend
      setTimeEntries([]);
    } catch (error) {
      console.error('Error fetching project data:', error);
      toast.error('Failed to load some project data');
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl font-bold mb-2">{project.title || 'Untitled Project'}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Client ID: {project.clientId || project.client || 'N/A'}</span>
              <span>•</span>
              <span>Freelancer ID: {project.freelancerId || project.freelancer || 'N/A'}</span>
            </div>
          </div>
          <Badge className={
            project.status === 'active' || project.status === 'ACTIVE' || project.status === 'IN_PROGRESS' ? 'bg-success' :
            project.status === 'completed' || project.status === 'COMPLETED' ? 'bg-primary' : 'bg-yellow-500'
          }>
            {project.status ? (project.status.charAt(0).toUpperCase() + project.status.slice(1).toLowerCase().replace('_', ' ')) : 'Unknown'}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-background">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Total Budget</span>
            </div>
            <p className="text-2xl font-bold">Rs. {project.budget?.toLocaleString() || '0'}</p>
          </div>
          <div className="p-4 rounded-lg bg-background">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Paid</span>
            </div>
            <p className="text-2xl font-bold text-success">Rs. {totalPaid.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-background">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-500">Rs. {totalPending.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-background">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Due Date</span>
            </div>
            <p className="text-lg font-bold">{project.deadline || project.endDate || 'Ongoing'}</p>
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
              {project.description ? (
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {project.description}
                </p>
              ) : (
                <p className="text-muted-foreground italic">
                  No description provided for this project.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg border">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Project Status
                </h3>
                <p className="text-sm text-muted-foreground">
                  This project is currently {project.status?.toLowerCase().replace('_', ' ') || 'active'}
                </p>
              </div>

              <div className="p-4 rounded-lg border">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Timeline
                </h3>
                <p className="text-sm text-muted-foreground">
                  {project.deadline ? `Due: ${new Date(project.deadline).toLocaleDateString()}` : 'No deadline set'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border">
              <h3 className="font-semibold mb-2">Project Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Milestones</p>
                  <p className="font-semibold">{milestones.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Project Files</p>
                  <p className="font-semibold">{files.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Budget</p>
                  <p className="font-semibold">Rs. {project.budget?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-semibold capitalize">{project.status?.toLowerCase().replace('_', ' ') || 'Active'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Project Milestones</h3>
              <Button size="sm" onClick={() => toast.info('Milestone management coming soon')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                  <p className="text-sm text-muted-foreground">Loading milestones...</p>
                </div>
              </div>
            ) : milestones.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="font-semibold mb-2">No milestones yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Start by adding your first project milestone</p>
                <Button size="sm" onClick={() => toast.info('Milestone management coming soon')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Milestone
                </Button>
              </div>
            ) : (
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
                            Rs. {milestone.amount.toLocaleString()}
                          </span>
                          {milestone.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due: {new Date(milestone.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {milestone.status === 'in-progress' && (
                      <Button size="sm" onClick={() => toast.info('Feature coming soon')}>Submit for Review</Button>
                    )}
                    {milestone.status === 'approved' && (
                      <Button size="sm" variant="outline" onClick={() => toast.info('Feature coming soon')}>Request Payment</Button>
                    )}
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Project Files</h3>
              <Button size="sm" onClick={() => toast.info('File upload coming soon')}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                  <p className="text-sm text-muted-foreground">Loading files...</p>
                </div>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="font-semibold mb-2">No files uploaded yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Share project files with your team</p>
                <Button size="sm" onClick={() => toast.info('File upload coming soon')}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload First File
                </Button>
              </div>
            ) : (
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
                    <Button variant="ghost" size="icon" onClick={() => toast.info('Preview coming soon')}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => toast.info('Download coming soon')}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => toast.info('Delete coming soon')}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              </div>
            )}
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
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                    <p className="text-sm text-muted-foreground">Loading time entries...</p>
                  </div>
                </div>
              ) : timeEntries.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <h3 className="font-semibold mb-2">No time entries yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Start tracking your time to log hours on this project</p>
                  <Button size="sm" onClick={() => toast.info('Time tracking coming soon')}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Tracking
                  </Button>
                </div>
              ) : (
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
              )}
            </div>

            {/* Summary */}
            {timeEntries.length > 0 && (
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
            )}
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
