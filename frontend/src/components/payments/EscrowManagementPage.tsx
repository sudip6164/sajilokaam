import { useState, useEffect } from 'react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Lock,
  Unlock,
  Shield,
  DollarSign,
  ArrowRight,
  Calendar,
  User
} from 'lucide-react';
import { escrowApi, projectsApi } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function EscrowManagementPage() {
  const { hasRole } = useAuth();
  const [escrowAccounts, setEscrowAccounts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  const isClient = hasRole('CLIENT');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsData] = await Promise.all([
        projectsApi.list(),
      ]);
      setProjects(projectsData);

      // Fetch escrow for each project
      const escrowPromises = projectsData.map((project: any) =>
        escrowApi.getByProject(project.id).catch(() => [])
      );
      const escrowResults = await Promise.all(escrowPromises);
      const allEscrow = escrowResults.flat();
      setEscrowAccounts(allEscrow);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load escrow data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalEscrow = () => {
    return escrowAccounts.reduce((sum, account) => sum + (account.balance || 0), 0);
  };

  const calculateTotalHeld = () => {
    return escrowAccounts
      .filter(a => a.status === 'HELD')
      .reduce((sum, account) => sum + (account.balance || 0), 0);
  };

  const calculateTotalReleased = () => {
    return escrowAccounts.reduce((sum, account) => sum + (account.totalReleased || 0), 0);
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      HELD: 'secondary',
      RELEASED: 'default',
      REFUNDED: 'outline',
    };

    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-16">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Escrow Management</h1>
            <p className="text-gray-600 mt-1">
              Securely hold and release funds for your projects
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total in Escrow</p>
                    <p className="text-2xl font-bold text-primary mt-2">
                      Rs. {calculateTotalEscrow().toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Currently Held</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-2">
                      Rs. {calculateTotalHeld().toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <Lock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Released</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      Rs. {calculateTotalReleased().toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <Unlock className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Banner */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900">How Escrow Works</p>
                  <p className="text-sm text-blue-700 mt-1">
                    <strong>For Clients:</strong> Deposit funds to escrow at project start. Funds
                    are held securely and released to the freelancer upon milestone completion.
                    <br />
                    <strong>For Freelancers:</strong> Funds are automatically transferred to your
                    account when the client releases them from escrow.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create Escrow Button (Client Only) */}
          {isClient && (
            <Button onClick={() => setDepositModalOpen(true)}>
              <Lock className="h-4 w-4 mr-2" />
              Deposit to Escrow
            </Button>
          )}

          {/* Escrow Accounts List */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Escrow Accounts ({escrowAccounts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8 text-gray-500">Loading escrow accounts...</p>
              ) : escrowAccounts.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-900">No escrow accounts</p>
                  <p className="text-gray-600 mt-1">
                    {isClient
                      ? 'Create an escrow account to securely hold project funds'
                      : 'Escrow accounts created by clients will appear here'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {escrowAccounts.map((account) => (
                    <Card key={account.id} className="border hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="font-semibold text-lg text-gray-900">
                                {account.project?.title || 'Project'}
                              </h3>
                              {getStatusBadge(account.status)}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Balance</p>
                                <p className="font-semibold text-gray-900 text-lg">
                                  Rs. {account.balance?.toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Initial Amount</p>
                                <p className="font-semibold text-gray-900">
                                  Rs. {account.initialAmount?.toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Released</p>
                                <p className="font-semibold text-green-600">
                                  Rs. {account.totalReleased?.toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Created</p>
                                <p className="font-semibold text-gray-900">
                                  {new Date(account.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          {isClient && account.balance > 0 && account.status === 'HELD' && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedAccount(account);
                                setReleaseModalOpen(true);
                              }}
                            >
                              <Unlock className="h-4 w-4 mr-2" />
                              Release Funds
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      {/* Deposit Modal */}
      <DepositModal
        open={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        projects={projects}
        onSuccess={fetchData}
      />

      {/* Release Modal */}
      <ReleaseModal
        open={releaseModalOpen}
        onClose={() => setReleaseModalOpen(false)}
        account={selectedAccount}
        onSuccess={fetchData}
      />
    </div>
  );
}

// Deposit Modal Component
function DepositModal({ open, onClose, projects, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    projectId: '',
    amount: '',
    clientId: '',
    freelancerId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.projectId || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const project = projects.find((p: any) => p.id === parseInt(formData.projectId));

      await escrowApi.create({
        projectId: parseInt(formData.projectId),
        amount: parseFloat(formData.amount),
        clientId: project.clientId,
        freelancerId: project.freelancerId,
      });

      toast.success('Escrow account created successfully');
      onClose();
      onSuccess();
      setFormData({ projectId: '', amount: '', clientId: '', freelancerId: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create escrow account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deposit to Escrow</DialogTitle>
          <DialogDescription>
            Securely hold funds for a project until milestones are completed
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="project">Project *</Label>
            <select
              id="project"
              className="w-full border rounded-md p-2"
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              required
            >
              <option value="">Select project</option>
              {projects.map((project: any) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="amount">Amount (Rs.) *</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              min="0"
              step="0.01"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Deposit to Escrow'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Release Modal Component
function ReleaseModal({ open, onClose, account, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: account?.balance || '',
    notes: '',
  });

  useEffect(() => {
    if (account) {
      setFormData({ amount: account.balance, notes: '' });
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount) {
      toast.error('Please enter an amount');
      return;
    }

    if (formData.amount > account.balance) {
      toast.error('Amount cannot exceed balance');
      return;
    }

    try {
      setLoading(true);

      await escrowApi.release(account.id, {
        amount: parseFloat(formData.amount.toString()),
        releaseType: 'MILESTONE',
        notes: formData.notes,
      });

      toast.success('Funds released successfully');
      onClose();
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to release funds');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Release Escrow Funds</DialogTitle>
          <DialogDescription>
            Release funds from escrow to the freelancer
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Available Balance</p>
            <p className="text-2xl font-bold text-gray-900">
              Rs. {account?.balance?.toFixed(2)}
            </p>
          </div>

          <div>
            <Label htmlFor="releaseAmount">Amount to Release (Rs.) *</Label>
            <Input
              id="releaseAmount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              min="0"
              max={account?.balance}
              step="0.01"
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add a note about this release..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Releasing...' : 'Release Funds'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
