import { useState, useEffect } from 'react';
import { AdminDashboardLayout } from './AdminDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Search, Shield, Mail, Calendar } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';

export function AdminManagementPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAdmins();
      setAdmins(data);
    } catch (error: any) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <AdminDashboardLayout activePage="admins">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
            <p className="text-gray-600 mt-1">View all administrators (Read-only)</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Shield className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">View Only Mode</span>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">Administrator Information</p>
                <p className="text-sm text-blue-700 mt-1">
                  This page displays all platform administrators. Admin accounts can only be
                  created, modified, or deleted through direct database access or system-level
                  operations for security reasons.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Admins List */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>All Administrators ({filteredAdmins.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-center py-8 text-gray-500">Loading...</p>
              ) : filteredAdmins.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No administrators found</p>
              ) : (
                filteredAdmins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 bg-primary">
                        <AvatarFallback className="bg-primary text-white text-lg">
                          {admin.fullName?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{admin.fullName}</p>
                          <Badge variant="default" className="bg-purple-600">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {admin.email}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Joined {new Date(admin.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="border-green-600 text-green-600">
                        Active
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Admins</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{admins.length}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Admins</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{admins.length}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Security Level</p>
                  <p className="text-2xl font-bold text-primary mt-2">Maximum</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
