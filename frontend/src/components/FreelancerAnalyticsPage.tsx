import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { projectsApi, bidsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Briefcase, FileText } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export function FreelancerAnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    earningsTrend: [] as Array<{ month: string; earnings: number }>,
    proposalStatus: [] as Array<{ name: string; value: number }>,
    projectCompletion: [] as Array<{ month: string; completed: number; active: number }>,
  });

  useEffect(() => {
    if (user?.id) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const userId = user?.id;

      // Fetch all data
      const [projectsData, bidsData] = await Promise.all([
        projectsApi.list({ freelancerId: userId }),
        bidsApi.list({ freelancerId: userId }),
      ]);

      const projects = projectsData || [];
      const bids = bidsData || [];
      const completedProjects = projects.filter((p: any) => p.status === 'COMPLETED');

      // Prepare chart data
      const now = new Date();
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(date.toLocaleDateString('en-US', { month: 'short' }));
      }

      // Earnings trend (last 6 months)
      const earningsTrend = months.map((month, idx) => {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - idx) + 1, 0);
        const monthProjects = completedProjects.filter((p: any) => {
          if (!p.completedAt) return false;
          const completedDate = new Date(p.completedAt);
          return completedDate >= monthStart && completedDate <= monthEnd;
        });
        return {
          month,
          earnings: monthProjects.reduce((sum: number, p: any) => sum + (p.budget || 0), 0),
        };
      });

      // Proposal status distribution
      const proposalStatus = [
        { name: 'Accepted', value: bids.filter((b: any) => b.status === 'ACCEPTED').length },
        { name: 'Pending', value: bids.filter((b: any) => b.status === 'PENDING' || b.status === 'UNDER_REVIEW').length },
        { name: 'Rejected', value: bids.filter((b: any) => b.status === 'REJECTED').length },
      ].filter(item => item.value > 0);

      // Project completion trend
      const projectCompletion = months.map((month, idx) => {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - idx) + 1, 0);
        const monthCompleted = completedProjects.filter((p: any) => {
          if (!p.completedAt) return false;
          const completedDate = new Date(p.completedAt);
          return completedDate >= monthStart && completedDate <= monthEnd;
        }).length;
        const monthActive = projects.filter((p: any) => {
          if (!p.createdAt) return false;
          const createdDate = new Date(p.createdAt);
          return createdDate >= monthStart && createdDate <= monthEnd && (p.status === 'IN_PROGRESS' || p.status === 'ACTIVE');
        }).length;
        return {
          month,
          completed: monthCompleted,
          active: monthActive,
        };
      });

      setChartData({
        earningsTrend,
        proposalStatus,
        projectCompletion,
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Analytics</h1>
        <p className="text-muted-foreground">Track your earnings, proposals, and project performance</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Earnings Trend (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.earningsTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `Rs. ${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} name="Earnings" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Proposal Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Proposal Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.proposalStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.proposalStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Completion Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Project Activity Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData.projectCompletion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Completed Projects" />
                <Bar dataKey="active" fill="#3b82f6" name="Active Projects" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
