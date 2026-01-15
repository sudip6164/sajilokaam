import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Tag, Link2, MessageSquare, Eye, Paperclip, CheckCircle2, Plus, Trash2, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { 
  tasksApi, subtasksApi, taskDependenciesApi, taskLabelsApi, 
  taskCommentsApi, taskWatchersApi, taskAttachmentsApi, taskLinksApi 
} from '@/lib/api';
import { toast } from 'sonner';

interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: string;
  estimatedHours?: number;
  assigneeId?: number;
}

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  task: Task;
  allTasks: Task[];
  onSuccess: () => void;
}

export function TaskDetailModal({ isOpen, onClose, projectId, task, allTasks, onSuccess }: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'subtasks' | 'dependencies' | 'labels' | 'comments' | 'watchers' | 'attachments' | 'links'>('details');
  
  // Details form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number | undefined>(undefined);
  
  // Subtasks
  const [subtasks, setSubtasks] = useState<Array<{id: number; title: string; status: string}>>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  
  // Dependencies
  const [dependencies, setDependencies] = useState<Array<{id: number; dependsOnTaskId: number; dependsOnTaskTitle: string; dependencyType: string}>>([]);
  const [selectedDependencyTask, setSelectedDependencyTask] = useState('');
  
  // Labels
  const [availableLabels, setAvailableLabels] = useState<Array<{id: number; name: string; color: string}>>([]);
  const [taskLabels, setTaskLabels] = useState<number[]>([]);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#6366f1');
  
  // Comments
  const [comments, setComments] = useState<Array<{id: number; content: string; authorName: string; createdAt: string}>>([]);
  const [newComment, setNewComment] = useState('');
  
  // Watchers
  const [watchers, setWatchers] = useState<Array<{id: number; user: {fullName: string}}>>([]);
  const [isWatching, setIsWatching] = useState(false);
  
  // Attachments
  const [attachments, setAttachments] = useState<Array<{id: number; fileName: string; fileUrl: string; fileSize: number}>>([]);
  
  // Links
  const [links, setLinks] = useState<Array<{id: number; linkedTaskId: number; linkedTask: {title: string}; linkType: string}>>([]);
  const [selectedLinkTask, setSelectedLinkTask] = useState('');
  const [linkType, setLinkType] = useState('RELATES_TO');
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task && isOpen) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'TODO');
      setPriority(task.priority || 'MEDIUM');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setEstimatedHours(task.estimatedHours);
      fetchTaskData();
    }
  }, [task, isOpen]);

  const fetchTaskData = async () => {
    if (!task?.id) return;
    try {
      setLoading(true);
      const [
        subtasksData,
        dependenciesData,
        labelsData,
        commentsData,
        watchersData,
        attachmentsData,
        linksData,
        watchingData
      ] = await Promise.all([
        subtasksApi.list(task.id).catch(() => []),
        taskDependenciesApi.list(task.id).catch(() => []),
        taskLabelsApi.list().catch(() => []),
        taskCommentsApi.list(projectId, task.id).catch(() => []),
        taskWatchersApi.list(task.id).catch(() => []),
        taskAttachmentsApi.list(task.id).catch(() => []),
        taskLinksApi.list(task.id).catch(() => []),
        taskWatchersApi.check(task.id).catch(() => false),
      ]);

      setSubtasks(subtasksData);
      setDependencies(dependenciesData);
      setAvailableLabels(labelsData);
      setComments(commentsData);
      setWatchers(watchersData);
      setAttachments(attachmentsData);
      setLinks(linksData);
      setIsWatching(watchingData);
      
      // Get task labels from task object if available
      if ((task as any).labels) {
        setTaskLabels((task as any).labels.map((l: any) => l.id));
      }
    } catch (error) {
      console.error('Error fetching task data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async () => {
    if (!title.trim()) {
      toast.error('Task title is required');
      return;
    }

    setLoading(true);
    try {
      await tasksApi.update(projectId, task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: dueDate || undefined,
        estimatedHours: estimatedHours || undefined,
        labelIds: taskLabels,
      });
      toast.success('Task updated');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    try {
      await subtasksApi.create(task.id, { title: newSubtaskTitle.trim() });
      toast.success('Subtask added');
      setNewSubtaskTitle('');
      fetchTaskData();
    } catch (error: any) {
      toast.error('Failed to add subtask');
    }
  };

  const handleToggleSubtask = async (subtaskId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
    try {
      await subtasksApi.updateStatus(task.id, subtaskId, newStatus);
      fetchTaskData();
    } catch (error: any) {
      toast.error('Failed to update subtask');
    }
  };

  const handleDeleteSubtask = async (subtaskId: number) => {
    if (!confirm('Delete this subtask?')) return;
    try {
      await subtasksApi.delete(task.id, subtaskId);
      toast.success('Subtask deleted');
      fetchTaskData();
    } catch (error: any) {
      toast.error('Failed to delete subtask');
    }
  };

  const handleAddDependency = async () => {
    if (!selectedDependencyTask) return;
    try {
      await taskDependenciesApi.create(task.id, { 
        dependsOnTaskId: parseInt(selectedDependencyTask),
        dependencyType: 'BLOCKS'
      });
      toast.success('Dependency added');
      setSelectedDependencyTask('');
      fetchTaskData();
    } catch (error: any) {
      toast.error('Failed to add dependency');
    }
  };

  const handleDeleteDependency = async (dependencyId: number) => {
    try {
      await taskDependenciesApi.delete(task.id, dependencyId);
      toast.success('Dependency removed');
      fetchTaskData();
    } catch (error: any) {
      toast.error('Failed to remove dependency');
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    try {
      const label = await taskLabelsApi.create({ name: newLabelName.trim(), color: newLabelColor });
      setAvailableLabels([...availableLabels, label]);
      setTaskLabels([...taskLabels, label.id]);
      setNewLabelName('');
      toast.success('Label created and assigned');
    } catch (error: any) {
      toast.error('Failed to create label');
    }
  };

  const handleToggleLabel = async (labelId: number) => {
    const newLabels = taskLabels.includes(labelId)
      ? taskLabels.filter(id => id !== labelId)
      : [...taskLabels, labelId];
    setTaskLabels(newLabels);
    // Update task with new labels
    try {
      await tasksApi.update(projectId, task.id, { labelIds: newLabels });
      fetchTaskData();
    } catch (error: any) {
      toast.error('Failed to update labels');
      setTaskLabels(taskLabels); // Revert on error
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await taskCommentsApi.create(projectId, task.id, { content: newComment.trim() });
      toast.success('Comment added');
      setNewComment('');
      fetchTaskData();
    } catch (error: any) {
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await taskCommentsApi.delete(projectId, task.id, commentId);
      toast.success('Comment deleted');
      fetchTaskData();
    } catch (error: any) {
      toast.error('Failed to delete comment');
    }
  };

  const handleToggleWatch = async () => {
    try {
      if (isWatching) {
        await taskWatchersApi.remove(task.id);
        setIsWatching(false);
        toast.success('Stopped watching task');
      } else {
        await taskWatchersApi.add(task.id);
        setIsWatching(true);
        toast.success('Watching task');
      }
      fetchTaskData();
    } catch (error: any) {
      toast.error('Failed to update watch status');
    }
  };

  const handleUploadAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await taskAttachmentsApi.upload(projectId, task.id, file);
      toast.success('Attachment uploaded');
      fetchTaskData();
      e.target.value = '';
    } catch (error: any) {
      toast.error('Failed to upload attachment');
    }
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (!confirm('Delete this attachment?')) return;
    try {
      await taskAttachmentsApi.delete(projectId, task.id, attachmentId);
      toast.success('Attachment deleted');
      fetchTaskData();
    } catch (error: any) {
      toast.error('Failed to delete attachment');
    }
  };

  const handleAddLink = async () => {
    if (!selectedLinkTask) return;
    try {
      await taskLinksApi.create(task.id, { 
        linkedTaskId: parseInt(selectedLinkTask),
        linkType
      });
      toast.success('Task linked');
      setSelectedLinkTask('');
      fetchTaskData();
    } catch (error: any) {
      toast.error('Failed to link task');
    }
  };

  const handleDeleteLink = async (linkId: number) => {
    try {
      await taskLinksApi.delete(task.id, linkId);
      toast.success('Link removed');
      fetchTaskData();
    } catch (error: any) {
      toast.error('Failed to remove link');
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 flex-shrink-0">
          <CardTitle className="text-xl">{task.title}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        {/* Tabs */}
        <div className="border-b px-6 flex-shrink-0">
          <div className="flex gap-4 overflow-x-auto">
            {[
              { id: 'details', label: 'Details', icon: User },
              { id: 'subtasks', label: 'Subtasks', icon: CheckCircle2 },
              { id: 'dependencies', label: 'Dependencies', icon: Link2 },
              { id: 'labels', label: 'Labels', icon: Tag },
              { id: 'comments', label: 'Comments', icon: MessageSquare },
              { id: 'watchers', label: 'Watchers', icon: Eye },
              { id: 'attachments', label: 'Attachments', icon: Paperclip },
              { id: 'links', label: 'Links', icon: Link2 },
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
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <CardContent className="flex-1 overflow-y-auto p-6">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={estimatedHours || ''}
                    onChange={(e) => setEstimatedHours(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="mt-1"
                  />
                </div>
              </div>

              <Button onClick={handleUpdateTask} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}

          {/* Subtasks Tab */}
          {activeTab === 'subtasks' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add subtask..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                />
                <Button onClick={handleAddSubtask} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {subtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-center gap-2 p-2 border rounded">
                    <input
                      type="checkbox"
                      checked={subtask.status === 'DONE'}
                      onChange={() => handleToggleSubtask(subtask.id, subtask.status)}
                      className="h-4 w-4"
                    />
                    <span className={`flex-1 ${subtask.status === 'DONE' ? 'line-through text-muted-foreground' : ''}`}>
                      {subtask.title}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteSubtask(subtask.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {subtasks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No subtasks yet</p>
                )}
              </div>
            </div>
          )}

          {/* Dependencies Tab */}
          {activeTab === 'dependencies' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <select
                  value={selectedDependencyTask}
                  onChange={(e) => setSelectedDependencyTask(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                >
                  <option value="">Select task...</option>
                  {allTasks.filter(t => t.id !== task.id).map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
                <Button onClick={handleAddDependency} size="sm" disabled={!selectedDependencyTask}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {dependencies.map(dep => (
                  <div key={dep.id} className="flex items-center justify-between p-2 border rounded">
                    <span>Depends on: <strong>{dep.dependsOnTaskTitle}</strong></span>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteDependency(dep.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {dependencies.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No dependencies</p>
                )}
              </div>
            </div>
          )}

          {/* Labels Tab */}
          {activeTab === 'labels' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  placeholder="Label name"
                  className="flex-1"
                />
                <Input
                  type="color"
                  value={newLabelColor}
                  onChange={(e) => setNewLabelColor(e.target.value)}
                  className="w-20"
                />
                <Button onClick={handleCreateLabel} size="sm">
                  Create
                </Button>
              </div>
              <div className="space-y-2">
                {availableLabels.map(label => (
                  <div key={label.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Badge style={{ backgroundColor: label.color }}>{label.name}</Badge>
                    </div>
                    <input
                      type="checkbox"
                      checked={taskLabels.includes(label.id)}
                      onChange={() => handleToggleLabel(label.id)}
                      className="h-4 w-4"
                    />
                  </div>
                ))}
                {availableLabels.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No labels available</p>
                )}
              </div>
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="flex-1"
                />
              </div>
              <Button onClick={handleAddComment} size="sm" disabled={!newComment.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Comment
              </Button>
              <div className="space-y-3 mt-4">
                {comments.map(comment => (
                  <div key={comment.id} className="p-3 border rounded">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{comment.authorName}</p>
                        <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteComment(comment.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
                )}
              </div>
            </div>
          )}

          {/* Watchers Tab */}
          {activeTab === 'watchers' && (
            <div className="space-y-4">
              <Button onClick={handleToggleWatch} variant={isWatching ? 'destructive' : 'default'}>
                {isWatching ? 'Stop Watching' : 'Watch Task'}
              </Button>
              <div className="space-y-2">
                {watchers.map(watcher => (
                  <div key={watcher.id} className="p-2 border rounded">
                    <span>{watcher.user.fullName}</span>
                  </div>
                ))}
                {watchers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No watchers</p>
                )}
              </div>
            </div>
          )}

          {/* Attachments Tab */}
          {activeTab === 'attachments' && (
            <div className="space-y-4">
              <div>
                <input
                  type="file"
                  id="attachment-upload"
                  className="hidden"
                  onChange={handleUploadAttachment}
                />
                <Button onClick={() => document.getElementById('attachment-upload')?.click()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Attachment
                </Button>
              </div>
              <div className="space-y-2">
                {attachments.map(att => (
                  <div key={att.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="flex-1">{att.fileName}</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => window.open(att.fileUrl)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteAttachment(att.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {attachments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No attachments</p>
                )}
              </div>
            </div>
          )}

          {/* Links Tab */}
          {activeTab === 'links' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <select
                  value={selectedLinkTask}
                  onChange={(e) => setSelectedLinkTask(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                >
                  <option value="">Select task...</option>
                  {allTasks.filter(t => t.id !== task.id).map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
                <select
                  value={linkType}
                  onChange={(e) => setLinkType(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="RELATES_TO">Relates To</option>
                  <option value="DUPLICATES">Duplicates</option>
                  <option value="BLOCKS">Blocks</option>
                  <option value="IS_BLOCKED_BY">Is Blocked By</option>
                </select>
                <Button onClick={handleAddLink} size="sm" disabled={!selectedLinkTask}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {links.map(link => (
                  <div key={link.id} className="flex items-center justify-between p-2 border rounded">
                    <span>
                      <strong>{link.linkType}</strong>: {link.linkedTask.title}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteLink(link.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {links.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No links</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
