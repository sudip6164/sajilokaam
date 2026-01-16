import { useState, useEffect } from 'react';
import { X, Calendar, Target, CheckCircle2, Circle, Clock, Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { sprintsApi, tasksApi } from '@/lib/api';
import { toast } from 'sonner';
import { SprintModal } from './SprintModal';

interface Sprint {
  id: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  goal?: string;
  status: string;
  projectId: number;
}

interface Task {
  id: number;
  title: string;
  status: string;
}

interface SprintDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  sprint: Sprint;
  onSuccess: () => void;
}

export function SprintDetailModal({ isOpen, onClose, projectId, sprint, onSuccess }: SprintDetailModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);

  useEffect(() => {
    if (isOpen && sprint.id) {
      fetchSprintDetails();
    }
  }, [isOpen, sprint.id]);

  const fetchSprintDetails = async () => {
    try {
      setLoading(true);
      const tasksData = await sprintsApi.getTasks(projectId, sprint.id);
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error fetching sprint details:', error);
      toast.error('Failed to load sprint details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditingSprint(sprint);
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete sprint "${sprint.name}"? This cannot be undone.`)) return;
    try {
      await sprintsApi.delete(projectId, sprint.id);
      toast.success('Sprint deleted');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Failed to delete sprint');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'COMPLETED': return 'bg-blue-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const completedTasks = tasks.filter(t => t.status === 'DONE').length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>{sprint.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusColor(sprint.status)}>
                      {sprint.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-6">
            {sprint.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{sprint.description}</p>
              </div>
            )}

            {sprint.goal && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Sprint Goal
                </h3>
                <p className="text-sm text-muted-foreground">{sprint.goal}</p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Tasks</h3>
                <span className="text-sm text-muted-foreground">
                  {completedTasks} of {tasks.length} completed
                </span>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Circle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No tasks assigned to this sprint</p>
                </div>
              ) : (
                <>
                  <Progress value={progress} className="mb-4" />
                  <div className="space-y-2">
                    {tasks.map(task => (
                      <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                        {task.status === 'DONE' ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className={`flex-1 ${task.status === 'DONE' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </span>
                        <Badge variant="outline">{task.status}</Badge>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {showEditModal && editingSprint && (
        <SprintModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingSprint(null);
          }}
          projectId={projectId}
          sprint={editingSprint}
          onSuccess={() => {
            fetchSprintDetails();
            onSuccess();
          }}
        />
      )}
    </>
  );
}
