import { useState, useEffect } from 'react';
import { AdminDashboardLayout } from './AdminDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Mail,
  MapPin,
  Briefcase,
  DollarSign,
  Building2,
  ExternalLink
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

export function VerificationQueuePage() {
  const [pendingFreelancers, setPendingFreelancers] = useState<any[]>([]);
  const [pendingClients, setPendingClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('freelancers');
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | 'needs_update'>('approve');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const [freelancers, clients] = await Promise.all([
        adminApi.getPendingFreelancers(),
        adminApi.getPendingClients(),
      ]);
      setPendingFreelancers(freelancers);
      setPendingClients(clients);
    } catch (error: any) {
      console.error('Error fetching pending verifications:', error);
      toast.error('Failed to load pending verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationAction = async () => {
    if (!selectedProfile) return;
    
    try {
      const status = action === 'approve' ? 'APPROVED' : action === 'reject' ? 'REJECTED' : 'NEEDS_UPDATE';
      await adminApi.updateProfileVerification(selectedProfile.id, selectedProfile.type, {
        status,
        notes: notes || undefined,
      });
      
      toast.success(`Profile ${status.toLowerCase()} successfully`);
      setActionModalOpen(false);
      setNotes('');
      fetchPendingVerifications();
    } catch (error) {
      toast.error(`Failed to ${action} profile`);
    }
  };

  const FreelancerCard = ({ freelancer }: { freelancer: any }) => (
    <Card className="border-2 hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <Avatar className="h-16 w-16">
              <AvatarImage src={freelancer.profile?.profilePictureUrl} />
              <AvatarFallback>{freelancer.fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-gray-900">{freelancer.fullName}</h3>
                <Badge variant="secondary">Pending</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">{freelancer.profile?.headline || 'No headline'}</p>
              
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {freelancer.email}
                </span>
                {freelancer.profile?.locationCity && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {freelancer.profile.locationCity}
                  </span>
                )}
                {freelancer.profile?.hourlyRate && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Rs. {freelancer.profile.hourlyRate}/hr
                  </span>
                )}
              </div>

              {freelancer.profile?.primarySkills && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {freelancer.profile.primarySkills.split(',').slice(0, 5).map((skill: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {skill.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedProfile({ ...freelancer, type: 'freelancer' });
                setViewModalOpen(true);
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setSelectedProfile({ ...freelancer, type: 'freelancer' });
                setAction('approve');
                setActionModalOpen(true);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedProfile({ ...freelancer, type: 'freelancer' });
                setAction('needs_update');
                setActionModalOpen(true);
              }}
              className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Request Update
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                setSelectedProfile({ ...freelancer, type: 'freelancer' });
                setAction('reject');
                setActionModalOpen(true);
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ClientCard = ({ client }: { client: any }) => (
    <Card className="border-2 hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <Avatar className="h-16 w-16">
              <AvatarImage src={client.profile?.profilePictureUrl} />
              <AvatarFallback>{client.fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-gray-900">{client.fullName}</h3>
                <Badge variant="secondary">Pending</Badge>
              </div>
              {client.profile?.companyName && (
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-600">{client.profile.companyName}</p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {client.email}
                </span>
                {client.profile?.locationCity && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {client.profile.locationCity}
                  </span>
                )}
                {client.profile?.companySize && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {client.profile.companySize}
                  </span>
                )}
              </div>

              {client.profile?.industry && (
                <Badge variant="outline" className="mt-3">
                  {client.profile.industry}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedProfile({ ...client, type: 'client' });
                setViewModalOpen(true);
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setSelectedProfile({ ...client, type: 'client' });
                setAction('approve');
                setActionModalOpen(true);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedProfile({ ...client, type: 'client' });
                setAction('needs_update');
                setActionModalOpen(true);
              }}
              className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Request Update
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                setSelectedProfile({ ...client, type: 'client' });
                setAction('reject');
                setActionModalOpen(true);
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminDashboardLayout activePage="verification">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Verification Queue</h1>
          <p className="text-gray-600 mt-1">Review and approve pending profile verifications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Freelancers</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{pendingFreelancers.length}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Clients</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{pendingClients.length}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="freelancers">
              Freelancers ({pendingFreelancers.length})
            </TabsTrigger>
            <TabsTrigger value="clients">
              Clients ({pendingClients.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="freelancers" className="space-y-4 mt-6">
            {loading ? (
              <p className="text-center py-8 text-gray-500">Loading...</p>
            ) : pendingFreelancers.length === 0 ? (
              <Card className="border-2">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-900">All caught up!</p>
                  <p className="text-gray-600 mt-1">No pending freelancer verifications</p>
                </CardContent>
              </Card>
            ) : (
              pendingFreelancers.map((freelancer) => (
                <FreelancerCard key={freelancer.id} freelancer={freelancer} />
              ))
            )}
          </TabsContent>

          <TabsContent value="clients" className="space-y-4 mt-6">
            {loading ? (
              <p className="text-center py-8 text-gray-500">Loading...</p>
            ) : pendingClients.length === 0 ? (
              <Card className="border-2">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-900">All caught up!</p>
                  <p className="text-gray-600 mt-1">No pending client verifications</p>
                </CardContent>
              </Card>
            ) : (
              pendingClients.map((client) => (
                <ClientCard key={client.id} client={client} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profile Details</DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedProfile.profile?.profilePictureUrl} />
                  <AvatarFallback className="text-2xl">
                    {selectedProfile.fullName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedProfile.fullName}</h3>
                  <p className="text-gray-600">{selectedProfile.email}</p>
                  <Badge variant="secondary" className="mt-1">
                    {selectedProfile.type === 'freelancer' ? 'Freelancer' : 'Client'}
                  </Badge>
                </div>
              </div>

              {selectedProfile.profile?.overview && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Overview/Description</p>
                  <p className="text-sm text-gray-900">{selectedProfile.profile.overview || selectedProfile.profile.description}</p>
                </div>
              )}

              {/* More profile details can be added here */}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Modal */}
      <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approve Profile' : action === 'reject' ? 'Reject Profile' : 'Request Update'}
            </DialogTitle>
            <DialogDescription>
              {action === 'approve'
                ? 'This will approve the profile and allow the user to access the platform.'
                : action === 'reject'
                ? 'This will reject the profile. Please provide a reason.'
                : 'Request updates to the profile. Please specify what needs to be changed.'}
            </DialogDescription>
          </DialogHeader>
          
          {(action === 'reject' || action === 'needs_update') && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {action === 'reject' ? 'Rejection Reason' : 'Update Requirements'} *
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={action === 'reject' ? 'Provide reason for rejection...' : 'Specify what needs to be updated...'}
                rows={4}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleVerificationAction}
              disabled={(action !== 'approve' && !notes.trim())}
              className={
                action === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : action === 'reject'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }
            >
              {action === 'approve' ? 'Approve' : action === 'reject' ? 'Reject' : 'Request Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminDashboardLayout>
  );
}
