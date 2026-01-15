import { useState, useEffect } from 'react';
import {
  Calendar, Clock, DollarSign, FileText, MessageSquare, Upload,
  CheckCircle, Circle, AlertCircle, Download, Eye, Trash2,
  Play, Pause, Plus, Send, Sparkles, List, LayoutGrid, Edit, X, GripVertical
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { milestonesApi, timeTrackingApi, filesApi, projectsApi, tasksApi, invoicesApi, sprintsApi, timeLogsApi } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from '../Router';
import { DocumentUploadModal } from './DocumentUploadModal';
import { TaskModal } from './TaskModal';
import { MilestoneModal } from './MilestoneModal';
import { TaskDetailModal } from './TaskDetailModal';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Milestone {
  id: number;
  title: string;
  description?: string;
  amount?: number;
  dueDate?: string;
  status?: string;
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
    client?: string | { id: number; fullName: string; email: string };
    freelancer?: string | { id: number; fullName: string; email: string };
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

interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: string;
  assigneeId?: number;
  estimatedHours?: number;
}

export function ProjectWorkspace({ project }: ProjectWorkspaceProps) {
  const { navigate } = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'ml-documents' | 'milestones' | 'sprints' | 'files' | 'time' | 'activity'>('overview');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [taskView, setTaskView] = useState<'list' | 'kanban'>('list');
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprints, setSprints] = useState<Array<{id: number; name: string; startDate?: string; endDate?: string; status: string}>>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activities, setActivities] = useState<Array<{action: string; user: string; time: string; type: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [pendingInvoiceId, setPendingInvoiceId] = useState<number | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (project.id) {
      fetchProjectData();
    }
  }, [project.id]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  useEffect(() => {
    // If project is pending payment, fetch invoice for "Pay Now" CTA and block management UI.
    const run = async () => {
      try {
        if (project.status !== 'PENDING_PAYMENT') {
          setPendingInvoiceId(null);
          return;
        }
        const invoices = await invoicesApi.list({ projectId: project.id, status: 'PENDING' });
        if (invoices && invoices.length > 0) {
          setPendingInvoiceId(invoices[0].id);
        } else {
          setPendingInvoiceId(null);
        }
      } catch {
        setPendingInvoiceId(null);
      }
    };
    run();
  }, [project.id, project.status]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [milestonesData, filesData, tasksData, timeLogsData, sprintsData] = await Promise.all([
        milestonesApi.list(project.id).catch(() => []),
        filesApi.list(project.id).catch(() => []),
        projectsApi.getTasks(project.id).catch(() => []),
        timeLogsApi.list({ projectId: project.id }).catch(() => []),
        sprintsApi.list(project.id).catch(() => []),
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

      setTasks(tasksData || []);

      // Transform time logs to time entries
      setTimeEntries(timeLogsData.map((log: any) => ({
        id: log.id,
        date: log.createdAt ? new Date(log.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
        hours: Math.round((log.minutes || 0) / 60 * 10) / 10, // Convert minutes to hours, round to 1 decimal
        description: log.description || `Time logged on task ${log.taskId || ''}`,
        status: 'approved' as const, // Default to approved, can be updated later
      })));

      // Generate activity feed from project data
      const activityList: Array<{action: string; user: string; time: string; type: string}> = [];
      
      // Add milestone activities
      milestonesData.forEach((m: any) => {
        if (m.createdAt) {
          activityList.push({
            action: `Milestone created: ${m.title}`,
            user: 'System',
            time: new Date(m.createdAt).toLocaleString(),
            type: 'info'
          });
        }
      });

      // Add file activities
      filesData.forEach((f: any) => {
        if (f.createdAt) {
          activityList.push({
            action: `File uploaded: ${f.fileName || 'Unknown'}`,
            user: f.uploadedBy?.fullName || 'Unknown',
            time: new Date(f.createdAt).toLocaleString(),
            type: 'info'
          });
        }
      });

      // Add task activities
      tasksData.forEach((t: any) => {
        if (t.createdAt) {
          activityList.push({
            action: `Task created: ${t.title}`,
            user: 'System',
            time: new Date(t.createdAt).toLocaleString(),
            type: 'info'
          });
        }
      });

      // Add time log activities
      timeLogsData.forEach((log: any) => {
        if (log.createdAt) {
          activityList.push({
            action: `Time entry logged: ${Math.round((log.minutes || 0) / 60 * 10) / 10}h`,
            user: 'Freelancer',
            time: new Date(log.createdAt).toLocaleString(),
            type: 'info'
          });
        }
      });

      // Sort by time (newest first) and limit to 20
      activityList.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setActivities(activityList.slice(0, 20));

      // Set sprints
      setSprints(sprintsData);
    } catch (error) {
      console.error('Error fetching project data:', error);
      toast.error('Failed to load some project data');
    } finally {
      setLoading(false);
    }
  };

  // Payment gating: no project workspace until payment is completed
  if (project.status === 'PENDING_PAYMENT') {
    return (
      <div className="space-y-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{project.title || 'Untitled Project'}</h1>
              <p className="text-sm text-muted-foreground">
                This project is pending payment. Complete payment to unlock tasks, files, milestones and ML document features.
              </p>
            </div>
            <Badge className="bg-yellow-500">Pending Payment</Badge>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button
              className="bg-primary"
              onClick={() => {
                if (!pendingInvoiceId) {
                  toast.error('Invoice not found for this project yet.');
                  return;
                }
                navigate('payment', {
                  invoiceId: pendingInvoiceId,
                  projectId: project.id,
                  amount: project.budget || 0,
                  jobTitle: project.title || 'Project Payment',
                });
              }}
            >
              Pay Now
            </Button>
            <Button variant="outline" onClick={() => navigate('client-dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleTaskStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await projectsApi.updateTaskStatus(project.id, taskId, newStatus);
      // Update local state immediately for better UX
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      toast.success('Task status updated');
      // Refresh to ensure consistency
      await fetchProjectData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update task status');
      // Revert on error
      await fetchProjectData();
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    console.log('Drag start', event);
    setActiveId(Number(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('Drag end', event);
    setActiveId(null);

    if (!over) return;

    const taskId = Number(active.id);
    let newStatus: string | null = null;

    // Check if dropped on a column (status string)
    const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];
    if (typeof over.id === 'string' && validStatuses.includes(over.id)) {
      newStatus = over.id;
    } else {
      // If dropped on a task card, find its status
      const droppedTaskId = Number(over.id);
      const droppedTask = tasks.find(t => t.id === droppedTaskId);
      if (droppedTask) {
        newStatus = droppedTask.status;
      } else {
        return;
      }
    }

    // Find the task being dragged
    const task = tasks.find(t => t.id === taskId);
    if (!task || !newStatus) return;

    // Don't update if status hasn't changed
    if (task.status === newStatus) return;

    // Update task status
    await handleTaskStatusChange(taskId, newStatus);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Optional: Add visual feedback during drag
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    // Debugging logs
    console.log(`Attempting to delete task ${taskId} from project ${project?.id}`);

    if (!project?.id) {
      toast.error('Project ID is missing');
      return;
    }

    try {
      await projectsApi.deleteTask(project.id, taskId);
      await fetchProjectData();
      toast.success('Task deleted');
    } catch (error: any) {
      console.error('Task deletion failed:', error);
      toast.error(error.response?.data?.error || 'Failed to delete task');
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(t => t.status === status);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{project.title || 'Untitled Project'}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Client: {typeof project.client === 'object' ? project.client?.fullName : project.client || 'N/A'}</span>
              <span>•</span>
              <span>Freelancer: {typeof project.freelancer === 'object' ? project.freelancer?.fullName : project.freelancer || 'N/A'}</span>
            </div>
          </div>
          <Button onClick={() => navigate('messages')} className="bg-gradient-to-r from-primary to-secondary">
            <Send className="h-4 w-4 mr-2" />
            Message
          </Button>
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
        <div className="flex gap-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: FileText },
            { id: 'tasks', label: 'Tasks', icon: CheckCircle },
            { id: 'ml-documents', label: 'ML Documents', icon: Sparkles },
            { id: 'milestones', label: 'Milestones', icon: CheckCircle },
            { id: 'files', label: 'Files', icon: Upload },
            { id: 'time', label: 'Time Tracking', icon: Clock },
            { id: 'activity', label: 'Activity', icon: MessageSquare },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
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
                  <p className="text-muted-foreground">Total Tasks</p>
                  <p className="font-semibold">{tasks.length}</p>
                </div>
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
                <div>
                  <p className="text-muted-foreground">Progress</p>
                  <p className="font-semibold">
                    {tasks.length > 0
                      ? `${Math.round((getTasksByStatus('DONE').length / tasks.length) * 100)}%`
                      : '0%'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold">Project Tasks</h3>
                <div className="flex gap-2">
                  <Button
                    variant={taskView === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTaskView('list')}
                  >
                    <List className="h-4 w-4 mr-2" />
                    List
                  </Button>
                  <Button
                    variant={taskView === 'kanban' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTaskView('kanban')}
                  >
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Kanban
                  </Button>
                </div>
              </div>
              <Button size="sm" onClick={() => { setEditingTask(null); setShowTaskModal(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                  <p className="text-sm text-muted-foreground">Loading tasks...</p>
                </div>
              </div>
            ) : taskView === 'list' ? (
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <h3 className="font-semibold mb-2">No tasks yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">Create your first task or upload a document to extract tasks using AI</p>
                    <Button size="sm" onClick={() => { setEditingTask(null); setShowTaskModal(true); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Task
                    </Button>
                  </div>
                ) : (
                  tasks.map(task => (
                    <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                      setSelectedTask(task);
                      setShowTaskDetailModal(true);
                    }}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold">{task.title}</h4>
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority || 'MEDIUM'}
                              </Badge>
                              <Badge variant={task.status === 'DONE' ? 'default' : 'outline'}>
                                {task.status}
                              </Badge>
                            </div>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {task.dueDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                              {task.estimatedHours && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {task.estimatedHours}h
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={task.status}
                              onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                              className="text-sm border rounded px-2 py-1"
                            >
                              <option value="TODO">TODO</option>
                              <option value="IN_PROGRESS">IN_PROGRESS</option>
                              <option value="DONE">DONE</option>
                            </select>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
              >
                <div className="grid grid-cols-3 gap-4">
                  {['TODO', 'IN_PROGRESS', 'DONE'].map(status => {
                    const statusTasks = getTasksByStatus(status);
                    return (
                      <DroppableColumn
                        key={status}
                        id={status}
                        title={status.replace('_', ' ')}
                        taskCount={statusTasks.length}
                        tasks={statusTasks}
                        onDelete={handleDeleteTask}
                        onTaskClick={(task) => {
                          setSelectedTask(task);
                          setShowTaskDetailModal(true);
                        }}
                        getPriorityColor={getPriorityColor}
                        activeId={activeId}
                      />
                    );
                  })}
                </div>
                <DragOverlay>
                  {activeId ? (() => {
                    const activeTask = tasks.find(t => t.id === activeId);
                    if (!activeTask) return null;
                    return (
                      <Card className="opacity-90 rotate-3 shadow-lg w-64">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <h5 className="font-medium text-sm">{activeTask.title}</h5>
                          </div>
                          {activeTask.description && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2 ml-6">
                              {activeTask.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 ml-6">
                            <Badge className={`${getPriorityColor(activeTask.priority)} text-xs`}>
                              {activeTask.priority || 'MEDIUM'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })() : null}
                </DragOverlay>
              </DndContext>
            )}
          </div>
        )}

        {/* ML Documents Tab */}
        {activeTab === 'ml-documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  ML Document Processing
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload documents and let AI extract tasks automatically
                </p>
              </div>
              <Button size="sm" onClick={() => setShowDocumentModal(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-purple-100 border border-primary/20 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Sparkles className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-2">AI-Powered Task Extraction</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload requirement documents, project specs, or task lists. Our ML service uses Natural Language Processing
                    (spaCy) to automatically extract tasks, priorities, due dates, and estimated hours from your documents.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                    <li>• Supports PDF, DOC, DOCX, and TXT files</li>
                    <li>• Extracts tasks from numbered lists, bullet points, and sentences</li>
                    <li>• Automatically detects priorities and due dates</li>
                    <li>• Creates tasks with confidence scores</li>
                  </ul>
                  <Button onClick={() => setShowDocumentModal(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document Now
                  </Button>
                </div>
              </div>
            </div>

            {tasks.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Tasks Created from Documents ({tasks.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tasks.slice(0, 6).map(task => (
                    <Card key={task.id}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{task.title}</h5>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={getPriorityColor(task.priority)} variant="outline">
                                {task.priority || 'MEDIUM'}
                              </Badge>
                              <Badge variant={task.status === 'DONE' ? 'default' : 'outline'}>
                                {task.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {tasks.length > 6 && (
                  <Button variant="outline" className="w-full mt-3" onClick={() => setActiveTab('tasks')}>
                    View All Tasks ({tasks.length})
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Project Milestones</h3>
              <Button size="sm" onClick={() => {
                setEditingMilestone(null);
                setShowMilestoneModal(true);
              }}>
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
                <Button size="sm" onClick={() => {
                  setEditingMilestone(null);
                  setShowMilestoneModal(true);
                }}>
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
                          {milestone.description && (
                            <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {milestone.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Due: {new Date(milestone.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditingMilestone(milestone);
                            setShowMilestoneModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this milestone?')) {
                              try {
                                await milestonesApi.delete(project.id, milestone.id);
                                toast.success('Milestone deleted');
                                fetchProjectData();
                              } catch (error: any) {
                                toast.error(error.response?.data?.error || 'Failed to delete milestone');
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sprints Tab */}
        {activeTab === 'sprints' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Project Sprints</h3>
              <Button size="sm" onClick={() => toast.info('Sprint creation coming soon')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Sprint
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                  <p className="text-sm text-muted-foreground">Loading sprints...</p>
                </div>
              </div>
            ) : sprints.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="font-semibold mb-2">No sprints yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Create sprints to organize your work</p>
                <Button size="sm" onClick={() => toast.info('Sprint creation coming soon')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Sprint
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {sprints.map(sprint => (
                  <div key={sprint.id} className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{sprint.name}</h4>
                          <Badge variant="outline">{sprint.status}</Badge>
                        </div>
                        {sprint.startDate && sprint.endDate && (
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => toast.info('Sprint details coming soon')}>
                          View
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toast.info('Sprint edit coming soon')}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
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
              <div>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        await filesApi.upload(project.id, file);
                        toast.success('File uploaded successfully');
                        fetchProjectData();
                      } catch (error: any) {
                        toast.error(error.response?.data?.error || 'Failed to upload file');
                      }
                      e.target.value = '';
                    }
                  }}
                />
                <Button size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </div>
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
                <div>
                  <input
                    type="file"
                    id="file-upload-empty"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          await filesApi.upload(project.id, file);
                          toast.success('File uploaded successfully');
                          fetchProjectData();
                        } catch (error: any) {
                          toast.error(error.response?.data?.error || 'Failed to upload file');
                        }
                        e.target.value = '';
                      }
                    }}
                  />
                  <Button size="sm" onClick={() => document.getElementById('file-upload-empty')?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload First File
                  </Button>
                </div>
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
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={async () => {
                          try {
                            const blob = await filesApi.download(project.id, file.id);
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = file.name;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                          } catch (error: any) {
                            toast.error('Failed to download file');
                          }
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={async () => {
                          if (confirm('Are you sure you want to delete this file?')) {
                            try {
                              await filesApi.delete(project.id, file.id);
                              toast.success('File deleted');
                              fetchProjectData();
                            } catch (error: any) {
                              toast.error(error.response?.data?.error || 'Failed to delete file');
                            }
                          }
                        }}
                      >
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
                  <div className="flex flex-col gap-2">
                    <select
                      className="text-sm border rounded px-2 py-1 mb-2"
                      onChange={(e) => {
                        // Store selected task for timer
                        const taskId = e.target.value;
                        if (taskId) {
                          // Start timer for selected task
                          setIsTimerRunning(true);
                        }
                      }}
                    >
                      <option value="">Select Task</option>
                      {tasks.map(task => (
                        <option key={task.id} value={task.id}>{task.title}</option>
                      ))}
                    </select>
                    <Button
                      onClick={async () => {
                        if (isTimerRunning) {
                          // Stop timer and log time
                          setIsTimerRunning(false);
                          const selectedTaskId = (document.querySelector('select') as HTMLSelectElement)?.value;
                          if (selectedTaskId && currentTime > 0) {
                            try {
                              const minutes = Math.floor(currentTime / 60);
                              await timeLogsApi.create(project.id, parseInt(selectedTaskId), { minutes });
                              toast.success('Time logged successfully');
                              setCurrentTime(0);
                              fetchProjectData();
                            } catch (error: any) {
                              toast.error('Failed to log time');
                            }
                          }
                        } else {
                          setIsTimerRunning(true);
                        }
                      }}
                      className={isTimerRunning ? 'bg-destructive' : ''}
                    >
                      {isTimerRunning ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Stop & Log
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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                  <p className="text-sm text-muted-foreground">Loading activity...</p>
                </div>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="font-semibold mb-2">No activity yet</h3>
                <p className="text-sm text-muted-foreground">Activity will appear here as you work on the project</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'success' ? 'bg-success' : 'bg-primary'
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
            )}
          </div>
        )}
      </div>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={showDocumentModal}
        onClose={() => {
          setShowDocumentModal(false);
          fetchProjectData();
        }}
        projectId={project.id}
        onUploadSuccess={() => {
          fetchProjectData();
          setActiveTab('tasks');
        }}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        projectId={project.id}
        task={editingTask}
        onSuccess={() => {
          fetchProjectData();
        }}
      />

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={showTaskDetailModal}
          onClose={() => {
            setShowTaskDetailModal(false);
            setSelectedTask(null);
          }}
          projectId={project.id}
          task={selectedTask}
          allTasks={tasks}
          onSuccess={() => {
            fetchProjectData();
          }}
        />
      )}
    </div>
  );
}

// Droppable Column Component
function DroppableColumn({
  id,
  title,
  taskCount,
  tasks,
  onDelete,
  onTaskClick,
  getPriorityColor,
  activeId,
}: {
  id: string;
  title: string;
  taskCount: number;
  tasks: Task[];
  onDelete: (id: number) => void;
  onTaskClick: (task: Task) => void;
  getPriorityColor: (priority?: string) => string;
  activeId: number | null;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-2 bg-muted rounded">
        <h4 className="font-semibold text-sm">{title}</h4>
        <Badge variant="outline">{taskCount}</Badge>
      </div>
      <div
        ref={setNodeRef}
        className={`space-y-2 min-h-[200px] p-2 rounded-lg transition-colors ${isOver ? 'bg-primary/10 border-2 border-primary border-dashed' : 'bg-muted/30'
          }`}
      >
        <SortableContext
          id={id}
          items={tasks.map(t => String(t.id))}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map(task => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              onDelete={onDelete}
              onTaskClick={onTaskClick}
              getPriorityColor={getPriorityColor}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded">
            {isOver ? 'Drop here' : 'Drop tasks here'}
          </div>
        )}
      </div>
    </div>
  );
}

// Draggable Task Card Component
function DraggableTaskCard({
  task,
  onDelete,
  onTaskClick,
  getPriorityColor
}: {
  task: Task;
  onDelete: (id: number) => void;
  onTaskClick: (task: Task) => void;
  getPriorityColor: (priority?: string) => string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(task.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card 
        className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${isDragging ? 'ring-2 ring-primary' : ''}`}
        onClick={(e) => {
          // Don't open modal if clicking drag handle or delete button
          if ((e.target as HTMLElement).closest('.cursor-grab') || (e.target as HTMLElement).closest('button')) {
            return;
          }
          // This will be handled by parent component
        }}
      >
        <CardContent className="p-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start gap-2 flex-1">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing mt-1 touch-none"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 cursor-pointer" onClick={(e) => {
                e.stopPropagation();
                // This will be handled by parent - we need to pass onTaskClick
              }}>
                <h5 className="font-medium text-sm">{task.title}</h5>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          {task.description && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2 ml-6">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 ml-6">
            <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
              {task.priority || 'MEDIUM'}
            </Badge>
            {task.dueDate && (
              <span className="text-xs text-muted-foreground">
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
