import { useState } from 'react';
import { 
  Users, Briefcase, DollarSign, TrendingUp, Search, Filter, 
  MoreVertical, CheckCircle, XCircle, AlertTriangle, Eye, Ban, Shield 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Header } from '../Header';

interface DashboardStats {
  totalUsers: number;
  activeProjects: number;
  totalRevenue: number;
  platformFees: number;
  pendingVerifications: number;
  reportedIssues: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  type: 'freelancer' | 'client';
  status: 'active' | 'suspended' | 'pending';
  joinDate: string;
  totalProjects: number;
  totalEarnings?: number;
  totalSpent?: number;
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'projects' | 'reports'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'freelancer' | 'client'>('all');

  const stats: DashboardStats = {
    totalUsers: 15480,
    activeProjects: 342,
    totalRevenue: 2450000,
    platformFees: 245000,
    pendingVerifications: 28,
    reportedIssues: 12,
  };

  const recentUsers: User[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      type: 'freelancer',
      status: 'active',
      joinDate: '2024-01-15',
      totalProjects: 24,
      totalEarnings: 45680,
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.c@email.com',
      type: 'client',
      status: 'active',
      joinDate: '2024-01-10',
      totalProjects: 8,
      totalSpent: 32400,
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'emily.r@email.com',
      type: 'freelancer',
      status: 'pending',
      joinDate: '2024-01-18',
      totalProjects: 0,
    },
    {
      id: 4,
      name: 'David Kim',
      email: 'david.k@email.com',
      type: 'freelancer',
      status: 'suspended',
      joinDate: '2023-11-05',
      totalProjects: 15,
      totalEarnings: 28900,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <Header />
      
      <div className="p-6">
        <div className="max-w-screen-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Platform management and analytics</p>
            </div>
            <Button className="bg-gradient-to-r from-primary to-secondary">
              <Shield className="h-4 w-4 mr-2" />
              Admin Actions
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Briefcase className="h-5 w-5 text-secondary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Active Projects</p>
              <p className="text-2xl font-bold">{stats.activeProjects}</p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-success/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-success" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-2xl font-bold">${(stats.totalRevenue / 1000).toFixed(0)}K</p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-success/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Platform Fees</p>
              <p className="text-2xl font-bold">${(stats.platformFees / 1000).toFixed(0)}K</p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Pending Verifications</p>
              <p className="text-2xl font-bold">{stats.pendingVerifications}</p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Reported Issues</p>
              <p className="text-2xl font-bold">{stats.reportedIssues}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border">
            <div className="flex gap-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'users', label: 'Users' },
                { id: 'projects', label: 'Projects' },
                { id: 'reports', label: 'Reports' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 border-b-2 transition-colors font-medium ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Users Tab Content */}
          {activeTab === 'users' && (
            <div className="bg-card rounded-xl border border-border">
              {/* Search & Filter */}
              <div className="flex items-center gap-4 p-6 border-b border-border">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Users</option>
                  <option value="freelancer">Freelancers</option>
                  <option value="client">Clients</option>
                </select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-sm font-semibold">User</th>
                      <th className="text-left p-4 text-sm font-semibold">Type</th>
                      <th className="text-left p-4 text-sm font-semibold">Status</th>
                      <th className="text-left p-4 text-sm font-semibold">Join Date</th>
                      <th className="text-left p-4 text-sm font-semibold">Projects</th>
                      <th className="text-right p-4 text-sm font-semibold">Earnings/Spent</th>
                      <th className="text-right p-4 text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={
                            user.type === 'freelancer' ? 'border-primary text-primary' : 'border-secondary text-secondary'
                          }>
                            {user.type}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={user.status === 'active' ? 'default' : 'outline'}
                            className={
                              user.status === 'active' ? 'bg-success' :
                              user.status === 'pending' ? 'border-yellow-500 text-yellow-500' :
                              'border-destructive text-destructive'
                            }
                          >
                            {user.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(user.joinDate).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-sm">{user.totalProjects}</td>
                        <td className="p-4 text-right font-semibold">
                          ${((user.totalEarnings || user.totalSpent || 0) / 1000).toFixed(1)}K
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Ban className="h-4 w-4 text-destructive" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-bold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { action: 'New user registered', user: 'John Doe', time: '5 minutes ago', type: 'success' },
                    { action: 'Project completed', user: 'Sarah Johnson', time: '15 minutes ago', type: 'success' },
                    { action: 'Payment processed', user: 'Michael Chen', time: '1 hour ago', type: 'info' },
                    { action: 'Issue reported', user: 'Emily Rodriguez', time: '2 hours ago', type: 'warning' },
                    { action: 'User suspended', user: 'Admin', time: '3 hours ago', type: 'danger' },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'success' ? 'bg-success' :
                        activity.type === 'warning' ? 'bg-yellow-500' :
                        activity.type === 'danger' ? 'bg-destructive' : 'bg-primary'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user} • {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Freelancers */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-bold mb-4">Top Freelancers</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Sarah Johnson', earnings: 45680, projects: 24, rating: 4.9 },
                    { name: 'Michael Chen', earnings: 38200, projects: 18, rating: 4.8 },
                    { name: 'Emily Rodriguez', earnings: 32400, projects: 15, rating: 4.7 },
                    { name: 'David Kim', earnings: 28900, projects: 12, rating: 4.9 },
                  ].map((freelancer, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {freelancer.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{freelancer.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {freelancer.projects} projects • {freelancer.rating} ★
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-success">
                        ${(freelancer.earnings / 1000).toFixed(1)}K
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}