import { useState, useEffect } from 'react';
import { AdminDashboardLayout } from './AdminDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { SimpleModal } from './SimpleModal';
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  UserX,
  UserCheck,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  DollarSign
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function FreelancerManagementPage() {
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedFreelancer, setSelectedFreelancer] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    console.log('viewModalOpen state changed to:', viewModalOpen);
  }, [viewModalOpen]);

  useEffect(() => {
    console.log('deleteModalOpen state changed to:', deleteModalOpen);
  }, [deleteModalOpen]);

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getFreelancers();
      setFreelancers(data);
    } catch (error: any) {
      console.error('Error fetching freelancers:', error);
      toast.error('Failed to load freelancers');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId: number, suspend: boolean) => {
    try {
      console.log('Suspending user:', userId, suspend);
      await adminApi.updateUserStatus(userId, suspend ? 'SUSPENDED' : 'ACTIVE');
      toast.success(`User ${suspend ? 'suspended' : 'activated'} successfully`);
      fetchFreelancers();
    } catch (error: any) {
      console.error('Error suspending user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedFreelancer) return;
    try {
      console.log('Deleting user:', selectedFreelancer.id);
      await adminApi.deleteUser(selectedFreelancer.id);
      toast.success('Freelancer deleted successfully');
      setDeleteModalOpen(false);
      setSelectedFreelancer(null);
      fetchFreelancers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete freelancer');
    }
  };

  const filteredFreelancers = freelancers.filter((freelancer) => {
    const matchesSearch =
      freelancer.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'verified' && freelancer.profile?.status === 'APPROVED') ||
      (filterStatus === 'pending' && freelancer.profile?.status === 'PENDING') ||
      (filterStatus === 'suspended' && freelancer.status === 'SUSPENDED');

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const variants: any = {
      APPROVED: 'default',
      PENDING: 'secondary',
      REJECTED: 'destructive',
      NEEDS_UPDATE: 'outline',
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  return (
    <AdminDashboardLayout activePage="freelancers">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Freelancer Management</h1>
            <p className="text-gray-600 mt-1">Manage all freelancers on the platform</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Freelancers</p>
            <p className="text-2xl font-bold text-primary">{freelancers.length}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'verified' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('verified')}
                >
                  Verified
                </Button>
                <Button
                  variant={filterStatus === 'pending' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('pending')}
                >
                  Pending
                </Button>
                <Button
                  variant={filterStatus === 'suspended' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('suspended')}
                >
                  Suspended
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Freelancers Table */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>All Freelancers ({filteredFreelancers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Freelancer</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Rate</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredFreelancers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        No freelancers found
                      </td>
                    </tr>
                  ) : (
                    filteredFreelancers.map((freelancer) => (
                      <tr key={freelancer.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={freelancer.profile?.profilePictureUrl} />
                              <AvatarFallback>{freelancer.fullName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{freelancer.fullName}</p>
                              <p className="text-sm text-gray-500">{freelancer.profile?.headline || 'No headline'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {freelancer.email}
                            </p>
                            {freelancer.profile?.locationCity && (
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <MapPin className="h-3 w-3" />
                                {freelancer.profile.locationCity}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {freelancer.profile?.hourlyRate ? (
                            <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              Rs. {freelancer.profile.hourlyRate}/hr
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500">Not set</p>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(freelancer.profile?.status || 'PENDING')}
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-600">
                            {new Date(freelancer.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  console.log('View clicked for:', freelancer);
                                  setSelectedFreelancer(freelancer);
                                  console.log('Setting viewModalOpen to true');
                                  setViewModalOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {freelancer.status === 'SUSPENDED' ? (
                                <DropdownMenuItem
                                  onClick={() => handleSuspendUser(freelancer.id, false)}
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleSuspendUser(freelancer.id, true)}
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Suspend User
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  console.log('Delete clicked for:', freelancer);
                                  setSelectedFreelancer(freelancer);
                                  console.log('Setting deleteModalOpen to true');
                                  setDeleteModalOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Details Modal */}
      <SimpleModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Freelancer Details"
        size="xl"
      >
        {selectedFreelancer && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedFreelancer.profile?.profilePictureUrl} />
                  <AvatarFallback className="text-2xl">
                    {selectedFreelancer.fullName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedFreelancer.fullName}</h3>
                  <p className="text-gray-600">{selectedFreelancer.profile?.headline}</p>
                  {getStatusBadge(selectedFreelancer.profile?.status || 'PENDING')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Email</p>
                  <p className="text-gray-900">{selectedFreelancer.email}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Hourly Rate</p>
                  <p className="text-gray-900">
                    Rs. {selectedFreelancer.profile?.hourlyRate || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Location</p>
                  <p className="text-gray-900">
                    {selectedFreelancer.profile?.locationCity || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Joined</p>
                  <p className="text-gray-900">
                    {new Date(selectedFreelancer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedFreelancer.profile?.overview && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Overview</p>
                  <p className="text-gray-900 text-sm">{selectedFreelancer.profile.overview}</p>
                </div>
              )}

              {selectedFreelancer.profile?.primarySkills && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFreelancer.profile.primarySkills.split(',').map((skill: string, idx: number) => (
                      <Badge key={idx} variant="secondary">{skill.trim()}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
        )}
      </SimpleModal>

      {/* Delete Confirmation Modal */}
      <SimpleModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Freelancer"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{selectedFreelancer?.fullName}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete
            </Button>
          </div>
        </div>
      </SimpleModal>
    </AdminDashboardLayout>
  );
}
