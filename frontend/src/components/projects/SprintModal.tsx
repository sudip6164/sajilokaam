import { useState, useEffect } from 'react';
import { X, Calendar, Target, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { sprintsApi } from '@/lib/api';
import { toast } from 'sonner';

interface Sprint {
  id?: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  goal?: string;
  status: string;
}

interface SprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  sprint?: Sprint | null;
  onSuccess: () => void;
}

export function SprintModal({ isOpen, onClose, projectId, sprint, onSuccess }: SprintModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [goal, setGoal] = useState('');
  const [status, setStatus] = useState('PLANNED');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sprint) {
      setName(sprint.name || '');
      setDescription(sprint.description || '');
      setStartDate(sprint.startDate ? new Date(sprint.startDate).toISOString().split('T')[0] : '');
      setEndDate(sprint.endDate ? new Date(sprint.endDate).toISOString().split('T')[0] : '');
      setGoal(sprint.goal || '');
      setStatus(sprint.status || 'PLANNED');
    } else {
      // Set default dates (2 weeks from today)
      const today = new Date();
      const twoWeeksLater = new Date(today);
      twoWeeksLater.setDate(today.getDate() + 14);
      setStartDate(today.toISOString().split('T')[0]);
      setEndDate(twoWeeksLater.toISOString().split('T')[0]);
      setName('');
      setDescription('');
      setGoal('');
      setStatus('PLANNED');
    }
  }, [sprint, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Sprint name is required');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Start and end dates are required');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    setLoading(true);
    try {
      if (sprint?.id) {
        await sprintsApi.update(projectId, sprint.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          startDate,
          endDate,
          goal: goal.trim() || undefined,
          status,
        });
        toast.success('Sprint updated');
      } else {
        await sprintsApi.create(projectId, {
          name: name.trim(),
          description: description.trim() || undefined,
          startDate,
          endDate,
          goal: goal.trim() || undefined,
        });
        toast.success('Sprint created');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save sprint');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {sprint ? 'Edit Sprint' : 'Create Sprint'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Sprint Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sprint 1 - User Authentication"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will this sprint focus on?"
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="goal">Sprint Goal</Label>
              <Textarea
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="What is the main objective of this sprint?"
                className="mt-1"
                rows={2}
              />
            </div>

            {sprint?.id && (
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="PLANNED">Planned</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  sprint ? 'Update Sprint' : 'Create Sprint'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
