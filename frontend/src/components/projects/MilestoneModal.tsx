import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { milestonesApi } from '@/lib/api';
import { toast } from 'sonner';

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  milestone?: {
    id: number;
    title: string;
    dueDate?: string;
  } | null;
  onSuccess: () => void;
}

export function MilestoneModal({ isOpen, onClose, projectId, milestone, onSuccess }: MilestoneModalProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (milestone) {
      setTitle(milestone.title);
      setDueDate(milestone.dueDate ? milestone.dueDate.split('T')[0] : '');
    } else {
      setTitle('');
      setDueDate('');
    }
  }, [milestone, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setLoading(true);
    try {
      if (milestone) {
        await milestonesApi.update(projectId, milestone.id, { title, dueDate: dueDate || undefined });
        toast.success('Milestone updated');
      } else {
        await milestonesApi.create(projectId, { title, dueDate: dueDate || undefined });
        toast.success('Milestone created');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save milestone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {milestone ? 'Edit Milestone' : 'Create Milestone'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Milestone title"
              required
            />
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : milestone ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
