import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useRouter } from './Router';
import { jobsApi, bidsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  DollarSign, 
  Clock, 
  FileText, 
  Paperclip, 
  AlertCircle, 
  CheckCircle,
  ArrowLeft,
  Calendar
} from 'lucide-react';

export function SubmitProposalPage() {
  const { navigate, pageParams } = useRouter();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [job, setJob] = useState<any>(null);
  
  // Form state
  const [coverLetter, setCoverLetter] = useState('');
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [deliveryTime, setDeliveryTime] = useState(7);
  const [deliveryUnit, setDeliveryUnit] = useState<'days' | 'weeks' | 'months'>('days');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('login');
      return;
    }

    const jobId = pageParams?.jobId;
    if (!jobId) {
      toast.error('Job ID not provided');
      navigate('find-work');
      return;
    }

    fetchJob(jobId);
  }, [pageParams, isAuthenticated]);

  const fetchJob = async (jobId: number) => {
    try {
      const jobData = await jobsApi.get(jobId);
      setJob(jobData);
      
      // Set default bid amount based on job budget
      if (jobData.budgetMax) {
        setBidAmount(jobData.budgetMax);
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job details');
      navigate('find-work');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (coverLetter.trim().length < 100) {
      toast.error('Cover letter must be at least 100 characters');
      return;
    }

    if (bidAmount <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    if (deliveryTime <= 0) {
      toast.error('Please enter a valid delivery time');
      return;
    }

    setSubmitting(true);

    try {
      await bidsApi.create(job.id, {
        amount: bidAmount,
        message: coverLetter,
        status: 'PENDING'
      });

      toast.success('Proposal submitted successfully!');
      navigate('freelancer-dashboard');
    } catch (error: any) {
      console.error('Error submitting proposal:', error);
      toast.error(error.response?.data?.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-16">
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
                <Button onClick={() => navigate('find-work')}>
                  Back to Jobs
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const platformFee = bidAmount * 0.1; // 10% platform fee
  const youllReceive = bidAmount - platformFee;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('job-detail', { jobId: job.id })}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Job
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-2xl">Submit Proposal</CardTitle>
                  <p className="text-muted-foreground mt-1">{job.title}</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Cover Letter */}
                    <div>
                      <label className="block font-semibold mb-2">
                        Cover Letter <span className="text-destructive">*</span>
                      </label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Introduce yourself and explain why you're the best fit for this project (minimum 100 characters)
                      </p>
                      <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        className="w-full min-h-[200px] p-4 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none resize-none"
                        placeholder="Dear Client,&#10;&#10;I am excited to submit my proposal for this project..."
                        required
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-sm ${coverLetter.length < 100 ? 'text-destructive' : 'text-success'}`}>
                          {coverLetter.length} / 100 characters minimum
                        </span>
                        {coverLetter.length >= 100 && (
                          <CheckCircle className="h-4 w-4 text-success" />
                        )}
                      </div>
                    </div>

                    {/* Bid Amount */}
                    <div>
                      <label className="block font-semibold mb-2">
                        Your Bid Amount <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">Rs.</span>
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(parseFloat(e.target.value) || 0)}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Client's budget: Rs. {job.budgetMin?.toLocaleString() || '0'} - Rs. {job.budgetMax?.toLocaleString() || '0'}
                      </p>
                    </div>

                    {/* Delivery Time */}
                    <div>
                      <label className="block font-semibold mb-2">
                        Delivery Time <span className="text-destructive">*</span>
                      </label>
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <input
                            type="number"
                            value={deliveryTime}
                            onChange={(e) => setDeliveryTime(parseInt(e.target.value) || 0)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                            placeholder="7"
                            min="1"
                            required
                          />
                        </div>
                        <select
                          value={deliveryUnit}
                          onChange={(e) => setDeliveryUnit(e.target.value as any)}
                          className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none bg-background"
                        >
                          <option value="days">Days</option>
                          <option value="weeks">Weeks</option>
                          <option value="months">Months</option>
                        </select>
                      </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-6 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('job-detail', { jobId: job.id })}
                        className="flex-1"
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-primary to-secondary"
                        disabled={submitting || coverLetter.length < 100 || bidAmount <= 0}
                      >
                        {submitting ? 'Submitting...' : 'Submit Proposal'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Earnings Breakdown */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Earnings Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bid Amount</span>
                    <span className="font-semibold">Rs. {bidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-destructive">
                    <span>Platform Fee (10%)</span>
                    <span>- Rs. {platformFee.toLocaleString()}</span>
                  </div>
                  <div className="pt-3 border-t flex justify-between text-lg">
                    <span className="font-semibold">You'll Receive</span>
                    <span className="font-bold text-success">Rs. {youllReceive.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="border-2 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Tips for Success
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <p>Write a personalized cover letter addressing the client's specific needs</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <p>Highlight relevant experience and similar projects you've completed</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <p>Be realistic with your timeline and budget</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <p>Proofread your proposal before submitting</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
