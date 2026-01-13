import { useState, useEffect } from 'react';
import { AdminDashboardLayout } from './AdminDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Search,
  Eye,
  UserX,
  UserCheck,
  MoreVertical,
  Mail,
  MapPin,
  Briefcase,
  Trash2,
  Building2
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

export function ClientManagementPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    console.log('viewModalOpen state changed to:', viewModalOpen);
  }, [viewModalOpen]);

  useEffect(() => {
    console.log('deleteModalOpen state changed to:', deleteModalOpen);
  }, [deleteModalOpen]);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getClients();
      setClients(data);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId: number, suspend: boolean) => {
    try {
      console.log('Suspending user:', userId, suspend);
      await adminApi.updateUserStatus(userId, suspend ? 'SUSPENDED' : 'ACTIVE');
      toast.success(`User ${suspend ? 'suspended' : 'activated'} successfully`);
      fetchClients();
    } catch (error: any) {
      console.error('Error suspending user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedClient) return;
    try {
      console.log('Deleting user:', selectedClient.id);
      await adminApi.deleteUser(selectedClient.id);
      toast.success('Client deleted successfully');
      setDeleteModalOpen(false);
      setSelectedClient(null);
      fetchClients();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete client');
    }
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.profile?.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'verified' && client.profile?.status === 'APPROVED') ||
      (filterStatus === 'pending' && client.profile?.status === 'PENDING') ||
      (filterStatus === 'suspended' && client.status === 'SUSPENDED');

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
    <AdminDashboardLayout activePage="clients">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
            <p className="text-gray-600 mt-1">Manage all clients on the platform</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Clients</p>
            <p className="text-2xl font-bold text-primary">{clients.length}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or company..."
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

        {/* Clients Table */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>All Clients ({filteredClients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Company</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
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
                  ) : filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        No clients found
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => (
                      <tr key={client.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={client.profile?.profilePictureUrl} />
                              <AvatarFallback>{client.fullName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{client.fullName}</p>
                              <p className="text-sm text-gray-500">{client.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {client.profile?.companyName || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {client.profile?.companySize || 'Size not specified'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {client.email}
                            </p>
                            {client.profile?.locationCity && (
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <MapPin className="h-3 w-3" />
                                {client.profile.locationCity}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(client.profile?.status || 'PENDING')}
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-600">
                            {new Date(client.createdAt).toLocaleDateString()}
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
                                  console.log('View clicked for client:', client);
                                  setSelectedClient(client);
                                  console.log('Setting viewModalOpen to true');
                                  setViewModalOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {client.status === 'SUSPENDED' ? (
                                <DropdownMenuItem
                                  onClick={() => handleSuspendUser(client.id, false)}
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleSuspendUser(client.id, true)}
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Suspend User
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedClient(client);
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
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen} modal={true}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto z-[9999]">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
            <DialogDescription>View complete information about this client</DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedClient.profile?.profilePictureUrl} />
                  <AvatarFallback className="text-2xl">
                    {selectedClient.fullName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedClient.fullName}</h3>
                  <p className="text-gray-600">{selectedClient.profile?.companyName}</p>
                  {getStatusBadge(selectedClient.profile?.status || 'PENDING')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Email</p>
                  <p className="text-gray-900">{selectedClient.email}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Company Size</p>
                  <p className="text-gray-900">
                    {selectedClient.profile?.companySize || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Location</p>
                  <p className="text-gray-900">
                    {selectedClient.profile?.locationCity || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Joined</p>
                  <p className="text-gray-900">
                    {new Date(selectedClient.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {selectedClient.profile?.companyWebsite && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Website</p>
                    <a
                      href={selectedClient.profile.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {selectedClient.profile.companyWebsite}
                    </a>
                  </div>
                )}
                {selectedClient.profile?.industry && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Industry</p>
                    <p className="text-gray-900">{selectedClient.profile.industry}</p>
                  </div>
                )}
              </div>

              {selectedClient.profile?.description && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Company Description</p>
                  <p className="text-gray-900 text-sm">{selectedClient.profile.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete {selectedClient?.fullName}? This action cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminDashboardLayout>
  );
}
