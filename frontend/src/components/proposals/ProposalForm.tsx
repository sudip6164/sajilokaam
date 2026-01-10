import { useState } from 'react';
import { DollarSign, Clock, FileText, Paperclip, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface ProposalFormProps {
  jobTitle: string;
  jobBudget?: { type: 'fixed' | 'hourly'; amount: number; max?: number };
  onSubmit: (proposal: ProposalData) => void;
  onCancel: () => void;
}

export interface ProposalData {
  coverLetter: string;
  bidAmount: number;
  bidType: 'fixed' | 'hourly';
  deliveryTime: number;
  deliveryUnit: 'days' | 'weeks' | 'months';
  attachments: File[];
  milestones?: Array<{
    description: string;
    amount: number;
    dueDate: string;
  }>;
}

export function ProposalForm({ jobTitle, jobBudget, onSubmit, onCancel }: ProposalFormProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const [bidAmount, setBidAmount] = useState<number>(jobBudget?.amount || 0);
  const [bidType, setBidType] = useState<'fixed' | 'hourly'>(jobBudget?.type || 'fixed');
  const [deliveryTime, setDeliveryTime] = useState(7);
  const [deliveryUnit, setDeliveryUnit] = useState<'days' | 'weeks' | 'months'>('days');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [useMilestones, setUseMilestones] = useState(false);
  const [milestones, setMilestones] = useState<Array<{
    description: string;
    amount: number;
    dueDate: string;
  }>>([
    { description: '', amount: 0, dueDate: '' },
  ]);

  const platformFee = bidAmount * 0.1; // 10% platform fee
  const youllReceive = bidAmount - platformFee;

  const handleAddMilestone = () => {
    setMilestones([...milestones, { description: '', amount: 0, dueDate: '' }]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index: number, field: string, value: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      coverLetter,
      bidAmount,
      bidType,
      deliveryTime,
      deliveryUnit,
      attachments,
      milestones: useMilestones ? milestones : undefined,
    });
  };

  const isValid = coverLetter.trim().length >= 100 && bidAmount > 0 && deliveryTime > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl border border-border max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold">Submit Proposal</h2>
            <p className="text-sm text-muted-foreground mt-1">{jobTitle}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Cover Letter */}
            <div>
              <label className="block font-semibold mb-2">
                Cover Letter <span className="text-destructive">*</span>
              </label>
              <p className="text-sm text-muted-foreground mb-3">
                Introduce yourself and explain why you're the best fit for this project
              </p>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Dear Client,&#10;&#10;I am excited to apply for this project because..."
                rows={8}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex items-center justify-between mt-2">
                <p className={`text-sm ${
                  coverLetter.length >= 100 ? 'text-success' : 'text-muted-foreground'
                }`}>
                  {coverLetter.length} / 100 characters minimum
                </p>
                {coverLetter.length >= 100 && (
                  <div className="flex items-center gap-1 text-success text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>Good length</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bid Amount */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2">
                  Your Bid <span className="text-destructive">*</span>
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setBidType('fixed')}
                      className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                        bidType === 'fixed'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      Fixed Price
                    </button>
                    <button
                      type="button"
                      onClick={() => setBidType('hourly')}
                      className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                        bidType === 'hourly'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      Hourly Rate
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">Rs.</span>
                    <input
                      type="number"
                      value={bidAmount || ''}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full pl-14 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  {jobBudget && (
                    <p className="text-sm text-muted-foreground">
                      Client's budget: Rs. {jobBudget.amount.toLocaleString()}
                      {jobBudget.max ? ` - Rs. ${jobBudget.max.toLocaleString()}` : ''}
                      {jobBudget.type === 'hourly' ? '/hr' : ''}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Delivery Time <span className="text-destructive">*</span>
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="number"
                      value={deliveryTime || ''}
                      onChange={(e) => setDeliveryTime(Number(e.target.value))}
                      placeholder="7"
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <select
                    value={deliveryUnit}
                    onChange={(e) => setDeliveryUnit(e.target.value as 'days' | 'weeks' | 'months')}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Earnings Breakdown */}
            <div className="p-4 rounded-lg bg-muted space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Your bid</span>
                <span className="font-semibold">Rs. {bidAmount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Platform fee (10%)</span>
                <span>-Rs. {platformFee.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="font-semibold">You'll receive</span>
                <span className="text-xl font-bold text-success">Rs. {youllReceive.toLocaleString()}</span>
              </div>
            </div>

            {/* Milestones (Optional) */}
            {bidType === 'fixed' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="font-semibold">
                    Milestones (Optional)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useMilestones}
                      onChange={(e) => setUseMilestones(e.target.checked)}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm">Use milestones</span>
                  </label>
                </div>

                {useMilestones && (
                  <div className="space-y-3">
                    {milestones.map((milestone, index) => (
                      <div key={index} className="p-4 rounded-lg border border-border space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Milestone {index + 1}</span>
                          {milestones.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMilestone(index)}
                              className="text-destructive hover:bg-destructive/10 p-1 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={milestone.description}
                          onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                          placeholder="Milestone description"
                          className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="number"
                            value={milestone.amount || ''}
                            onChange={(e) => handleMilestoneChange(index, 'amount', Number(e.target.value))}
                            placeholder="Amount"
                            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <input
                            type="date"
                            value={milestone.dueDate}
                            onChange={(e) => handleMilestoneChange(index, 'dueDate', e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddMilestone}
                      className="w-full"
                    >
                      Add Milestone
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Attachments */}
            <div>
              <label className="block font-semibold mb-2">
                Attachments (Optional)
              </label>
              <p className="text-sm text-muted-foreground mb-3">
                Attach relevant files like portfolio samples, certificates, or work examples
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="proposal-files"
              />
              <label
                htmlFor="proposal-files"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors"
              >
                <Paperclip className="h-5 w-5" />
                <span>Click to upload files</span>
              </label>
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024).toFixed(2)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                        className="text-destructive hover:bg-destructive/10 p-1 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Warning */}
            {!isValid && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-600 mb-1">Before submitting:</p>
                  <ul className="list-disc list-inside space-y-1 text-yellow-600/80">
                    {coverLetter.length < 100 && (
                      <li>Write at least 100 characters in your cover letter</li>
                    )}
                    {bidAmount <= 0 && <li>Enter your bid amount</li>}
                    {deliveryTime <= 0 && <li>Specify delivery time</li>}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-border bg-background">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid} size="lg">
              Submit Proposal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
