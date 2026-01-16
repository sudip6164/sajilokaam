import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { jobsApi, projectsApi, bidsApi, invoicesApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Briefcase, FileText, DollarSign } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export function ClientAnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    spendingTrend: [] as Array<{ month: string; amount: number }>,
    projectStatus: [] as Array<{ name: string; value: number }>,
    jobTrends: [] as Array<{ month: string; posted: number; proposals: number }>,
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
      const [jobsData, projectsData] = await Promise.all([
        jobsApi.list({ clientId: userId }),
        projectsApi.list({ clientId: userId }),
      ]);

      const jobs = jobsData || [];
      const projects = projectsData || [];
      const completedProjects = projects.filter((p: any) => p.status === 'COMPLETED');
      const activeProjects = projects.filter((p: any) => p.status === 'IN_PROGRESS' || p.status === 'ACTIVE');
      const pendingPaymentProjects = projects.filter((p: any) => p.status === 'PENDING_PAYMENT');

      // Prepare chart data
      const now = new Date();
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(date.toLocaleDateString('en-US', { month: 'short' }));
      }

      // Spending trend (last 6 months)
      const spendingTrend = months.map((month, idx) => {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - idx) + 1, 0);
        const monthProjects = completedProjects.filter((p: any) => {
          if (!p.completedAt) return false;
          const completedDate = new Date(p.completedAt);
          return completedDate >= monthStart && completedDate <= monthEnd;
        });
        return {
          month,
          amount: monthProjects.reduce((sum: number, p: any) => sum + (p.budget || 0), 0),
        };
      });

      // Project status distribution
      const projectStatus = [
        { name: 'Active', value: activeProjects.length },
        { name: 'Completed', value: completedProjects.length },
        { name: 'Pending Payment', value: pendingPaymentProjects.length },
        { name: 'Cancelled', value: projects.filter((p: any) => p.status === 'CANCELLED').length },
      ].filter(item => item.value > 0);

      // Job trends (last 6 months) - fetch proposal counts
      const jobTrends = await Promise.all(
        months.map(async (month, idx) => {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - idx) + 1, 0);
          const monthJobs = jobs.filter((j: any) => {
            if (!j.createdAt) return false;
            const createdDate = new Date(j.createdAt);
            return createdDate >= monthStart && createdDate <= monthEnd;
          });
          
          let totalProposals = 0;
          for (const job of monthJobs) {
            try {
              const bids = await bidsApi.listByJob(job.id);
              totalProposals += bids?.length || 0;
            } catch (err) {
              // Ignore errors
            }
          }
          
          return {
            month,
            posted: monthJobs.length,
            proposals: totalProposals,
          };
        })
      );

      setChartData({
        spendingTrend,
        projectStatus,
        jobTrends,
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
        <p className="text-muted-foreground">Insights into your projects, jobs, and spending</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Spending Trend (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.spendingTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `Rs. ${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} name="Amount Spent" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Project Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.projectStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.projectStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Job Posting Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Job Posting & Proposals Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData.jobTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="posted" fill="#3b82f6" name="Jobs Posted" />
                <Bar dataKey="proposals" fill="#10b981" name="Total Proposals" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
