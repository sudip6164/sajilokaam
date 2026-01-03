import { useState } from 'react';
import { FileText, Calendar, DollarSign, Clock, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface ContractCreationProps {
  jobTitle: string;
  freelancerName: string;
  onSubmit: (contract: ContractData) => void;
  onCancel: () => void;
}

export interface ContractData {
  title: string;
  description: string;
  paymentType: 'fixed' | 'hourly';
  amount: number;
  hourlyRate?: number;
  estimatedHours?: number;
  startDate: string;
  endDate: string;
  milestones?: Array<{
    title: string;
    description: string;
    amount: number;
    dueDate: string;
  }>;
  terms: string;
}

export function ContractCreation({ jobTitle, freelancerName, onSubmit, onCancel }: ContractCreationProps) {
  const [title, setTitle] = useState(jobTitle);
  const [description, setDescription] = useState('');
  const [paymentType, setPaymentType] = useState<'fixed' | 'hourly'>('fixed');
  const [amount, setAmount] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(0);
  const [estimatedHours, setEstimatedHours] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [terms, setTerms] = useState(`This contract is entered into between the Client and ${freelancerName} (the Freelancer) for the following work:\n\n1. SCOPE OF WORK\nThe Freelancer agrees to complete the work as described in this contract.\n\n2. PAYMENT TERMS\nPayment will be made according to the milestones or hourly rate specified in this contract.\n\n3. TIMELINE\nWork will be completed by the dates specified in the milestones.\n\n4. INTELLECTUAL PROPERTY\nAll work product created under this contract will be owned by the Client upon full payment.\n\n5. CONFIDENTIALITY\nBoth parties agree to keep confidential information private.\n\n6. TERMINATION\nEither party may terminate this contract with 7 days written notice.`);

  const [milestones, setMilestones] = useState<Array<{
    title: string;
    description: string;
    amount: number;
    dueDate: string;
  }>>([
    { title: '', description: '', amount: 0, dueDate: '' }
  ]);

  const handleAddMilestone = () => {
    setMilestones([...milestones, { title: '', description: '', amount: 0, dueDate: '' }]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index: number, field: string, value: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      paymentType,
      amount: paymentType === 'fixed' ? amount : estimatedHours * hourlyRate,
      hourlyRate: paymentType === 'hourly' ? hourlyRate : undefined,
      estimatedHours: paymentType === 'hourly' ? estimatedHours : undefined,
      startDate,
      endDate,
      milestones: paymentType === 'fixed' && milestones[0].title ? milestones : undefined,
      terms,
    });
  };

  const isValid = title && description && startDate && endDate && 
    (paymentType === 'fixed' ? amount > 0 : (hourlyRate > 0 && estimatedHours > 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-card rounded-xl border border-border max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold">Create Contract</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Define the terms and conditions for this project
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2">
                  Contract Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., Website Development Contract"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Freelancer
                </label>
                <input
                  type="text"
                  value={freelancerName}
                  disabled
                  className="w-full px-4 py-3 rounded-lg border border-border bg-muted"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold mb-2">
                Project Description <span className="text-destructive">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the scope of work, deliverables, and expectations..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Payment Type */}
            <div>
              <label className="block font-semibold mb-3">
                Payment Type <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentType('fixed')}
                  className={`flex-1 p-4 rounded-lg border transition-all ${
                    paymentType === 'fixed'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">Fixed Price</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    One-time payment for the entire project
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('hourly')}
                  className={`flex-1 p-4 rounded-lg border transition-all ${
                    paymentType === 'hourly'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">Hourly Rate</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pay based on tracked hours
                  </p>
                </button>
              </div>
            </div>

            {/* Payment Details */}
            {paymentType === 'fixed' ? (
              <div>
                <label className="block font-semibold mb-2">
                  Total Project Amount <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="number"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold mb-2">
                    Hourly Rate <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="number"
                      value={hourlyRate || ''}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-2">
                    Estimated Hours <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    value={estimatedHours || ''}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {/* Estimated Total for Hourly */}
            {paymentType === 'hourly' && hourlyRate > 0 && estimatedHours > 0 && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Estimated Total</span>
                  <span className="text-2xl font-bold text-primary">
                    ${(hourlyRate * estimatedHours).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on {estimatedHours} hours at ${hourlyRate}/hour
                </p>
              </div>
            )}

            {/* Timeline */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2">
                  Start Date <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-2">
                  End Date <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Milestones (Fixed Price Only) */}
            {paymentType === 'fixed' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="font-semibold">Milestones</label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddMilestone}>
                    Add Milestone
                  </Button>
                </div>
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
                        value={milestone.title}
                        onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                        placeholder="Milestone title"
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <textarea
                        value={milestone.description}
                        onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                        placeholder="Milestone description"
                        rows={2}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          value={milestone.amount || ''}
                          onChange={(e) => handleMilestoneChange(index, 'amount', Number(e.target.value))}
                          placeholder="Amount ($)"
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
                </div>
              </div>
            )}

            {/* Terms & Conditions */}
            <div>
              <label className="block font-semibold mb-2">
                Terms & Conditions
              </label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              />
            </div>

            {/* Warning */}
            {!isValid && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-600 mb-1">Please complete all required fields</p>
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
              <FileText className="h-4 w-4 mr-2" />
              Create Contract
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
