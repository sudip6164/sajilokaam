import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { useRouter } from './Router';
import { bidsApi, projectsApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  DollarSign,
  Clock,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Eye,
  ArrowLeft,
} from 'lucide-react';

interface Proposal {
  id: number;
  jobId?: number;
  jobTitle?: string;
  freelancerId: number;
  freelancerName: string;
  freelancerEmail: string;
  amount: number;
  message?: string;
  proposal?: string;
  status: string;
  createdAt: string;
}

export function ProposalsListPage() {
  const { navigate, pageParams } = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [jobTitle, setJobTitle] = useState<string>('');

  useEffect(() => {
    const jobId = pageParams?.jobId;
    if (!jobId) {
      setError('Job ID not provided');
      setLoading(false);
      return;
    }

    fetchProposals(jobId);
  }, [pageParams?.jobId]);

  const fetchProposals = async (jobId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await bidsApi.listByJob(jobId);
      setProposals(data as any[]);
      
      // Get job title from first proposal if available
      if (data && data.length > 0 && (data[0] as any).jobTitle) {
        setJobTitle((data[0] as any).jobTitle);
      }
    } catch (err: any) {
      console.error('Error fetching proposals:', err);
      setError('Failed to load proposals');
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptProposal = async (proposalId: number, jobTitle?: string) => {
    try {
      setAccepting(true);
      
      // Create project from accepted bid
      const project = await bidsApi.accept(proposalId, {
        title: jobTitle || 'New Project',
        description: 'Project created from accepted proposal'
      });
      
      toast.success('Proposal accepted! Redirecting to project page...');
      
      // Navigate to project detail page if project ID is available
      if (project && project.id) {
        setTimeout(() => {
          // Note: project-detail page needs to be implemented to work with projectId
          navigate('client-dashboard'); // Fallback to dashboard for now
          toast.info('Project created successfully! View it in your Active Projects.');
        }, 1500);
      } else {
        navigate('client-dashboard');
      }
    } catch (err: any) {
      console.error('Error accepting proposal:', err);
      toast.error(err.response?.data?.message || 'Failed to accept proposal');
    } finally {
      setAccepting(false);
    }
  };

  const handleRejectProposal = async (proposalId: number) => {
    if (!pageParams?.jobId) return;
    
    try {
      setRejecting(proposalId);
      await bidsApi.reject(pageParams.jobId, proposalId);
      toast.success('Proposal rejected');
      
      // Refresh proposals
      await fetchProposals(pageParams.jobId);
    } catch (err: any) {
      console.error('Error rejecting proposal:', err);
      toast.error(err.response?.data?.message || 'Failed to reject proposal');
    } finally {
      setRejecting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64" />
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Error Loading Proposals</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => navigate('client-dashboard')}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-8 overflow-hidden">
        <div className="max-w-6xl mx-auto overflow-hidden">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('client-dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold mb-2">Proposals</h1>
            <p className="text-muted-foreground text-lg">
              {proposals.length} proposal{proposals.length !== 1 ? 's' : ''} received
            </p>
          </div>

          {proposals.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Proposals Yet</h3>
                <p className="text-muted-foreground">
                  Freelancers haven't submitted any proposals for this job yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 overflow-hidden">
              {proposals.map((proposal) => (
                <Card key={proposal.id} className="border-2 hover:border-primary/50 transition-colors overflow-hidden">
                  <CardContent className="p-6 overflow-hidden">
                    <div className="flex items-start justify-between gap-4 mb-4 overflow-hidden">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarFallback>
                            {proposal.freelancerName?.charAt(0) || 'F'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="flex items-center gap-2 mb-1 overflow-hidden">
                            <h3 className="text-xl font-semibold truncate">
                              {proposal.freelancerName || 'Freelancer'}
                            </h3>
                            <span className="text-sm text-muted-foreground flex-shrink-0">• Proposal #{proposal.id}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 break-words overflow-wrap-anywhere">
                            {proposal.freelancerEmail}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Submitted {formatDate(proposal.createdAt)}</span>
                            </div>
                            <Badge variant={
                              proposal.status === 'ACCEPTED' ? 'default' :
                              proposal.status === 'REJECTED' ? 'destructive' :
                              'secondary'
                            }>
                              {proposal.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-2xl font-bold text-primary mb-1">
                          <DollarSign className="h-6 w-6" />
                          <span>Rs. {proposal.amount.toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Bid Amount</p>
                      </div>
                    </div>

                    {/* Proposal Text */}
                    <div className="mb-4 p-4 bg-muted rounded-lg overflow-hidden">
                      <p className="text-sm font-semibold mb-2">Cover Letter:</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', maxWidth: '100%' }}>
                        {proposal.message || proposal.proposal || 'No cover letter provided'}
                      </p>
                    </div>

                    {/* Actions */}
                    {proposal.status === 'PENDING' && (
                      <div className="flex gap-3">
                        <Button
                          className="flex-1 bg-gradient-to-r from-primary to-secondary"
                          onClick={() => handleAcceptProposal(proposal.id, jobTitle)}
                          disabled={accepting || rejecting !== null}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {accepting ? 'Accepting...' : 'Accept Proposal'}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleRejectProposal(proposal.id)}
                          disabled={accepting || rejecting !== null}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          {rejecting === proposal.id ? 'Rejecting...' : 'Reject'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedProposal(proposal)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    )}
                    
                    {proposal.status === 'ACCEPTED' && (
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-semibold">Proposal Accepted - Project Created</span>
                      </div>
                    )}

                    {proposal.status === 'REJECTED' && (
                      <div className="flex items-center gap-2 text-destructive">
                        <XCircle className="h-5 w-5" />
                        <span className="font-semibold">Proposal Rejected</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
